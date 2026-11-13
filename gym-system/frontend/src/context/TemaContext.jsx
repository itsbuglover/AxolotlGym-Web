import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);

export function TemaProvider({ children }) {
  const [claro, setClaro] = useState(() => localStorage.getItem("tema") === "claro");

  useEffect(() => {
    document.documentElement.dataset.tema = claro ? "claro" : "oscuro";
    localStorage.setItem("tema", claro ? "claro" : "oscuro");
  }, [claro]);

  return (
    <Ctx.Provider value={{ claro, alternar: () => setClaro((c) => !c) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTema = () => useContext(Ctx);