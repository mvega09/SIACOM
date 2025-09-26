export default function Table({ columns, data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white shadow rounded-2xl">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((col) => (
              <th key={col} className="p-2 text-left">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col} className="p-2">{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
