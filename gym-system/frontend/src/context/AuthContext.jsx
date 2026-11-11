import { createContext, useContext, useState } from "react";
import api from "../api/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("gym_usuario");
    return guardado ? JSON.parse(guardado) : null;
  });

  async function login(correo, password) {
    const { data } = await api.post("/auth/login", { correo, password });
    localStorage.setItem("gym_token", data.token);
    localStorage.setItem("gym_usuario", JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data.usuario;
  }

  function logout() {
    localStorage.removeItem("gym_token");
    localStorage.removeItem("gym_usuario");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
