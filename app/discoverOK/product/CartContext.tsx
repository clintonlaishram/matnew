import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define types for the media item and cart context
interface MediaItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
}

interface CartContextType {
  cart: MediaItem[];
  addToCart: (item: MediaItem) => void;
  removeFromCart: (itemId: number) => void;
}

// Cart context to share cart state across components
const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<MediaItem[]>([]);

  const addToCart = (item: MediaItem) => {
    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex((i) => i.id === item.id);
      if (itemIndex === -1) {
        return [...prevCart, { ...item, quantity: 1 }];
      } else {
        const updatedCart = [...prevCart];
        updatedCart[itemIndex].quantity += 1;
        return updatedCart;
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
