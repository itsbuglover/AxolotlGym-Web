import { useEffect, useState } from "react";
import api from "../../api/api.js";
import { useIdioma } from "../../context/IdiomaContext.jsx";
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

const Err = ({ msg }) =>
  msg ? <p className="text-xs text-[var(--c-rojo)] -mt-2 mb-3">{msg}</p> : null;

const formVacio = { nombre: "", apellido: "", telefono: "", correo: "", plan: "" };

export default function Clientes() {
  const { tr, traducirMsg } = useIdioma();
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]); // vienen de tipos_membresia en Supabase
  const [aviso, setAviso] = useState("");
  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = creando, id = editando
  const [form, setForm] = useState(formVacio);
  const [errores, setErrores] = useState({});

  const vNombre = (v, etiqueta) => {
    const t = v.trim();
    if (!t) return tr.val.esObligatorio(etiqueta);
    if (t.length < 3) return tr.val.minLetras(etiqueta);
    if (!REGEX_LETRAS.test(t)) return tr.val.soloLetras(etiqueta);
    return "";
  };
  const vTelefono = (v) => (!v || /^\d{10}$/.test(v) ? "" : tr.val.telefono10);
  const vCorreo = (v) => {
    const t = v.trim();
    if (!t) return tr.val.correoObligatorio;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t) ? "" : tr.val.correoInvalido;
  };

  useEffect(() => {
    cargar();
  }, [buscar, estado]);

  useEffect(() => {
    api
      .get("/clientes/planes")
      .then(({ data }) =>
        setPlanes(
          data.planes.map((p) => ({ value: p.nombre.toLowerCase(), label: `${p.nombre} · $${p.precio}` }))
        )
      )
      .catch(() => setPlanes([]));
  }, []);

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
      nombre: vNombre(form.nombre, tr.clientes.nombre),
      apellido: vNombre(form.apellido, tr.clientes.apellido),
      telefono: vTelefono(form.telefono),
      correo: vCorreo(form.correo),
      plan: form.plan ? "" : tr.val.seleccionaPlan,
    };
    setErrores(errs);
    if (Object.values(errs).some(Boolean)) return;

    const datos = {
      ...form,
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      correo: form.correo.trim(),
    };

    try {
      if (editandoId) {
        await api.put(`/clientes/${editandoId}`, datos);
        setAviso("");
      } else {
        const { data } = await api.post("/clientes", datos);
        setAviso(traducirMsg(data.mensaje) || "");
      }
    } catch (err) {
      setErrores((er) => ({ ...er, general: traducirMsg(err.response?.data?.mensaje) || tr.clientes.errorGuardar }));
      return;
    }

    cerrarModal();
    cargar();
  }

  async function renovar(id) {
    try {
      const { data } = await api.put(`/clientes/${id}/renovar`);
      setAviso(traducirMsg(data.mensaje) || tr.clientes.membresiaRenovada);
    } catch (err) {
      setAviso(traducirMsg(err.response?.data?.mensaje) || tr.clientes.errorRenovar);
    }
    cargar();
  }

  const columnas = [
    {
      key: "nombre",
      label: tr.clientes.colNombre,
      render: (f) => `${f.nombre ?? ""} ${f.apellido ?? ""}`.trim(),
    },
    { key: "numMembresia", label: tr.clientes.colMembresia },
    {
      key: "plan",
      label: tr.clientes.colPlan,
      render: (f) => <span className="capitalize">{f.plan}</span>,
    },
    { key: "fechaRegistro", label: tr.clientes.colFechaRegistro },
    { key: "estado", label: tr.clientes.colEstado, render: (f) => <Badge estado={f.estado} /> },
    {
      key: "acciones",
      label: tr.acciones,
      render: (f) =>
        f.estado === "activo" ? (
          <Boton variante="outline" onClick={() => abrirEditar(f)}>{tr.editar}</Boton>
        ) : (
          <Boton variante="outline" onClick={() => renovar(f.id)}>{tr.renovar}</Boton>
        ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--c-texto)]">{tr.clientes.titulo}</h1>
        <Boton onClick={abrirNuevo}>{tr.clientes.nuevoBtn}</Boton>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder={tr.clientes.buscarPlaceholder}
          className={`flex-1 ${campo}`}
        />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className={campo}
        >
          <option value="">{tr.todos}</option>
          <option value="activo">{tr.clientes.activo}</option>
          <option value="inactivo">{tr.clientes.inactivo}</option>
        </select>
      </div>

      {aviso && <p className="text-sm text-[var(--c-ambar-texto)] mb-3">{aviso}</p>}

      <Table columnas={columnas} filas={clientes} />

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? tr.clientes.modalEditar : tr.clientes.modalNuevo}
        onClose={cerrarModal}
      >
        <form onSubmit={guardarCliente} noValidate>
          <Input label={tr.clientes.nombre} value={form.nombre} onChange={cambiar("nombre", limpiarLetras)} />
          <Err msg={errores.nombre} />

          <Input label={tr.clientes.apellido} value={form.apellido} onChange={cambiar("apellido", limpiarLetras)} />
          <Err msg={errores.apellido} />

          <Input
            label={tr.clientes.telefono}
            value={form.telefono}
            inputMode="numeric"
            maxLength={10}
            onChange={cambiar("telefono", limpiarTelefono)}
          />
          <Err msg={errores.telefono} />

          <Input label={tr.clientes.correo} type="email" value={form.correo} onChange={cambiar("correo")} />
          <Err msg={errores.correo} />

          <div className="mb-3">
            <label className="block text-sm text-[var(--c-texto-sec)] mb-1">{tr.clientes.plan}</label>
            <select
              value={form.plan}
              onChange={cambiar("plan")}
              className={`w-full ${campo} ${form.plan ? "text-[var(--c-texto)]" : "text-[var(--c-texto-tenue)]"}`}
            >
              <option value="" disabled className="bg-[var(--c-campo)] text-[var(--c-texto-tenue)]">
                {tr.clientes.seleccionaPlan}
              </option>
              {planes.map((p) => (
                <option key={p.value} value={p.value} className="bg-[var(--c-campo)] text-[var(--c-texto)]">
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <Err msg={errores.plan} />
          <Err msg={errores.general} />

          <Boton type="submit" className="w-full mt-2">
            {editandoId ? tr.guardarCambios : tr.clientes.guardarNuevo}
          </Boton>
        </form>
      </Modal>
    </div>
  );
}
