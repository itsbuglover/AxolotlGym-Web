// ==========================================================================
// Reconocimiento facial en el navegador, compatible con la app Android.
//
// Hace lo mismo que ReconocedorFacial.kt + CapturaFacial.kt de la app:
//   - Detecta rostros (MediaPipe BlazeFace; la app usa ML Kit) y toma el mas cercano.
//   - Recorta el rostro, lo escala a 112x112 y lo pasa por MobileFaceNet
//     (el MISMO archivo mobilefacenet.tflite de la app) -> vector de 192 numeros.
//   - Junta 3 muestras consistentes y manda el promedio normalizado.
// La base de datos (acceso_por_rostro) compara ese vector con rostros_clientes.
// No se guarda ninguna foto: solo viaja el vector.
// ==========================================================================
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-cpu";
import * as tflite from "@tensorflow/tfjs-tflite";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

export const DIMENSION = 192;
const TAM = 112;

// Mismos valores que CapturaFacial.kt
const MUESTRAS_NECESARIAS = 3;
const TAMANO_MINIMO = 0.25; // el rostro debe ocupar al menos 25% del ancho del cuadro
const CONSISTENCIA = 0.8;
const SEGUNDA_PERSONA = 0.8; // otra cara casi igual de grande = no se adivina quien es
const GIRO_MAXIMO = 18; // grados (inclinacion de la cabeza)
const GIRO_LATERAL_MAXIMO = 0.25; // desvio de la nariz respecto a los ojos (aprox. 18°)

// La app recorta con la caja de ML Kit y aqui la caja es de MediaPipe (mas ajustada a la cara).
// MobileFaceNet es sensible al recorte (5% de desplazamiento baja mucho la similitud), asi que
// se calculan varias versiones del recorte y la pantalla las prueba en orden hasta que una
// coincide (un NO_RECONOCIDO no registra nada en la base). Escala = tamaño de la caja,
// dy = desplazamiento vertical (negativo = hacia la frente), ambos relativos a la caja.
export const RECORTES = [
  { escala: 1.0, dy: 0 },
  { escala: 1.15, dy: -0.05 },
  { escala: 1.3, dy: -0.08 },
];

export const INDICACION = {
  camara: "Colócate frente a la cámara",
  centrar: "Centra tu rostro en el recuadro",
  quieto: "No te muevas",
  mirar: "Mira a la cámara",
  listo: "Listo. Puedes retirarte de la cámara",
  unaPersona: "Solo una persona frente a la cámara",
  acercate: "Acércate a la cámara",
  verificando: "Verificando…",
};

// ---------- Utilidades de vectores (iguales a la app) ----------
export function normalizar(v) {
  let s = 0;
  for (const x of v) s += x * x;
  const n = Math.sqrt(s);
  return n > 0 ? v.map((x) => x / n) : v;
}
export function promedio(muestras) {
  const r = new Float32Array(DIMENSION);
  for (const m of muestras) for (let i = 0; i < DIMENSION; i++) r[i] += m[i];
  return normalizar(r);
}
export function similitud(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

// ---------- Carga de modelos (una sola vez) ----------
let cargaModelos = null;
export function cargarModelos() {
  if (!cargaModelos) {
    cargaModelos = (async () => {
      await tf.setBackend("cpu");
      tflite.setWasmPath("/tflite/");
      const [modelo, vision] = await Promise.all([
        tflite.loadTFLiteModel("/models/mobilefacenet.tflite"),
        FilesetResolver.forVisionTasks("/mediapipe"),
      ]);
      const crearDetector = (delegate) =>
        FaceDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "/models/blaze_face_short_range.tflite", delegate },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.5,
        });
      // GPU si se puede; si no, CPU
      const detector = await crearDetector("GPU").catch(() => crearDetector("CPU"));
      return { modelo, detector };
    })().catch((e) => {
      cargaModelos = null; // permite reintentar
      throw e;
    });
  }
  return cargaModelos;
}

