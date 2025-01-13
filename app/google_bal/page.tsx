"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./styles.css";

type SheetRow = string[];

export default function FilteredGoogleSheetWithBalance() {
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [data, setData] = useState<SheetRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 15; // Number of rows per page
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

    if (!user?.email) {
      router.push("/login"); // Redirect to login if no email is found
      return;
    }

    setLoggedInEmail(user.email); // Store logged-in user's email

    async function fetchData() {
      try {
        const response = await fetch("/api/sheets");
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }
        const result = await response.json();

        // Filter rows where the email in column D matches the logged-in user's email
        const filteredData = result.data.filter(
          (row: SheetRow) => row[3]?.trim() === user.email.trim()
        );

        // Calculate total balance from column E:E
        const balanceSum = filteredData
          .slice(1) // Skip the header row
          .reduce((sum: number, row: SheetRow) => sum + (parseFloat(row[4]) || 0), 0);

        setData(filteredData);
        setTotalBalance(balanceSum); // Set the calculated total balance
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Failed to fetch data: ${String(error)}`);
      }
    }

    fetchData();
  }, [router]);

  // Pagination Logic
  const totalPages = Math.ceil((data.length - 1) / rowsPerPage); // Skip header row
  const paginatedData = data.slice(
    1 + (currentPage - 1) * rowsPerPage,
    1 + currentPage * rowsPerPage
  );

  return (
    <div className="container">
      <h1 className="title">My Google Sheets Data</h1>
      {loggedInEmail && (
        <p className="info">
          Logged in as: <strong>{loggedInEmail}</strong>
        </p>
      )}
      <p className="total-balance">
        <strong>Total Balance:</strong> {totalBalance.toFixed(2)}
      </p>
      {error ? (
        <p className="error">{error}</p>
      ) : data.length > 1 ? (
        <>
          <table className="styled-table">
            <thead>
              <tr>
                {data[0]?.map((header, index) => (
                  <th key={index}>
                    {header}
                    {index === 4 && " (Balance)"} {/* Add label for balance column */}
                  </th>
                ))}
                <th>Balance Extra</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let cumulativeBalance = 0; // Initialize cumulative balance
                return paginatedData.map((row, rowIndex) => {
                  const balance = parseFloat(row[4]) || 0; // Parse column E:E
                  cumulativeBalance += balance; // Update cumulative balance

                  return (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                      <td>{cumulativeBalance.toFixed(2)}</td> {/* Balance Extra */}
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p>No data available for the logged-in user.</p>
      )}
    </div>
  );
}
