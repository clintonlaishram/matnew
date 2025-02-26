import React from 'react';
import { useCart } from './CartContext';

const FloatingCart: React.FC = () => {
  const { cart, removeFromCart } = useCart();

  return (
    <div className="floating-cart">
      <button className="cart-toggle">
        🛒 {cart.length} items
      </button>
      <div className="cart-dropdown">
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="cart-item">
              <p>{item.name}</p>
              <p>Quantity: {item.quantity}</p>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FloatingCart;
