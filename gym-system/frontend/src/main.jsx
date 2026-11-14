import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { TemaProvider } from "./context/TemaContext.jsx";
import { IdiomaProvider } from "./context/IdiomaContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <IdiomaProvider>
        <TemaProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </TemaProvider>
      </IdiomaProvider>
    </BrowserRouter>
  </React.StrictMode>
);