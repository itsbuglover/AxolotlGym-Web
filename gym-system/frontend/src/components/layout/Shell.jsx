import Sidebar from "./Sidebar.jsx";

export default function Shell({ children }) {
  return (
    <div className="flex h-screen bg-[var(--c-fondo)] text-[var(--c-texto)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}