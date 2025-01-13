'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type OrderData = {
  id: string;
  order_id: string;
  product_name: string;
  buyer_name: string;
  buyer_address: string;
  buyer_phone: string;
  status: string;
  created_at: string;
};

const SearchOrderPage = () => {
  const [orderId, setOrderId] = useState<string>('');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!orderId.trim()) {
      setError('Order ID is required.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const { data, error } = await supabase
        .from('orders') // Replace with the correct table name
        .select('*')
        .eq('order_id', orderId.trim())
        .single();

      if (error) {
        setError(error.message);
      } else {
        setOrderData(data as OrderData);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Search for an Order</h1>

      {/* Search Input */}
      <div className="flex flex-col items-center">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter Order ID"
          className="border border-gray-300 rounded-md p-2 mb-4 w-full text-lg"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`px-6 py-2 text-lg font-medium rounded-md text-white ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 transition'
          }`}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500 mt-4">{error}</div>}

      {/* Display Order Details */}
      {orderData && (
        <div className="mt-6 p-4 border rounded-md bg-gray-100">
          <h2 className="text-xl font-semibold mb-2">Order Details</h2>
          <p>
            <strong>Order ID:</strong> {orderData.order_id}
          </p>
          <p>
            <strong>Product Name:</strong> {orderData.product_name}
          </p>
          <p>
            <strong>Buyer Name:</strong> {orderData.buyer_name}
          </p>
          <p>
            <strong>Buyer Address:</strong> {orderData.buyer_address}
          </p>
          <p>
            <strong>Buyer Phone:</strong> {orderData.buyer_phone}
          </p>
          <p>
            <strong>Status:</strong> {orderData.status}
          </p>
          <p>
            <strong>Created At:</strong>{' '}
            {new Date(orderData.created_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchOrderPage;
