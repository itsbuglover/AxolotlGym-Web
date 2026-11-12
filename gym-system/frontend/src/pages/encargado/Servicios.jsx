import { useEffect, useState } from "react";
import api from "../../api/api.js";
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

const vTexto = (v, etiqueta) => {
  const t = v.trim();
  if (!t) return `${etiqueta} es obligatorio`;
  if (t.length < 3) return `${etiqueta}: mínimo 3 caracteres`;
  if (!REGEX_TEXTO.test(t)) return `${etiqueta}: solo letras y números`;
  return "";
};
const vMonto = (v, etiqueta) => {
  if (v === "" || v == null) return `${etiqueta} es obligatorio`;
  const s = String(v);
  if (!/^\d+(\.\d{1,2})?$/.test(s) || Number(s) <= 0) return `${etiqueta} debe ser un número mayor a 0`;
  return "";
};

const Err = ({ msg }) =>
  msg ? <p className="text-xs text-red-400 -mt-2 mb-3">{msg}</p> : null;

const vacio = { nombre: "", duracion: "", precio: "" };

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = creando, id = editando
  const [form, setForm] = useState(vacio);
  const [errores, setErrores] = useState({});

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
      nombre: vTexto(form.nombre, "El nombre"),
      duracion: vTexto(form.duracion, "La duración"),
      precio: vMonto(form.precio, "El precio"),
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
      cerrarModal();
      cargar();
    } catch (err) {
      window.alert(err.response?.data?.mensaje || "No se pudo guardar");
    }
  }

  async function eliminar(id) {
    if (!window.confirm("¿Eliminar este registro?")) return;
    try {
      await api.delete(`/servicios/${id}`);
      cargar();
    } catch (err) {
      window.alert(err.response?.data?.mensaje || "No se pudo eliminar");
    }
  }

  const columnas = [
    { key: "nombre", label: "Nombre" },
    { key: "duracion", label: "Duracion" },
    { key: "precio", label: "Precio", render: (f) => `$${f.precio}` },
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
        <h1 className="text-xl font-semibold text-[#EEEEF3] mb-6">Servicios</h1>
        <Boton onClick={abrirNuevo}>+ Nuevo servicio</Boton>
      </div>

      <Table columnas={columnas} filas={servicios} />

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? "Editar servicio" : "Nuevo servicio"}
        onClose={cerrarModal}
      >
        <form onSubmit={guardar} noValidate>
          <Input label="Nombre" value={form.nombre} onChange={cambiar("nombre", limpiarTexto)} />
          <Err msg={errores.nombre} />

          <Input
            label="Duracion"
            placeholder="ej. 1 mes"
            value={form.duracion}
            onChange={cambiar("duracion", limpiarTexto)}
          />
          <Err msg={errores.duracion} />

          <Input
            label="Precio"
            inputMode="decimal"
            value={form.precio}
            onChange={cambiar("precio", limpiarDecimal)}
          />
          <Err msg={errores.precio} />

          <Boton type="submit" className="w-full mt-2">
            {editandoId ? "Guardar cambios" : "Guardar servicio"}
          </Boton>
        </form>
      </Modal>
    </div>
  );
}