import { useEffect, useState } from "react";
import api from "../../api/api.js";
import { useIdioma } from "../../context/IdiomaContext.jsx";
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

// Fecha de hoy en hora local (YYYY-MM-DD)
const hoyLocal = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const Err = ({ msg }) =>
  msg ? <p className="text-xs text-[var(--c-rojo)] -mt-2 mb-3">{msg}</p> : null;

const vacio = { concepto: "", categoria: "", monto: "", fecha: "" };

export default function Gastos() {
  const { tr, traducirMsg } = useIdioma();
  const [gastos, setGastos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = creando, id = editando
  const [form, setForm] = useState(vacio);
  const [errores, setErrores] = useState({});

  const vConcepto = (v) => {
    const t = v.trim();
    if (!t) return tr.val.esObligatorio(tr.gastos.concepto);
    if (t.length < 3) return tr.val.minCaracteres(tr.gastos.concepto);
    if (!REGEX_TEXTO.test(t)) return tr.val.soloLetrasNumeros(tr.gastos.concepto);
    return "";
  };
  const vCategoria = (v) => {
    const t = v.trim();
    if (!t) return tr.val.esObligatorio(tr.gastos.categoria);
    if (t.length < 3) return tr.val.minLetras(tr.gastos.categoria);
    if (!REGEX_LETRAS.test(t)) return tr.val.soloLetras(tr.gastos.categoria);
    return "";
  };
  const vMonto = (v) => {
    if (v === "" || v == null) return tr.val.esObligatorio(tr.gastos.monto);
    const s = String(v);
    if (!/^\d+(\.\d{1,2})?$/.test(s) || Number(s) <= 0) return tr.val.numeroMayorCero(tr.gastos.monto);
    return "";
  };
  const vFecha = (v) => {
    if (!v) return tr.val.fechaObligatoria;
    if (v > hoyLocal()) return tr.val.fechaFutura;
    return "";
  };

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
      setErrores((er) => ({ ...er, general: traducirMsg(err.response?.data?.mensaje) || tr.gastos.errorGuardar }));
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
    { key: "concepto", label: tr.gastos.colConcepto },
    { key: "categoria", label: tr.gastos.colCategoria },
    { key: "monto", label: tr.gastos.colMonto, render: (f) => `$${f.monto}` },
    { key: "fecha", label: tr.gastos.colFecha },
    {
      key: "acciones",
      label: tr.acciones,
      render: (f) => (
        <div className="flex gap-2">
          <Boton variante="outline" onClick={() => abrirEditar(f)}>{tr.editar}</Boton>
          <Boton variante="peligro" onClick={() => eliminar(f.id)}>{tr.eliminar}</Boton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--c-texto)] mb-6">{tr.gastos.titulo}</h1>
        <Boton onClick={abrirNuevo}>{tr.gastos.nuevoBtn}</Boton>
      </div>

      <Table columnas={columnas} filas={gastos} />

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? tr.gastos.modalEditar : tr.gastos.modalNuevo}
        onClose={cerrarModal}
      >
        <form onSubmit={guardar} noValidate>
          <Input label={tr.gastos.concepto} value={form.concepto} onChange={cambiar("concepto", limpiarTexto)} />
          <Err msg={errores.concepto} />

          <Input label={tr.gastos.categoria} value={form.categoria} onChange={cambiar("categoria", limpiarLetras)} />
          <Err msg={errores.categoria} />

          <Input
            label={tr.gastos.monto}
            inputMode="decimal"
            value={form.monto}
            onChange={cambiar("monto", limpiarDecimal)}
          />
          <Err msg={errores.monto} />

          <Input
            label={tr.gastos.fecha}
            type="date"
            max={hoyLocal()}
            value={form.fecha}
            onChange={cambiar("fecha")}
          />
          <Err msg={errores.fecha} />
          <Err msg={errores.general} />

          <Boton type="submit" className="w-full mt-2">
            {editandoId ? tr.guardarCambios : tr.gastos.guardarNuevo}
          </Boton>
        </form>
      </Modal>
    </div>
  );
}
