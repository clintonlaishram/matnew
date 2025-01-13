'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface CartItem {
  id: number;
  name: string;
  price?: string;
  qty: number;
}

interface BuyNowFormProps {
  items: CartItem[];
  onClose: () => void;
}

const BuyNowForm: React.FC<BuyNowFormProps> = ({ items, onClose }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');

  const generateOrderId = () => `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedOrderId = generateOrderId();

    const fetchEmailsAndBusiness = async () => {
      const productIds = items.map((item) => item.id);
      const { data: products, error } = await supabase
        .from('products')
        .select('id, business_id, email')
        .in('id', productIds);

      if (error) {
        console.error('Error fetching related products and emails:', error);
        throw error;
      }
      return products;
    };

    try {
      const products = await fetchEmailsAndBusiness();
      const email = products[0]?.email || '';

      const totalPrice = items.reduce((acc, item) => {
        const itemTotal = item.price ? parseFloat(item.price) * item.qty : 0;
        return acc + itemTotal;
      }, 0);

      const orderData = {
        order_id: generatedOrderId,
        buyer_name: name,
        buyer_address: address,
        buyer_phone: phone,
        business_id: products[0]?.business_id || '',
        email,
        total_price: totalPrice.toFixed(2),
        item_list: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price || 'N/A',
          quantity: item.qty,
          total: item.price ? (parseFloat(item.price) * item.qty).toFixed(2) : 'N/A',
        })),
      };

      console.log('Order Data:', JSON.stringify(orderData, null, 2));

      const { data, error } = await supabase.from('order_rec').insert(orderData);

      if (error) {
        console.error('Supabase Error:', error);
        throw error;
      }

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

  const calculateTotal = () =>
    items.reduce((acc, item) => {
      const itemTotal = item.price ? parseFloat(item.price) * item.qty : 0;
      return acc + itemTotal;
    }, 0);

  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const formStyles: React.CSSProperties = {
    background: '#1e1e1e',
    color: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.6)',
    width: '24rem',
  };

  const inputStyles: React.CSSProperties = {
    background: '#333',
    color: 'white',
    border: '1px solid #555',
    borderRadius: '0.25rem',
    padding: '0.5rem',
    width: '100%',
  };

  const buttonStyles: React.CSSProperties = {
    background: '#1abc9c',
    color: 'white',
    padding: '0.75rem',
    borderRadius: '0.25rem',
    border: 'none',
    fontSize: '1rem',
    marginTop: '0.5rem',
    width: '100%',
    cursor: 'pointer',
    transition: 'background 0.3s',
  };

  const cancelButtonStyles: React.CSSProperties = {
    background: '#777',
    color: 'white',
    marginTop: '0.5rem',
    padding: '0.75rem',
    borderRadius: '0.25rem',
    border: 'none',
    fontSize: '1rem',
    width: '100%',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyles}>
      <div style={formStyles}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Buy All Items
        </h2>
        <div style={{ marginBottom: '1rem' }}>
          {items.map((item) => (
            <div key={item.id} style={{ marginBottom: '1rem' }}>
              <p>
                <strong>Item:</strong> {item.name}
              </p>
              <p>
                <strong>Price:</strong> {item.price || 'N/A'}
              </p>
              <p>
                <strong>Quantity:</strong> {item.qty}
              </p>
              <p>
                <strong>Total:</strong>{' '}
                {item.price
                  ? `$${(parseFloat(item.price) * item.qty).toFixed(2)}`
                  : 'N/A'}
              </p>
              <hr style={{ margin: '1rem 0', borderColor: '#444' }} />
            </div>
          ))}
        </div>
        <p style={{ marginBottom: '1rem' }}>
          <strong>Grand Total:</strong> ${calculateTotal().toFixed(2)}
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyles}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={inputStyles}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyles}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              ...buttonStyles,
              opacity: isSubmitting ? 0.5 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" onClick={onClose} style={cancelButtonStyles}>
            Cancel
          </button>
        </form>

        {orderId && (
          <div
            style={{
              marginTop: '1rem',
              background: '#2ecc71',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              textAlign: 'center',
            }}
          >
            Your Order ID: <strong>{orderId}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyNowForm;
