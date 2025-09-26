import { useEffect, useState } from "react";
import API from "../api/api";
import Table from "../components/Table";
import Navbar from "../components/Navbar";

export default function Contactos() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/contactos?limit=50").then((res) => setData(res.data));
  }, []);

  return (
    <div className="flex-1">
      <Navbar />
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Contactos</h1>
        <Table
          columns={["id", "nombre", "apellido", "telefono", "email"]}
          data={data}
        />
      </div>
    </div>
  );
}
