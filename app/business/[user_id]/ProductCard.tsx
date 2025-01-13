import React, { useState } from 'react';
import { useCart } from '../context/CartContext';


interface Product {
  id: number;
  name: string;
  description: string;
  price_inr: number;
  media_urls: string[];
  price?: string;
}

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
  addCartIcon?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onBuyNow, addCartIcon }) => {
  const { addToCart } = useCart();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const handleNextMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % product.media_urls.length);
  };

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prevIndex) =>
      prevIndex === 0 ? product.media_urls.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <div className="relative w-full h-64 overflow-hidden rounded-lg mb-4 group">
        {product.media_urls.map((url, index) => {
          const isVisible = index === currentMediaIndex;
          const isVideo = /\.(mp4|webm|ogg)$/i.test(url);

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {isVideo ? (
                <video
                  src={url}
                  controls
                  muted
                  loop
                  className="w-full h-full object-cover rounded-lg"
                ></video>
              ) : (
                <img
                  src={url}
                  alt={`Product ${product.id} - Media ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
              {addCartIcon && (
                <button
                  className="absolute top-2 right-2 bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600"
                  onClick={() =>
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price || 'N/A',
                      qty: 1,
                    })
                  }
                >
                  🛒
                </button>
              )}
            </div>
          );
        })}

        {/* Media navigation buttons */}
        {product.media_urls.length > 1 && (
          <>
            <button
              onClick={handlePrevMedia}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              ❮
            </button>
            <button
              onClick={handleNextMedia}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              ❯
            </button>
          </>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{product.name}</h3>
      <p className="text-sm text-gray-600 mb-4 text-center">{product.description}</p>
      <p className="text-sm text-gray-600 mb-4 text-center">Rs. {product.price_inr}</p>
      <div className="flex gap-4">
        <button
          onClick={() =>
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price || 'N/A',
              qty: 1,
            })
          }
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 flex-1"
        >
          Add to Cart 🛒
        </button>
        <button
          onClick={() => onBuyNow(product)}
          className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-black hover:text-green-600 flex-1"
        >

          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
