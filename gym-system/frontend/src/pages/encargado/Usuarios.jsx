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
const limpiarEntero = (v) => v.replace(/\D/g, "").slice(0, 4);
const limpiarDecimal = (v) => {
  const s = v.replace(/[^\d.]/g, "");
  const [entero, ...resto] = s.split(".");
  if (resto.length === 0) return entero.slice(0, 7);
  return entero.slice(0, 7) + "." + resto.join("").slice(0, 2);
};

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
const vPassword = (v) => {
  if (!v) return "La contraseña es obligatoria";
  return v.length >= 8 ? "" : "Mínimo 8 caracteres";
};
const vMonto = (v, etiqueta) => {
  if (v === "" || v == null) return `${etiqueta} es obligatorio`;
  const s = String(v);
  if (!/^\d+(\.\d{1,2})?$/.test(s) || Number(s) <= 0) return `${etiqueta} debe ser un número mayor a 0`;
  return "";
};
const vEntero = (v, etiqueta) => {
  if (v === "" || v == null) return `${etiqueta} es obligatorio`;
  const s = String(v);
  if (!/^\d+$/.test(s) || Number(s) < 1) return `${etiqueta} debe ser un entero mayor a 0`;
  return "";
};

const Err = ({ msg }) =>
  msg ? <p className="text-xs text-[var(--c-rojo)] -mt-2 mb-3">{msg}</p> : null;

// Select con la paleta de la app
function SelectPaleta({ label, value, onChange, options }) {
  return (
    <div className="mb-3">
      <label className="block text-sm text-[var(--c-texto-sec)] mb-1">{label}</label>
      <select value={value} onChange={onChange} className={`w-full ${campo}`}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[var(--c-campo)] text-[var(--c-texto)]">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const vacio = { nombre: "", telefono: "", correo: "", password: "", rol: "recepcion", estado: "activo", costoServicio: "", capacidadMaxima: "" };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = creando, id = editando
  const [form, setForm] = useState(vacio);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const { data } = await api.get("/usuarios");
    setUsuarios(data.usuarios);
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

  function abrirEditar(usuario) {
    setEditandoId(usuario.id);
    setForm({
      nombre: usuario.nombre ?? "",
      telefono: usuario.telefono ?? "",
      correo: usuario.correo ?? "",
      password: "",
      rol: usuario.rol ?? "recepcion",
      estado: usuario.estado ?? "activo",
      costoServicio: usuario.costoServicio ?? "",
      capacidadMaxima: usuario.capacidadMaxima ?? "",
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

    const esInstructor = form.rol === "instructor";
    const errs = {
      nombre: vNombre(form.nombre, "Nombre"),
      telefono: vTelefono(form.telefono),
      correo: vCorreo(form.correo),
      password: editandoId ? "" : vPassword(form.password),
      costoServicio: esInstructor ? vMonto(form.costoServicio, "El costo") : "",
      capacidadMaxima: esInstructor ? vEntero(form.capacidadMaxima, "La capacidad") : "",
    };
    setErrores(errs);
    if (Object.values(errs).some(Boolean)) return;

    const datos = {
      ...form,
      nombre: form.nombre.trim(),
      correo: form.correo.trim(),
    };

    if (editandoId) {
      // al editar no se manda contraseña
      const { password, ...sinPassword } = datos;
      await api.put(`/usuarios/${editandoId}`, sinPassword);
    } else {
      await api.post("/usuarios", datos);
    }

    cerrarModal();
    cargar();
  }

  async function eliminar(id) {
    await api.delete(`/usuarios/${id}`);
    cargar();
  }

  const columnas = [
    { key: "nombre", label: "Nombre" },
    { key: "rol", label: "Rol", render: (f) => <span className="capitalize">{f.rol}</span> },
    { key: "correo", label: "Correo" },
    { key: "estado", label: "Estado", render: (f) => <Badge estado={f.estado} /> },
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
        <h1 className="text-xl font-semibold text-[var(--c-texto)] mb-6">Usuarios</h1>
        <Boton onClick={abrirNuevo}>+ Nuevo usuario</Boton>
      </div>

      <Table columnas={columnas} filas={usuarios} />

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? "Editar usuario" : "Nuevo usuario"}
        onClose={cerrarModal}
      >
        <form onSubmit={guardar} noValidate>
          <Input label="Nombre" value={form.nombre} onChange={cambiar("nombre", limpiarLetras)} />
          <Err msg={errores.nombre} />

          <Input
            label="Telefono"
            value={form.telefono}
            inputMode="numeric"
            maxLength={10}
            onChange={cambiar("telefono", limpiarTelefono)}
          />
          <Err msg={errores.telefono} />

          <Input label="Correo (se le asignara al usuario)" type="email" value={form.correo} onChange={cambiar("correo")} />
          <Err msg={errores.correo} />

          {!editandoId && (
            <>
              <Input label="Contraseña (se le asignara al usuario)" value={form.password} onChange={cambiar("password")} />
              <Err msg={errores.password} />
            </>
          )}

          <SelectPaleta
            label="Rol"
            value={form.rol}
            onChange={cambiar("rol")}
            options={[
              { value: "recepcion", label: "Recepcion" },
              { value: "instructor", label: "Instructor" },
            ]}
          />
          <SelectPaleta
            label="Estado"
            value={form.estado}
            onChange={cambiar("estado")}
            options={[
              { value: "activo", label: "Activo" },
              { value: "inactivo", label: "Inactivo" },
            ]}
          />

          {form.rol === "instructor" && (
            <>
              <Input
                label="Costo del servicio"
                inputMode="decimal"
                value={form.costoServicio}
                onChange={cambiar("costoServicio", limpiarDecimal)}
              />
              <Err msg={errores.costoServicio} />

              <Input
                label="Capacidad maxima de clientes"
                inputMode="numeric"
                value={form.capacidadMaxima}
                onChange={cambiar("capacidadMaxima", limpiarEntero)}
              />
              <Err msg={errores.capacidadMaxima} />
            </>
          )}

          <Boton type="submit" className="w-full mt-2">
            {editandoId ? "Guardar cambios" : "Guardar usuario"}
          </Boton>
        </form>
      </Modal>
    </div>
  );
}