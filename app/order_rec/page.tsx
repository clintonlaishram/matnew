'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './OrdersPage.module.css';

interface OrderItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  total: string;
}

interface Order {
  id: number;
  order_id: string;
  buyer_name: string;
  buyer_address: string;
  buyer_phone: string;
  created_at: string;
  receiver_email: string;
  status?: string; // Status field for orders
  item_list: OrderItem[]; // List of items in the order
  total_price: string; // Total price of the order
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null); // For editing status
  const [newStatus, setNewStatus] = useState<string>(''); // New status value
  const [newDate, setNewDate] = useState<string>(''); // New date value for date-based statuses

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');

      if (!user?.email) {
        alert('Please log in to view orders.');
        return;
      }

      try {
        const { data: fetchedOrders, error: fetchError } = await supabase
          .from('order_rec')
          .select('*')
          .eq('email', user.email);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (fetchedOrders) {
          // Sort orders to show "Pending" first
          const sortedOrders = fetchedOrders.sort((a, b) =>
            a.status === 'Pending' ? -1 : b.status === 'Pending' ? 1 : 0
          );
          setOrders(sortedOrders);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleEditStatus = (order: Order) => {
    setEditingOrder(order); // Open the editing modal for the selected order
    setNewStatus(order.status || ''); // Prepopulate with current status
    setNewDate(''); // Clear the date input
  };

  const handleSaveStatus = async () => {
    if (!editingOrder) return;

    const formattedDate =
      newDate !== ''
        ? new Date(newDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '';

    const updatedStatus =
      newStatus === 'Dispatched with date' || newStatus === 'Delivered with date'
        ? `${newStatus.split(' ')[0]} ${formattedDate}`
        : newStatus;

    try {
      const { error } = await supabase
        .from('order_rec')
        .update({ status: updatedStatus })
        .eq('id', editingOrder.id);

      if (error) {
        throw new Error(error.message);
      }

      // Update the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === editingOrder.id ? { ...order, status: updatedStatus } : order
        )
      );

      setEditingOrder(null); // Close the modal
      alert('Status updated successfully!');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Orders for Your Business</h2>

      {error && <p className={styles.error}>{error}</p>}

      {/* Desktop Table View */}
      <table className={styles.ordersTable}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Buyer Name</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Total Price</th>
            <th>Status</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.order_id}</td>
              <td>{order.buyer_name}</td>
              <td>{order.buyer_address}</td>
              <td>{order.buyer_phone}</td>
              <td>${order.total_price}</td>
              <td>{order.status || 'Pending'}</td>
              <td>
                <details>
                  <summary>View Items</summary>
                  <ul>
                    {order.item_list.map((item) => (
                      <li key={item.id}>
                        {item.name} - {item.quantity} pcs - ${item.total}
                      </li>
                    ))}
                  </ul>
                </details>
              </td>
              <td>
                <button
                  onClick={() => handleEditStatus(order)}
                  className={styles.editButton}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Status Modal */}
      {editingOrder && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Edit Status for Order {editingOrder.order_id}</h3>
            <label className={styles.modalLabel}>
              New Status:
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className={styles.modalSelect}
              >
                <option value="In-Progress">In-Progress</option>
                <option value="Dispatched with date">Dispatched with date</option>
                <option value="Delivered with date">Delivered with date</option>
              </select>
            </label>

            {/* Show date input for date-based statuses */}
            {(newStatus === 'Dispatched with date' ||
              newStatus === 'Delivered with date') && (
              <label className={styles.modalLabel}>
                Date:
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className={styles.modalInput}
                />
              </label>
            )}

            <div className={styles.modalActions}>
              <button onClick={handleSaveStatus} className={styles.saveButton}>
                Save
              </button>
              <button
                onClick={() => setEditingOrder(null)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
