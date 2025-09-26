import { useEffect, useState } from "react";
import API from "../api/api";
import Table from "../components/Table";
import Navbar from "../components/Navbar";

export default function Evolucion() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/evoluciones/1").then((res) => setData(res.data)); // paciente_id=1
  }, []);

  return (
    <div className="flex-1">
      <Navbar />
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Evoluciones Clínicas</h1>
        <Table
          columns={["id", "estado_general", "descripcion", "medico_nombre"]}
          data={data}
        />
      </div>
    </div>
  );
}
