import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function DataExport() {
  const [data, setData] = useState([]);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    let { data, error } = await supabase
      .from("market_data")
      .select("*")
      .order("date", { ascending: true });
    if (!error) setData(data);
  }

  function exportCSV() {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "market_data.csv");
  }

  function exportPDF() {
    const input = document.getElementById("dataTable");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("market_data.pdf");
    });
  }

  function exportPNG() {
    const input = document.getElementById("dataTable");
    html2canvas(input).then((canvas) => {
      canvas.toBlob((blob) => {
        saveAs(blob, "market_data.png");
      });
    });
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">📂 Market Data</h3>
      <div className="mb-4 space-x-2">
        <button onClick={exportCSV} className="bg-blue-600 text-white px-3 py-1 rounded">Export CSV</button>
        <button onClick={exportPDF} className="bg-red-600 text-white px-3 py-1 rounded">Export PDF</button>
        <button onClick={exportPNG} className="bg-green-600 text-white px-3 py-1 rounded">Export PNG</button>
      </div>
      <table id="dataTable" className="w-full border text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Category</th>
            <th className="p-2">Date</th>
            <th className="p-2">Item</th>
            <th className="p-2">City</th>
            <th className="p-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row)=>(
            <tr key={row.id} className="border-t">
              <td className="p-2">{row.category}</td>
              <td className="p-2">{row.date}</td>
              <td className="p-2">{row.item}</td>
              <td className="p-2">{row.city}</td>
              <td className="p-2">KSh {row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
