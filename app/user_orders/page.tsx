'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../../types/order'; // Define the Order type
import styles from './OrderData.module.css';

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // For search functionality
  const [statusFilter, setStatusFilter] = useState<string>(''); // For status filter
  const [createdDateFilter, setCreatedDateFilter] = useState<string>(''); // For created date filter
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(''); // Start date for filtering
  const [endDate, setEndDate] = useState<string>(''); // End date for filtering
  const router = useRouter();

  const recordsPerPage = 10; // Number of records per page

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');

      if (!user?.email) {
        router.push('/login'); // Redirect to login if no email is found
        return;
      }

      try {
        const { data: fetchedOrders, error: fetchError } = await supabase
          .from('order_data')
          .select('*')
          .eq('vendor_email', user.email)
          .order('created_at', { ascending: true });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (fetchedOrders) {
          setOrders(fetchedOrders);
          setFilteredOrders(fetchedOrders); // Initialize filtered orders
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const applyFilters = () => {
    let updatedOrders = orders;

    if (startDate && endDate) {
      updatedOrders = updatedOrders.filter((order) => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    if (statusFilter) {
      updatedOrders = updatedOrders.filter((order) => order.status === statusFilter);
    }

    if (createdDateFilter) {
      updatedOrders = updatedOrders.filter(
        (order) =>
          new Date(order.created_at).toISOString().split('T')[0] === createdDateFilter
      );
    }

    if (searchTerm.trim() !== '') {
      updatedOrders = updatedOrders.filter((order) =>
        Object.values(order)
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(updatedOrders);
    setCurrentPage(1); // Reset to first page on applying filters
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCreatedDateFilter('');
    setStartDate('');
    setEndDate('');
    setFilteredOrders(orders);
    setCurrentPage(1);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);

  // Calculate cumulative balance across pages
  const runningBalance = filteredOrders.slice(0, indexOfLastRecord).reduce(
    (sum, order) => sum + (Number(order.tsb) || 0),
    0
  );

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Filtered Orders', 10, 10);

    autoTable(doc, {
      head: [['ID', 'Drop Details', 'Pickup Details', 'Order Type', 'PB Amount', 'DC Amount', 'TSB', 'Balance', 'Status', 'Created At']],
      body: filteredOrders.map((order, index) => {
        const cumulativeBalance = filteredOrders
          .slice(0, index + 1)
          .reduce((sum, o) => sum + (Number(o.tsb) || 0), 0);
        return [
          order.id,
          `${order.drop_name || ''}, ${order.drop_address || ''}, ${order.drop_phone || ''}`,
          `${order.pickup_name || ''}, ${order.pickup_address || ''}, ${order.pickup_phone || ''}`,
          order.orderType,
          `${order.pbAmt || ''} (${order.pb || ''})`,
          `${order.dcAmt || ''} (${order.dc || ''})`,
          order.tsb,
          cumulativeBalance,
          order.status,
          new Date(order.created_at).toLocaleString(),
        ];
      }),
    });

    doc.save('filtered_orders.pdf');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Your Orders</h2>
      <p className={styles.mobileOnly}>Balance is the sum of TSB(Total Settlement Bill). For better version please check this layout onn desktop or download as pdf.</p>
      <div className={styles.bln}>
      <strong >Running Balance:</strong> {runningBalance}
      </div>
      {/* Filters */}
      <div className={styles.filterContainer}>
        

        <div className={styles.statusFilter}>
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className={styles.createdDateFilter}>
          <label>Created Date:</label>
          <input
            type="date"
            value={createdDateFilter}
            onChange={(e) => setCreatedDateFilter(e.target.value)}
          />
        </div>

        <button className={styles.resetButton} onClick={resetFilters}>
          Reset Filters
        </button>
      </div>
      <br /><br /><br />
      {/* Search */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.searchButton} onClick={applyFilters}>
          Search
        </button>
      </div>

      

      {error && <p className={styles.error}>{error}</p>}
      {filteredOrders.length === 0 ? (
        <p>No orders found for your criteria.</p>
      ) : (
        <>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>SL</th>
                <th>ID</th>
                <th>Drop Details</th>
                <th>Pickup Details</th>
                <th>Order Type</th>
                <th>PB Amount</th>
                <th>DC Amount</th>
                <th>TSB</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let cumulativeBalance = filteredOrders
                  .slice(0, indexOfFirstRecord)
                  .reduce((sum, order) => sum + (Number(order.tsb) || 0), 0);

                return currentOrders.map((order, index) => {
                  const tsbValue = Number(order.tsb) || 0;
                  cumulativeBalance += tsbValue;

                  return (
                    <tr key={order.id}>
                      <td>{indexOfFirstRecord + index + 1}</td>
                      <td>{order.id}</td>
                      <td>{`${order.drop_name || ''}, ${order.drop_address || ''}, ${order.drop_phone || ''}`}</td>
                      <td>{`${order.pickup_name || ''}, ${order.pickup_address || ''}, ${order.pickup_phone || ''}`}</td>
                      <td>{order.orderType}</td>
                      <td>{`${order.pbAmt || ''} (${order.pb || ''})`}</td>
                      <td>{`${order.dcAmt || ''} (${order.dc || ''})`}</td>
                      <td>{tsbValue}</td>
                      <td>{cumulativeBalance}</td>
                      <td>{order.status}</td>
                      <td>{new Date(order.created_at).toLocaleString()}</td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className={styles.pagination}>
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

          {/* Total Balance */}
      <div>
        <p>
          <strong>Running Balance:</strong> {runningBalance}
        </p>
        <div className={styles.dateRangeContainer}>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button className={styles.downloadButton} onClick={downloadPDF}>
          Download as PDF
        </button>
      </div>
        </>
      )}
    </div>
  );
}
