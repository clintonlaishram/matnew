"use client";

import { useEffect, useState } from "react";
import "./styles.css"; // Assuming you place the CSS in a styles.css file

type SheetRow = string[];

export default function GooglePage() {
  const [data, setData] = useState<SheetRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/sheets");
        if (!response.ok) {
          const errorText = await response.text(); // Read error details
          throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }
        const result = await response.json();
        setData(result.data); // Assuming result.data is a 2D array
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Failed to fetch data: ${String(error)}`);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Google Sheets Data</h1>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              {data[0]?.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
