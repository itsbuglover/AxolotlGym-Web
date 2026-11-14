import { useEffect, useState } from "react";
import api from "../../api/api.js";
import { useIdioma } from "../../context/IdiomaContext.jsx";
import Table from "../../components/ui/Table.jsx";
import Boton from "../../components/ui/Boton.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Input from "../../components/ui/Input.jsx";

// ---------- Validaciones ----------
const LETRAS = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ";
const REGEX_TEXTO = new RegExp(`^[${LETRAS}0-9]+( [${LETRAS}0-9]+)*$`);

const limpiarTexto = (v) =>
  v.replace(new RegExp(`[^${LETRAS}0-9 ]`, "g"), "").replace(/^\s+/, "").replace(/\s{2,}/g, " ");
const limpiarDecimal = (v) => {
  const s = v.replace(/[^\d.]/g, "");
  const [entero, ...resto] = s.split(".");
  if (resto.length === 0) return entero.slice(0, 7);
  return entero.slice(0, 7) + "." + resto.join("").slice(0, 2);
};

const Err = ({ msg }) =>
  msg ? <p className="text-xs text-[var(--c-rojo)] -mt-2 mb-3">{msg}</p> : null;

const vacio = { nombre: "", duracion: "", precio: "" };

export default function Servicios() {
  const { tr, traducirMsg } = useIdioma();
  const [servicios, setServicios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = creando, id = editando
  const [form, setForm] = useState(vacio);
  const [errores, setErrores] = useState({});

  const vTexto = (v, etiqueta) => {
    const t = v.trim();
    if (!t) return tr.val.esObligatorio(etiqueta);
    if (t.length < 3) return tr.val.minCaracteres(etiqueta);
    if (!REGEX_TEXTO.test(t)) return tr.val.soloLetrasNumeros(etiqueta);
    return "";
  };
  const vMonto = (v, etiqueta) => {
    if (v === "" || v == null) return tr.val.esObligatorio(etiqueta);
    const s = String(v);
    if (!/^\d+(\.\d{1,2})?$/.test(s) || Number(s) <= 0) return tr.val.numeroMayorCero(etiqueta);
    return "";
  };

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const { data } = await api.get("/servicios");
    setServicios(data.servicios);
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

  function abrirEditar(servicio) {
    setEditandoId(servicio.id);
    setForm({
      nombre: servicio.nombre ?? "",
      duracion: servicio.duracion ?? "",
      precio: servicio.precio ?? "",
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
      nombre: vTexto(form.nombre, tr.servicios.nombre),
      duracion: vTexto(form.duracion, tr.servicios.duracion),
      precio: vMonto(form.precio, tr.servicios.precio),
    };
    setErrores(errs);
    if (Object.values(errs).some(Boolean)) return;

    const datos = {
      ...form,
      nombre: form.nombre.trim(),
      duracion: form.duracion.trim(),
    };

    try {
      if (editandoId) {
        await api.put(`/servicios/${editandoId}`, datos);
      } else {
        await api.post("/servicios", datos);
      }
    } catch (err) {
      setErrores((er) => ({ ...er, general: traducirMsg(err.response?.data?.mensaje) || tr.servicios.errorGuardar }));
      return;
    }

    cerrarModal();
    cargar();
  }

  async function eliminar(id) {
    await api.delete(`/servicios/${id}`);
    cargar();
  }

  const columnas = [
    { key: "nombre", label: tr.servicios.colNombre },
    { key: "duracion", label: tr.servicios.colDuracion },
    { key: "precio", label: tr.servicios.colPrecio, render: (f) => `$${f.precio}` },
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
        <h1 className="text-xl font-semibold text-[var(--c-texto)] mb-6">{tr.servicios.titulo}</h1>
        <Boton onClick={abrirNuevo}>{tr.servicios.nuevoBtn}</Boton>
      </div>

      <Table columnas={columnas} filas={servicios} />

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? tr.servicios.modalEditar : tr.servicios.modalNuevo}
        onClose={cerrarModal}
      >
        <form onSubmit={guardar} noValidate>
          <Input label={tr.servicios.nombre} value={form.nombre} onChange={cambiar("nombre", limpiarTexto)} />
          <Err msg={errores.nombre} />

          <Input
            label={tr.servicios.duracion}
            placeholder={tr.servicios.duracionPlaceholder}
            value={form.duracion}
            onChange={cambiar("duracion", limpiarTexto)}
          />
          <Err msg={errores.duracion} />

          <Input
            label={tr.servicios.precio}
            inputMode="decimal"
            value={form.precio}
            onChange={cambiar("precio", limpiarDecimal)}
          />
          <Err msg={errores.precio} />
          <Err msg={errores.general} />

          <Boton type="submit" className="w-full mt-2">
            {editandoId ? tr.guardarCambios : tr.servicios.guardarNuevo}
          </Boton>
        </form>
      </Modal>
    </div>
  );
}
