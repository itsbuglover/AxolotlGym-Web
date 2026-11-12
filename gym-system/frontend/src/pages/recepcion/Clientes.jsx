import { useEffect, useState } from "react";
import api from "../../api/api.js";
import Table from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Boton from "../../components/ui/Boton.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Input from "../../components/ui/Input.jsx";

// Paleta: fondo #222223 · tarjetas #3D3D3F · campos #111111 · dorado #AC933D · borde #93834C · bronce #8E723A
const campo =
  "bg-[#111111] border border-[#93834C] rounded-md px-3 py-2 text-sm text-[#EEEEF3] " +
  "placeholder:text-[#E3E3EC]/60 focus:outline-none focus:border-[#AC933D] focus:ring-1 focus:ring-[#AC933D]";

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
  msg ? <p className="text-xs text-red-400 -mt-2 mb-3">{msg}</p> : null;

const formVacio = {
  nombre: "", apellido: "", telefono: "", correo: "", plan: "", metodo: "Efectivo",
  contactoNombre: "", contactoTelefono: "",
};
const METODOS = ["Efectivo", "Tarjeta", "Transferencia"];

// En la base el nombre se guarda completo: "Juan Carlos Pérez" -> nombre "Juan", apellido "Carlos Pérez"
function separarNombre(completo = "") {
  const [nombre = "", ...resto] = completo.trim().split(/\s+/);
  return { nombre, apellido: resto.join(" ") };
}