// ---------- Vector de un rostro ----------
const lienzo = document.createElement("canvas");
lienzo.width = TAM;
lienzo.height = TAM;
const ctx = lienzo.getContext("2d", { willReadFrequently: true });

/** Caja ajustada segun el recorte y recortada a los limites del cuadro (como Rect.intersect en la app). */
function ajustar(caja, { escala, dy }, ancho, alto) {
  const w = caja.w * escala, h = caja.h * escala;
  const x1 = Math.max(0, caja.x + caja.w / 2 - w / 2);
  const y1 = Math.max(0, caja.y + caja.h / 2 - h / 2 + dy * caja.h);
  const x2 = Math.min(ancho, caja.x + caja.w / 2 + w / 2);
  const y2 = Math.min(alto, caja.y + caja.h / 2 + h / 2 + dy * caja.h);
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

/** Vector normalizado del rostro que esta en `caja` (pixeles del video). */
function vector(modelo, video, caja) {
  if (caja.w < 8 || caja.h < 8) throw new Error("Rostro fuera de la imagen");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(video, caja.x, caja.y, caja.w, caja.h, 0, 0, TAM, TAM);
  const { data } = ctx.getImageData(0, 0, TAM, TAM);

  const entrada = new Float32Array(TAM * TAM * 3);
  for (let i = 0, j = 0; i < data.length; i += 4) {
    entrada[j++] = (data[i] - 127.5) / 128; // R
    entrada[j++] = (data[i + 1] - 127.5) / 128; // G
    entrada[j++] = (data[i + 2] - 127.5) / 128; // B
  }
  const salida = tf.tidy(() => {
    const t = tf.tensor4d(entrada, [1, TAM, TAM, 3]);
    const r = modelo.predict(t); // Tensor, Tensor[] o { nombre: Tensor }
    const out = r instanceof tf.Tensor ? r : Array.isArray(r) ? r[0] : Object.values(r)[0];
    return out.dataSync();
  });
  return normalizar(Float32Array.from(salida));
}

// ---------- Seguimiento simple (ML Kit da un trackingId; MediaPipe no) ----------
function iou(a, b) {
  const x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  return inter / (a.w * a.h + b.w * b.h - inter);
}

/** Inclinacion (roll) y giro lateral (yaw aprox.) a partir de ojos y nariz. */
function orientacion(keypoints, ancho, alto) {
  if (!keypoints || keypoints.length < 3) return { roll: 0, yaw: 0 };
  const [ojoD, ojoI, nariz] = keypoints.map((k) => ({ x: k.x * ancho, y: k.y * alto }));
  const dx = ojoI.x - ojoD.x, dy = ojoI.y - ojoD.y;
  const distOjos = Math.hypot(dx, dy) || 1;
  const roll = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
  const medio = { x: (ojoD.x + ojoI.x) / 2, y: (ojoD.y + ojoI.y) / 2 };
  // proyeccion de la nariz sobre la linea de los ojos
  const yaw = ((nariz.x - medio.x) * dx + (nariz.y - medio.y) * dy) / (distOjos * distOjos);
  return { roll: Math.min(roll, 180 - roll), yaw: Math.abs(yaw) };
}

/**
 * Equivalente a CapturaFacial.kt. Llamar `procesar(video)` en cada cuadro.
 * Regresa { tipo: "indicacion", texto, progreso } o { tipo: "listo", vectores } con un vector
 * por cada recorte de RECORTES (en el mismo orden).
 */
export class CapturaFacial {
  constructor({ modelo, detector }) {
    this.modelo = modelo;
    this.detector = detector;
    this.siguienteId = 1;
    this.rostroActual = null; // { id, caja }
    this.rostroProcesado = null;
    this.muestras = []; // cada muestra = [vector por recorte]
    this.ultimoTs = 0;
  }

  reiniciar() {
    this.muestras = [];
  }
  /** El rostro actual ya se atendio: no se vuelve a enviar mientras siga frente a la camara. */
  marcarProcesado() {
    this.rostroProcesado = this.rostroActual?.id ?? null;
    this.reiniciar();
  }
  /** Permite volver a capturar al mismo rostro (p. ej. si fallo la red o no se reconocio). */
  olvidarProcesado() {
    this.rostroProcesado = null;
  }

  procesar(video) {
    const ancho = video.videoWidth, alto = video.videoHeight;
    if (!ancho || !alto) return { tipo: "indicacion", texto: INDICACION.camara, progreso: 0 };

    const ts = Math.max(performance.now(), this.ultimoTs + 1);
    this.ultimoTs = ts;
    const rostros = this.detector.detectForVideo(video, ts).detections.map((d) => ({
      caja: { x: d.boundingBox.originX, y: d.boundingBox.originY, w: d.boundingBox.width, h: d.boundingBox.height },
      keypoints: d.keypoints,
    }));

    // El mas cercano a la camara es el que se ve mas grande
    rostros.sort((a, b) => b.caja.w * b.caja.h - a.caja.w * a.caja.h);
    const cara = rostros[0];
    if (!cara) {
      this.rostroProcesado = null; // ya se retiro
      this.rostroActual = null;
      this.reiniciar();
      return { tipo: "indicacion", texto: INDICACION.camara, progreso: 0 };
    }

    // ¿Es la misma persona del cuadro anterior?
    const id =
      this.rostroActual && iou(this.rostroActual.caja, cara.caja) > 0.3 ? this.rostroActual.id : this.siguienteId++;
    if (id !== this.rostroActual?.id) this.reiniciar();
    this.rostroActual = { id, caja: cara.caja };

    if (id === this.rostroProcesado) return { tipo: "indicacion", texto: INDICACION.listo, progreso: 1 };

    const area = (r) => r.caja.w * r.caja.h;
    if (rostros[1] && area(rostros[1]) > area(cara) * SEGUNDA_PERSONA) {
      this.reiniciar();
      return { tipo: "indicacion", texto: INDICACION.unaPersona, progreso: 0 };
    }
    const c = cara.caja;
    if (c.w < ancho * TAMANO_MINIMO) {
      this.reiniciar();
      return { tipo: "indicacion", texto: INDICACION.acercate, progreso: 0 };
    }
    if (c.x < 0 || c.y < 0 || c.x + c.w > ancho || c.y + c.h > alto) {
      this.reiniciar();
      return { tipo: "indicacion", texto: INDICACION.centrar, progreso: 0 };
    }
    const { roll, yaw } = orientacion(cara.keypoints, ancho, alto);
    if (roll > GIRO_MAXIMO || yaw > GIRO_LATERAL_MAXIMO) {
      this.reiniciar();
      return { tipo: "indicacion", texto: INDICACION.mirar, progreso: 0 };
    }

    try {
      this.muestras.push(RECORTES.map((r) => vector(this.modelo, video, ajustar(c, r, ancho, alto))));
    } catch {
      return { tipo: "indicacion", texto: INDICACION.centrar, progreso: 0 };
    }
    if (this.muestras.length < MUESTRAS_NECESARIAS) {
      return { tipo: "indicacion", texto: INDICACION.quieto, progreso: this.muestras.length / MUESTRAS_NECESARIAS };
    }

    const vectores = RECORTES.map((_, i) => promedio(this.muestras.map((m) => m[i])));
    // Si alguna muestra salio muy distinta (movimiento, otra persona) se repite
    const consistente = this.muestras.every((m) => similitud(m[0], vectores[0]) >= CONSISTENCIA);
    this.reiniciar();
    if (!consistente) return { tipo: "indicacion", texto: INDICACION.quieto, progreso: 0 };
    return { tipo: "listo", vectores: vectores.map((v) => Array.from(v)) };
  }
}
