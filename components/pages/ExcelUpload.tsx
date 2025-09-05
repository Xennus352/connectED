"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { importUserRow } from "@/actions/importUserRow";

export default function ExcelUpload() {
  const [rows, setRows] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    setRows(worksheet);
  };

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    for (const row of rows) {
      // ✅ Ensure plain object
      const plainRow = JSON.parse(JSON.stringify(row));

      const result = await importUserRow(plainRow);

      if (result) {
        console.log("Success:", result.success);
        console.log("Inserted:", result.userId);
      } 
    }
    alert("All users created successfully!");
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("An unexpected error occurred");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="p-4">
      <div className="text-center cursor-pointer">
        <label htmlFor="excel" className="cursor-pointer hover:text-gray-100">
          Click here to import
          <input
            id="excel"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
          />
          <span className="label">📂</span>
        </label>
      </div>

      {rows.length > 0 && (
        <>
          <table className="table-auto border mt-4 w-full">
            <thead>
              <tr>
                {Object.keys(rows[0]).map((col) => (
                  <th key={col} className="border px-2 py-1 text-left">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {Object.entries(row).map(([col, val], j) => (
                    <td key={j} className="border px-2 py-1">
                      {col.toLowerCase().includes("image") ||
                      col.toLowerCase().includes("avatar") ? (
                        <img
                          src={String(val)}
                          alt="profile"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        String(val)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-4 px-4 py-2 cursor-pointer bg-blue-600 text-white rounded disabled:bg-gray-400"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
