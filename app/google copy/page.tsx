"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import "./styles.css";

type SheetRow = string[];

export default function FilteredGoogleSheet() {
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [data, setData] = useState<SheetRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

    if (!user?.email) {
      router.push("/login"); // Redirect to login if no user is logged in
      return;
    }

    setLoggedInEmail(user.email); // Store the logged-in user's email

    async function fetchData() {
      try {
        const response = await fetch("/api/sheets");
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }
        const result = await response.json();

        const filteredData = result.data.filter(
          (row: SheetRow) => row[3]?.trim() === user.email.trim() // Match column D:D (row[3]) with user email
        );

        setData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Failed to fetch data: ${String(error)}`);
      }
    }

    fetchData();
  }, [router]);

  return (
    <div className="container">
      <h1 className="title">My Google Sheets Data</h1>
      {loggedInEmail && (
        <p className="info">
          Logged in as: <strong>{loggedInEmail}</strong>
        </p>
      )}
      {error ? (
        <p className="error">{error}</p>
      ) : data.length > 0 ? (
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
      ) : (
        <p>No data available for the logged-in user.</p>
      )}
    </div>
  );
}
