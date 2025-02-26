import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import ProductMediaCarousel from './ProductMediaCarousel'; // Import the carousel component

interface Product {
  id: number;
  name: string;
  description: string;
  media_urls: string[];
}

interface BuyNowModalProps {
  product: Product;
  businessId: string;
  onClose: () => void;
}

const BuyNowModal: React.FC<BuyNowModalProps> = ({ product, businessId, onClose }) => {
  const [qty, setQty] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(''); // State to store the generated order ID

  useEffect(() => {
    const fetchReceiverEmail = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('email')
          .eq('user_id', businessId)
          .single();

        if (error) throw error;
        if (data) setReceiverEmail(data.email);
      } catch (error) {
        console.error('Error fetching receiver email:', error);
        alert('Unable to fetch receiver email.');
      }
    };

    fetchReceiverEmail();
  }, [businessId]);

  const generateOrderId = () => {
    const randomId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    return randomId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    const generatedOrderId = generateOrderId();

    const orderData = {
      order_id: generatedOrderId,
      product_id: product.id,
      product_name: product.name,
      quantity: parseInt(qty, 10),
      buyer_name: name,
      buyer_address: address,
      buyer_phone: phone,
      business_id: businessId,
      receiver_email: receiverEmail,
    };

    try {
      const { data, error } = await supabase.from('orders').insert(orderData);

      if (error) throw error;

      setOrderId(generatedOrderId);
      alert(`Order submitted successfully! Your Order ID is ${generatedOrderId}`);
      onClose();
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Buy {product.name}</h2>

        {/* Use the ProductMediaCarousel Component */}
        <ProductMediaCarousel mediaUrls={product.media_urls} />

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="qty" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              id="qty"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className={`bg-green-500 text-white py-2 px-4 rounded w-full hover:bg-green-600 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400 w-full"
          >
            Cancel
          </button>
        </form>

        {orderId && (
          <div className="mt-4 bg-green-100 p-4 rounded text-green-700 text-center">
            Your Order ID: <strong>{orderId}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyNowModal;
