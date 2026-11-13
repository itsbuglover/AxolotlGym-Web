import { useEffect, useState } from "react";
import api from "../../api/api.js";
import Table from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Boton from "../../components/ui/Boton.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Input from "../../components/ui/Input.jsx";

const campo =
  "bg-[var(--c-campo)] border border-[var(--c-borde)] rounded-md px-3 py-2 text-sm text-[var(--c-texto)] " +
  "placeholder:text-[var(--c-texto-tenue)] focus:outline-none focus:border-[var(--c-acento)] focus:ring-1 focus:ring-[var(--c-acento)]";

// ---------- Validaciones ----------
const LETRAS = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ";
const REGEX_LETRAS = new RegExp(`^[${LETRAS}]+( [${LETRAS}]+)*$`);

const limpiarLetras = (v) =>
  v.replace(new RegExp(`[^${LETRAS} ]`, "g"), "").replace(/^\s+/, "").replace(/\s{2,}/g, " ");
const limpiarTelefono = (v) => v.replace(/\D/g, "").slice(0, 10);

const vNombre = (v, etiqueta) => {
  const t = v.trim();
  if (!t) return `${etiqueta} es obligatorio`;
  if (t.length < 3) return `${etiqueta}: mínimo 3 letras`;
  if (!REGEX_LETRAS.test(t)) return `${etiqueta}: solo letras`;
  return "";
};
const vTelefono = (v) => (!v || /^\d{10}$/.test(v) ? "" : "El teléfono debe tener 10 dígitos");
const vCorreo = (v) => {
  const t = v.trim();
  if (!t) return "El correo es obligatorio";
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t) ? "" : "Correo no válido";
};

const Err = ({ msg }) =>
  msg ? <p className="text-xs text-[var(--c-rojo)] -mt-2 mb-3">{msg}</p> : null;

const formVacio = { nombre: "", apellido: "", telefono: "", correo: "", plan: "" };

const planes = [
  { value: "trimestral", label: "Trimestral" },
  { value: "mensual", label: "Mensual" },
  { value: "visita", label: "Visita" },
];

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = creando, id = editando
  const [form, setForm] = useState(formVacio);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    cargar();
  }, [buscar, estado]);

  async function cargar() {
    const { data } = await api.get("/clientes", { params: { buscar, estado } });
    setClientes(data.clientes);
  }

  // Actualiza un campo (limpiando lo inválido) y quita su error
  const cambiar = (nombre, limpiar = (v) => v) => (e) => {
    const valor = limpiar(e.target.value);
    setForm((f) => ({ ...f, [nombre]: valor }));
    setErrores((er) => ({ ...er, [nombre]: "" }));
  };

  function abrirNuevo() {
    setEditandoId(null);
    setForm(formVacio);
    setErrores({});
    setModalAbierto(true);
  }

  function abrirEditar(cliente) {
    setEditandoId(cliente.id);
    setForm({
      nombre: cliente.nombre ?? "",
      apellido: cliente.apellido ?? "",
      telefono: cliente.telefono ?? "",
      correo: cliente.correo ?? "",
      plan: cliente.plan ?? "",
    });
    setErrores({});
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(formVacio);
    setErrores({});
  }

  async function guardarCliente(e) {
    e.preventDefault();

    const errs = {
      nombre: vNombre(form.nombre, "Nombre"),
      apellido: vNombre(form.apellido, "Apellido"),
      telefono: vTelefono(form.telefono),
      correo: vCorreo(form.correo),
      plan: form.plan ? "" : "Selecciona un plan",
    };
    setErrores(errs);
    if (Object.values(errs).some(Boolean)) return;

    const datos = {
      ...form,
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      correo: form.correo.trim(),
    };

    if (editandoId) {
      await api.put(`/clientes/${editandoId}`, datos);
    } else {
      await api.post("/clientes", datos);
    }

    cerrarModal();
    cargar();
  }

  async function renovar(id) {
    await api.put(`/clientes/${id}/renovar`);
    cargar();
  }

  const columnas = [
    {
      key: "nombre",
      label: "Nombre",
      render: (f) => `${f.nombre ?? ""} ${f.apellido ?? ""}`.trim(),
    },
    { key: "numMembresia", label: "Membresia" },
    {
      key: "plan",
      label: "Plan",
      render: (f) => <span className="capitalize">{f.plan}</span>,
    },
    { key: "fechaRegistro", label: "Fecha registro" },
    { key: "estado", label: "Estado", render: (f) => <Badge estado={f.estado} /> },
    {
      key: "acciones",
      label: "Acciones",
      render: (f) =>
        f.estado === "activo" ? (
          <Boton variante="outline" onClick={() => abrirEditar(f)}>Editar</Boton>
        ) : (
          <Boton variante="outline" onClick={() => renovar(f.id)}>Renovar</Boton>
        ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--c-texto)]">Clientes</h1>
        <Boton onClick={abrirNuevo}>+ Nuevo cliente</Boton>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar por nombre o membresia..."
          className={`flex-1 ${campo}`}
        />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className={campo}
        >
          <option value="">Todos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <Table columnas={columnas} filas={clientes} />

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? "Editar cliente" : "Nuevo cliente"}
        onClose={cerrarModal}
      >
        <form onSubmit={guardarCliente} noValidate>
          <Input label="Nombre" value={form.nombre} onChange={cambiar("nombre", limpiarLetras)} />
          <Err msg={errores.nombre} />

          <Input label="Apellido" value={form.apellido} onChange={cambiar("apellido", limpiarLetras)} />
          <Err msg={errores.apellido} />

          <Input
            label="Teléfono"
            value={form.telefono}
            inputMode="numeric"
            maxLength={10}
            onChange={cambiar("telefono", limpiarTelefono)}
          />
          <Err msg={errores.telefono} />

          <Input label="Correo" type="email" value={form.correo} onChange={cambiar("correo")} />
          <Err msg={errores.correo} />

          <div className="mb-3">
            <label className="block text-sm text-[var(--c-texto-sec)] mb-1">Plan</label>
            <select
              value={form.plan}
              onChange={cambiar("plan")}
              className={`w-full ${campo} ${form.plan ? "text-[var(--c-texto)]" : "text-[var(--c-texto-tenue)]"}`}
            >
              <option value="" disabled className="bg-[var(--c-campo)] text-[var(--c-texto-tenue)]">
                Selecciona un plan
              </option>
              {planes.map((p) => (
                <option key={p.value} value={p.value} className="bg-[var(--c-campo)] text-[var(--c-texto)]">
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <Err msg={errores.plan} />

          <Boton type="submit" className="w-full mt-2">
            {editandoId ? "Guardar cambios" : "Guardar cliente"}
          </Boton>
        </form>
      </Modal>
    </div>
  );
}