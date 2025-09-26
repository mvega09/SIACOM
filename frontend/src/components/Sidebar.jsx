import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="bg-indigo-700 text-white w-64 min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-10">SIACOM</h1>
      <nav className="flex flex-col gap-4">
        <Link to="/dashboard" className="hover:bg-indigo-600 p-2 rounded">
          Dashboard
        </Link>
        <Link to="/pacientes" className="hover:bg-indigo-600 p-2 rounded">
          Pacientes
        </Link>
        <Link to="/cirugias" className="hover:bg-indigo-600 p-2 rounded">
          Cirugías
        </Link>
        <Link to="/contactos" className="hover:bg-indigo-600 p-2 rounded">
          Contactos
        </Link>
        <Link to="/evolucion" className="hover:bg-indigo-600 p-2 rounded">
          Evolución
        </Link>
      </nav>
    </div>
  );
}
