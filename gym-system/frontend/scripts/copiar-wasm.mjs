// Copia los archivos WebAssembly de TensorFlow Lite y MediaPipe a public/
// para servirlos desde la propia web (sin depender de CDNs). Corre solo antes de dev y build.
import { cpSync, mkdirSync } from "node:fs";

const copias = [
  ["node_modules/@tensorflow/tfjs-tflite/wasm", "public/tflite"],
  ["node_modules/@mediapipe/tasks-vision/wasm", "public/mediapipe"],
];
for (const [origen, destino] of copias) {
  mkdirSync(destino, { recursive: true });
  cpSync(origen, destino, { recursive: true });
}
console.log("WASM de reconocimiento facial copiado a public/");
