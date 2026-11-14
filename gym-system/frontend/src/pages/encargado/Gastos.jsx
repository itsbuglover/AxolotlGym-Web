import { useEffect, useState } from "react";
import api from "../../api/api.js";
import Table from "../../components/ui/Table.jsx";
import Boton from "../../components/ui/Boton.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Input from "../../components/ui/Input.jsx";

// ---------- Validaciones ----------
const LETRAS = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ";
const REGEX_LETRAS = new RegExp(`^[${LETRAS}]+( [${LETRAS}]+)*$`);
const REGEX_TEXTO = new RegExp(`^[${LETRAS}0-9]+( [${LETRAS}0-9]+)*$`);

const limpiarLetras = (v) =>
  v.replace(new RegExp(`[^${LETRAS} ]`, "g"), "").replace(/^\s+/, "").replace(/\s{2,}/g, " ");
const limpiarTexto = (v) =>
  v.replace(new RegExp(`[^${LETRAS}0-9 ]`, "g"), "").replace(/^\s+/, "").replace(/\s{2,}/g, " ");
const limpiarDecimal = (v) => {
  const s = v.replace(/[^\d.]/g, "");
  const [entero, ...resto] = s.split(".");
  if (resto.length === 0) return entero.slice(0, 7);
  return entero.slice(0, 7) + "." + resto.join("").slice(0, 2);
};

const vConcepto = (v) => {
  const t = v.trim();
  if (!t) return "El concepto es obligatorio";
  if (t.length < 3) return "Concepto: mínimo 3 caracteres";
  if (!REGEX_TEXTO.test(t)) return "Concepto: solo letras y números";
  return "";
};
const vCategoria = (v) => {
  const t = v.trim();
  if (!t) return "La categoría es obligatoria";
  if (t.length < 3) return "Categoría: mínimo 3 letras";
  if (!REGEX_LETRAS.test(t)) return "Categoría: solo letras";
  return "";
};
const vMonto = (v) => {
  if (v === "" || v == null) return "El monto es obligatorio";
  const s = String(v);
  if (!/^\d+(\.\d{1,2})?$/.test(s) || Number(s) <= 0) return "El monto debe ser un número mayor a 0";
  return "";
};

// Fecha de hoy en hora local (YYYY-MM-DD)
const hoyLocal = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const vFecha = (v) => {
  if (!v) return "La fecha es obligatoria";
  if (v > hoyLocal()) return "La fecha no puede ser futura";
  return "";
};

const Err = ({ msg }) =>
  msg ? <p className="text-xs text-[var(--c-rojo)] -mt-2 mb-3">{msg}</p> : null;

const vacio = { concepto: "", categoria: "", monto: "", fecha: "" };

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = creando, id = editando
  const [form, setForm] = useState(vacio);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const { data } = await api.get("/gastos");
    setGastos(data.gastos);
  }

  // Actualiza un campo (limpiando lo inválido) y quita su error
  const cambiar = (nombre, limpiar = (v) => v) => (e) => {
    const valor = limpiar(e.target.value);
    setForm((f) => ({ ...f, [nombre]: valor }));
    setErrores((er) => ({ ...er, [nombre]: "" }));
  };

  function abrirNuevo() {
    setEditandoId(null);
    setForm(vacio);
    setErrores({});
    setModalAbierto(true);
  }

  function abrirEditar(gasto) {
    setEditandoId(gasto.id);
    setForm({
      concepto: gasto.concepto ?? "",
      categoria: gasto.categoria ?? "",
      monto: gasto.monto ?? "",
      // el input date necesita formato YYYY-MM-DD
      fecha: gasto.fecha ? String(gasto.fecha).slice(0, 10) : "",
    });
    setErrores({});
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(vacio);
    setErrores({});
  }

  async function guardar(e) {
    e.preventDefault();

    const errs = {
      concepto: vConcepto(form.concepto),
      categoria: vCategoria(form.categoria),
      monto: vMonto(form.monto),
      fecha: vFecha(form.fecha),
    };
    setErrores(errs);
    if (Object.values(errs).some(Boolean)) return;

    const datos = {
      ...form,
      concepto: form.concepto.trim(),
      categoria: form.categoria.trim(),
    };

    try {
      if (editandoId) {
        await api.put(`/gastos/${editandoId}`, datos);
      } else {
        await api.post("/gastos", datos);
      }
    } catch (err) {
      setErrores((er) => ({ ...er, general: err.response?.data?.mensaje || "No se pudo guardar el gasto" }));
      return;
    }

    cerrarModal();
    cargar();
  }

  async function eliminar(id) {
    await api.delete(`/gastos/${id}`);
    cargar();
  }

  const columnas = [
    { key: "concepto", label: "Concepto" },
    { key: "categoria", label: "Categoria" },
    { key: "monto", label: "Monto", render: (f) => `$${f.monto}` },
    { key: "fecha", label: "Fecha" },
    {
      key: "acciones",
      label: "Acciones",
      render: (f) => (
        <div className="flex gap-2">
          <Boton variante="outline" onClick={() => abrirEditar(f)}>Editar</Boton>
          <Boton variante="peligro" onClick={() => eliminar(f.id)}>Eliminar</Boton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--c-texto)] mb-6">Gastos</h1>
        <Boton onClick={abrirNuevo}>+ Nuevo gasto</Boton>
      </div>

      <Table columnas={columnas} filas={gastos} />

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? "Editar gasto" : "Nuevo gasto"}
        onClose={cerrarModal}
      >
        <form onSubmit={guardar} noValidate>
          <Input label="Concepto" value={form.concepto} onChange={cambiar("concepto", limpiarTexto)} />
          <Err msg={errores.concepto} />

          <Input label="Categoria" value={form.categoria} onChange={cambiar("categoria", limpiarLetras)} />
          <Err msg={errores.categoria} />

          <Input
            label="Monto"
            inputMode="decimal"
            value={form.monto}
            onChange={cambiar("monto", limpiarDecimal)}
          />
          <Err msg={errores.monto} />

          <Input
            label="Fecha"
            type="date"
            max={hoyLocal()}
            value={form.fecha}
            onChange={cambiar("fecha")}
          />
          <Err msg={errores.fecha} />
          <Err msg={errores.general} />

          <Boton type="submit" className="w-full mt-2">
            {editandoId ? "Guardar cambios" : "Guardar gasto"}
          </Boton>
        </form>
      </Modal>
    </div>
  );
}