// Select con la paleta: campo #111111, borde #93834C, foco dorado #AC933D
function SelectCampo({ label, value, onChange, children }) {
  return (
    <div className="mb-3">
      <label className="block text-sm text-[#E3E3EC] mb-1">{label}</label>
      <select value={value} onChange={onChange} className={`w-full ${campo} ${value ? "text-[#EEEEF3]" : "text-[#E3E3EC]/60"}`}>
        {children}
      </select>
    </div>
  );
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = creando, id = editando
  const [form, setForm] = useState(formVacio);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [aviso, setAviso] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [planes, setPlanes] = useState([]); // tipos_membresia de la base
  const [renovando, setRenovando] = useState(null); // cliente a renovar
  const [renovacion, setRenovacion] = useState({ plan: "", metodo: "Efectivo" });

  useEffect(() => {
    api.get("/clientes/planes").then((r) => setPlanes(r.data.planes));
  }, []);

  useEffect(() => {
    cargar();
  }, [buscar, estado]);

  // El mensaje de exito se quita solo
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(""), 5000);
    return () => clearTimeout(t);
  }, [aviso]);

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
    setErrorGeneral("");
    setModalAbierto(true);
  }

  async function abrirEditar(cliente) {
    setEditandoId(cliente.id);
    setForm({
      ...formVacio,
      ...separarNombre(cliente.nombre),
      telefono: cliente.telefono ?? "",
      correo: cliente.correo ?? "",
      plan: cliente.plan ?? "",
    });
    setErrores({});
    setErrorGeneral("");
    setModalAbierto(true);
    // El contacto de emergencia no viene en la lista; se pide aparte
    try {
      const { data } = await api.get(`/clientes/${cliente.id}`);
      setForm((f) => ({
        ...f,
        contactoNombre: data.cliente.contactoNombre ?? "",
        contactoTelefono: data.cliente.contactoTelefono ?? "",
      }));
    } catch {
      /* se puede editar sin el contacto precargado */
    }
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(formVacio);
    setErrores({});
    setErrorGeneral("");
  }

  async function guardarCliente(e) {
    e.preventDefault();

    const errs = {
      nombre: vNombre(form.nombre, "Nombre"),
      apellido: editandoId && !form.apellido ? "" : vNombre(form.apellido, "Apellido"),
      telefono: vTelefono(form.telefono),
      correo: vCorreo(form.correo),
      plan: editandoId || form.plan ? "" : "Selecciona un plan",
      contactoNombre: vNombre(form.contactoNombre, "El contacto de emergencia"),
      contactoTelefono: /^\d{10}$/.test(form.contactoTelefono) ? "" : "El teléfono del contacto debe tener 10 dígitos",
    };
    setErrores(errs);
    if (Object.values(errs).some(Boolean)) return;

    const datos = {
      nombre: `${form.nombre.trim()} ${form.apellido.trim()}`,
      correo: form.correo.trim(),
      telefono: form.telefono,
      contactoNombre: form.contactoNombre.trim(),
      contactoTelefono: form.contactoTelefono,
    };

    setGuardando(true);
    setErrorGeneral("");
    try {
      if (editandoId) {
        await api.put(`/clientes/${editandoId}`, datos);
        setAviso("Cliente actualizado");
      } else {
        const { data } = await api.post("/clientes", { ...datos, plan: form.plan, metodo: form.metodo });
        setAviso(data.mensaje);
      }
      cerrarModal();
      cargar();
    } catch (err) {
      setErrorGeneral(err.response?.data?.mensaje || "No se pudo guardar el cliente");
    } finally {
      setGuardando(false);
    }
  }

  function abrirRenovar(cliente) {
    setRenovando(cliente);
    setRenovacion({ plan: cliente.plan || planes[0]?.nombre || "", metodo: "Efectivo" });
    setErrorGeneral("");
  }

  async function renovar(e) {
    e.preventDefault();
    setGuardando(true);
    setErrorGeneral("");
    try {
      const { data } = await api.put(`/clientes/${renovando.id}/renovar`, renovacion);
      setAviso(data.mensaje);
      setRenovando(null);
      cargar();
    } catch (err) {
      setErrorGeneral(err.response?.data?.mensaje || "No se pudo renovar");
    } finally {
      setGuardando(false);
    }
  }

  const columnas = [
    {
      key: "nombre",
      label: "Nombre",
      render: (f) => f.nombre,
    },
    { key: "numMembresia", label: "Membresia" },
    {
      key: "plan",
      label: "Plan",
      render: (f) => <span className="capitalize">{f.plan}</span>,
    },
    { key: "fechaRegistro", label: "Fecha registro" },
    { key: "vence", label: "Vence", render: (f) => f.vence || "—" },
    { key: "estado", label: "Estado", render: (f) => <Badge estado={f.estado} /> },
    {
      key: "acciones",
      label: "Acciones",
      render: (f) => (
        <div className="flex gap-2">
          <Boton variante="outline" onClick={() => abrirEditar(f)}>Editar</Boton>
          {f.estado !== "activo" && <Boton onClick={() => abrirRenovar(f)}>Renovar</Boton>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#EEEEF3]">Clientes</h1>
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

      {aviso && (
        <p className="mb-4 rounded-lg border border-[#2E8B57] bg-[#2E8B57]/15 px-4 py-2.5 text-sm text-[#3FB27F]">
          {aviso}
        </p>
      )}

      <Table columnas={columnas} filas={clientes} />

      <Modal abierto={!!renovando} titulo={`Renovar membresía · ${renovando?.nombre ?? ""}`} onClose={() => setRenovando(null)}>
        <form onSubmit={renovar}>
          <SelectCampo
            label="Plan"
            value={renovacion.plan}
            onChange={(e) => setRenovacion((r) => ({ ...r, plan: e.target.value }))}
          >
            {planes.map((p) => (
              <option key={p.nombre} value={p.nombre} className="bg-[#111111] text-[#EEEEF3]">
                {p.nombre} · ${p.precio}
              </option>
            ))}
          </SelectCampo>
          <SelectCampo
            label="Método de pago"
            value={renovacion.metodo}
            onChange={(e) => setRenovacion((r) => ({ ...r, metodo: e.target.value }))}
          >
            {METODOS.map((m) => (
              <option key={m} value={m} className="bg-[#111111] text-[#EEEEF3]">{m}</option>
            ))}
          </SelectCampo>
          {renovacion.metodo === "Transferencia" && (
            <p className="text-xs text-[#D4B24C] mb-3">La transferencia queda pendiente hasta que el Encargado la confirme.</p>
          )}
          {errorGeneral && <p className="text-sm text-[#E8706F] mb-3">{errorGeneral}</p>}
          <Boton type="submit" className="w-full mt-2" disabled={guardando}>
            {guardando ? "Renovando..." : "Renovar"}
          </Boton>
        </form>
      </Modal>

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

          {/* Plan y pago solo al dar de alta; despues se cambia con "Renovar" */}
          {!editandoId && (
            <>
              <SelectCampo label="Plan" value={form.plan} onChange={cambiar("plan")}>
                <option value="" disabled className="bg-[#111111] text-[#E3E3EC]/60">
                  Selecciona un plan
                </option>
                {planes.map((p) => (
                  <option key={p.nombre} value={p.nombre} className="bg-[#111111] text-[#EEEEF3]">
                    {p.nombre} · ${p.precio}
                  </option>
                ))}
              </SelectCampo>
              <Err msg={errores.plan} />

              <SelectCampo label="Método de pago" value={form.metodo} onChange={cambiar("metodo")}>
                {METODOS.map((m) => (
                  <option key={m} value={m} className="bg-[#111111] text-[#EEEEF3]">{m}</option>
                ))}
              </SelectCampo>
            </>
          )}

          <Input
            label="Contacto de emergencia"
            value={form.contactoNombre}
            onChange={cambiar("contactoNombre", limpiarLetras)}
          />
          <Err msg={errores.contactoNombre} />

          <Input
            label="Teléfono del contacto"
            value={form.contactoTelefono}
            inputMode="numeric"
            maxLength={10}
            onChange={cambiar("contactoTelefono", limpiarTelefono)}
          />
          <Err msg={errores.contactoTelefono} />

          {errorGeneral && <p className="text-sm text-[#E8706F] mb-3">{errorGeneral}</p>}

          <Boton type="submit" className="w-full mt-2" disabled={guardando}>
            {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Guardar cliente"}
          </Boton>
        </form>
      </Modal>
    </div>
  );
}