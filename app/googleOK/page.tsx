"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./styles.css";

type SheetRow = string[];

export default function FilteredGoogleSheetWithSearchAndDownload() {
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [data, setData] = useState<SheetRow[]>([]);
  const [filteredData, setFilteredData] = useState<SheetRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
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
        const userRows = result.data.filter(
          (row: SheetRow) => row[3]?.trim() === user.email.trim()
        );

        // Calculate total balance from column E:E
        const balanceSum = userRows
          .slice(1) // Skip the header row
          .reduce((sum: number, row: SheetRow) => sum + (parseFloat(row[4]) || 0), 0);

        setData(userRows);
        setFilteredData(userRows); // Initialize filtered data
        setTotalBalance(balanceSum); // Set the calculated total balance
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Failed to fetch data: ${String(error)}`);
      }
    }

    fetchData();
  }, [router]);

  // Pagination Logic
  const totalPages = Math.ceil((filteredData.length - 1) / rowsPerPage); // Skip header row
  const paginatedData = filteredData.slice(
    1 + (currentPage - 1) * rowsPerPage,
    1 + currentPage * rowsPerPage
  );

  // Handle Search
  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const lowerCaseTerm = searchTerm.toLowerCase();
      const searchResults = data.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(lowerCaseTerm))
      );
      setFilteredData(searchResults);
      setCurrentPage(1);
    }
  };

  // Generate PDF for Selected Page Range
  const downloadPDF = () => {
    if (startPage < 1 || endPage > totalPages || startPage > endPage) {
      alert("Invalid page range selected.");
      return;
    }

    const doc = new jsPDF();
    doc.text(`Data from Page ${startPage} to ${endPage}`, 10, 10);

    const selectedData = [];
    for (let page = startPage; page <= endPage; page++) {
      const startIndex = 1 + (page - 1) * rowsPerPage;
      const endIndex = 1 + page * rowsPerPage;
      selectedData.push(...filteredData.slice(startIndex, endIndex));
    }

    autoTable(doc, {
      head: [["SL No.", ...data[0]]], // Include SL No. in the header row
      body: selectedData.map((row, index) => [index + 1, ...row]), // Add SL No.
    });

    doc.save(`data_pages_${startPage}_to_${endPage}.pdf`);
  };

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
      ) : filteredData.length > 1 ? (
        <>
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          <table className="styled-table">
            <thead>
              <tr>
                <th>SL No.</th>
                {filteredData[0]?.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
                <th>Cumulative Balance</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let cumulativeBalance = filteredData
                  .slice(1, 1 + (currentPage - 1) * rowsPerPage) // Rows before current page
                  .reduce((sum: number, row: SheetRow) => sum + (parseFloat(row[4]) || 0), 0);

                return paginatedData.map((row, rowIndex) => {
                  const balance = parseFloat(row[4]) || 0; // Parse column E:E
                  cumulativeBalance += balance; // Update cumulative balance

                  return (
                    <tr key={rowIndex}>
                      <td>{(currentPage - 1) * rowsPerPage + rowIndex + 1}</td> {/* SL No. */}
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                      <td>{cumulativeBalance.toFixed(2)}</td>
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

          {/* Page Range Selection for PDF */}
          <div className="pdf-selection">
            <label>From Page:</label>
            <input
              type="number"
              value={startPage}
              onChange={(e) => setStartPage(Number(e.target.value))}
              min={1}
              max={totalPages}
            />
            <label>To Page:</label>
            <input
              type="number"
              value={endPage}
              onChange={(e) => setEndPage(Number(e.target.value))}
              min={1}
              max={totalPages}
            />
            <button onClick={downloadPDF}>Download PDF</button>
          </div>
        </>
      ) : (
        <p>No data available for the logged-in user.</p>
      )}
    </div>
  );
}
