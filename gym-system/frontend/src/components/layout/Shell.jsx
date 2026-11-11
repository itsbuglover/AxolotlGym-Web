import Sidebar from "./Sidebar.jsx";

export default function Shell({ children }) {
  return (
    <div className="flex h-screen bg-[#222223] text-[#EEEEF3]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}