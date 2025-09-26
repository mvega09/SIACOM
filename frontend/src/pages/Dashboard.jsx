import { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    API.get("/dashboard/stats").then((res) => setStats(res.data));
  }, []);

  return (
    <div className="flex">
      <div className="flex-1">
        <Navbar />
        <div className="p-6 bg-gray-50 min-h-screen">
          <h1 className="text-2xl font-bold mb-6">Dashboard Gerencial</h1>
          <div className="grid grid-cols-4 gap-4">
            <StatCard title="Pacientes" value={stats.total_pacientes} />
            <StatCard title="Cirugías Hoy" value={stats.cirugias_hoy} />
            <StatCard title="Cirugías Activas" value={stats.cirugias_activas} />
            <StatCard title="Pacientes Críticos" value={stats.pacientes_criticos} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow text-center">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-3xl font-bold text-indigo-600">{value || 0}</p>
    </div>
  );
}
