import jwt from "jsonwebtoken";

// Verifica que exista un token valido en el header Authorization: Bearer <token>
export function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, mensaje: "Token no proporcionado" });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secreto_dev");
    req.usuario = payload; // { id, rol, nombre, ... }
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, mensaje: "Token invalido o expirado" });
  }
}

// Restringe el acceso a ciertos roles: permitirRoles("dueno", "recepcion")
export function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ ok: false, mensaje: "No tienes permisos para esta accion" });
    }
    next();
  };
}