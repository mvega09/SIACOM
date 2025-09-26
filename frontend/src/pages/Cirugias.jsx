import { useEffect, useState } from "react";
import API from "../api/api";
import Table from "../components/Table";
import Navbar from "../components/Navbar";

export default function Cirugias() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/cirugias/1").then((res) => setData(res.data)); // ejemplo con paciente_id=1
  }, []);

  return (
    <div className="flex-1">
      <Navbar />
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Cirugías</h1>
        <Table
          columns={["id", "tipo_cirugia_nombre", "fecha_programada", "estado"]}
          data={data}
        />
      </div>
    </div>
  );
}
