import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Cirugias from "./pages/Cirugias";
import Contactos from "./pages/Contactos";
import Evolucion from "./pages/Evolucion";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      {!token ? (
        <Routes>
          <Route path="/*" element={<Login />} />
        </Routes>
      ) : (
        <div className="flex">
          <Sidebar />
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/cirugias" element={<Cirugias />} />
            <Route path="/contactos" element={<Contactos />} />
            <Route path="/evolucion" element={<Evolucion />} />
          </Routes>
        </div>
      )}
    </Router>
  );
}
