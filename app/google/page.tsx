"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./styles.css";

type SheetRow = string[];

export default function FilteredGoogleSheetWithSummation() {
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

        // Filter rows where the email in column J matches the logged-in user's email
        const userRows = result.data.filter(
          (row: SheetRow) => row[9]?.trim() === user.email.trim()
        );

        // Calculate total balance from column F (TSB)
        const balanceSum = userRows
          .slice(1) // Skip the header row
          .reduce((sum: number, row: SheetRow) => sum + (parseFloat(row[5]) || 0), 0);

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

  // Handle Real-Time Search
  useEffect(() => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    const searchResults =
      searchTerm.trim() === ""
        ? data
        : data.filter((row) =>
            row.some((cell) => cell.toLowerCase().includes(lowerCaseTerm))
          );
    setFilteredData(searchResults);
    setCurrentPage(1); // Reset to the first page when filtering
  }, [searchTerm, data]);

  // Pagination Logic
  const totalPages = Math.ceil((filteredData.length - 1) / rowsPerPage); // Skip header row
  const paginatedData = filteredData.slice(
    1 + (currentPage - 1) * rowsPerPage,
    1 + currentPage * rowsPerPage
  );

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
      head: [
        [
          "Sl",
          "Date",
          "Name",
          "Address",
          "PB",
          "DC",
          "TSB",
          "Note",
          "Status",
          "Cumulative Balance",
        ],
      ],
      body: selectedData.map((row, index) => [
        index + 1,
        row[0], // Date
        row[1], // Name
        row[2], // Address
        row[3], // PB
        row[4], // DC
        row[5], // TSB
        row[6], // Note
        row[7], // Status
        row[8], // Cumulative Balance
      ]),
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
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Sl</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>PB</th>
                  <th>DC</th>
                  <th>TSB</th>
                  <th>Note</th>
                  <th>Status</th>
                  <th>Cumulative Balance</th>
                </tr>
              </thead>
              <tbody>
              {(() => {
                let cumulativeBalance = filteredData
                  .slice(1, 1 + (currentPage - 1) * rowsPerPage) // Rows before current page
                  .reduce((sum: number, row: SheetRow) => sum + (parseFloat(row[5]) || 0), 0);
            
                return paginatedData.map((row, rowIndex) => {
                  const tsb = parseFloat(row[5]) || 0; // Parse column F (TSB)
                  cumulativeBalance += tsb; // Update cumulative balance
                
                  return (
                    <tr key={rowIndex}>
                      <td>{(currentPage - 1) * rowsPerPage + rowIndex + 1}</td> {/* SL No. */}
                      <td>{row[0]}</td> {/* Date */}
                      <td>{row[1]}</td> {/* Name */}
                      <td>{row[2]}</td> {/* Address */}
                      <td>{row[3]}</td> {/* PB */}
                      <td>{row[4]}</td> {/* DC */}
                      <td>{row[5]}</td> {/* TSB */}
                      <td>{row[6]}</td> {/* Note */}
                      <td>{row[7]}</td> {/* Status */}
                      <td>{cumulativeBalance.toFixed(2)}</td> {/* Cumulative Balance */}
                    </tr>
                  );
                });
              })()}
            </tbody>
            
            </table>
          </div>

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
