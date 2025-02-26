import React from 'react';
import { useCart } from './CartContext';

interface MediaContentProps {
  media: {
    id: number;
    name: string;
    description: string;
  };
}

const MediaContent: React.FC<MediaContentProps> = ({ media }) => {
  const { addToCart } = useCart();

  return (
    <div className="media-content">
      <h3>{media.name}</h3>
      <p>{media.description}</p>
      <button onClick={() => addToCart({ ...media, quantity: 1 })}>
        Add to Cart 🛒
      </button>
    </div>
  );
};

export default MediaContent;
