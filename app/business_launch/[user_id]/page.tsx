'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import ProductCard from './ProductCard';
import BuyNowModal from './BuyNowModal';
import { useCart } from '../context/CartContext'; // Ensure the correct path


interface Business {
  user_id: string;
  business_name: string;
  product_service: string;
  business_address: string;
  phone: string;
  website: string;
  cover_photo_url?: string;
  comments?: { user: string; text: string }[];
}

interface Product {
  id: number;
  name: string;
  description: string;
  price_inr: number;
  media_urls: string[];
}

export default function BusinessPage() {
  const { cart } = useCart(); // Retrieve the cart state from context
  const params = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchBusinessAndProducts = async () => {
      if (!params?.user_id) return;

      try {
        const { data: businessData, error: businessError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', params.user_id)
          .single();

        if (businessError) throw new Error('Error fetching business details.');

        setBusiness(businessData);

        const { data: productsData, error: productsError } = await supabase
          .from('new_products')
          .select('*')
          .eq('user_id', params.user_id);

        if (productsError) throw new Error('Error fetching products.');

        setProducts(productsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessAndProducts();
  }, [params?.user_id]);

  const handleCommentSubmit = async () => {
    if (!comment || !params?.user_id) return;

    const updatedComments = [...(business?.comments || []), { user: 'Anonymous', text: comment }];

    await supabase
      .from('users')
      .update({ comments: updatedComments })
      .eq('user_id', params.user_id);

    setBusiness((prev) => (prev ? { ...prev, comments: updatedComments } : prev));
    setComment('');
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (!business) return <div className="text-center">Business not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-5">
      {/* Cart Button */}
      <div className="fixed buttom-4 right-4">
        <a href="/cart">
          <button className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600">
            🛒 {cart.length}
          </button>
        </a>
      </div>

      {/* Cover Photo Section */}
      {business.cover_photo_url ? (
        <div className="w-full h-80 overflow-hidden rounded-lg mb-5">
          <img src={business.cover_photo_url} alt="Cover Photo" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-80 flex items-center justify-center bg-gray-200 text-gray-500 text-lg rounded-lg mb-5">
          No Cover Photo Available
        </div>
      )}

      {/* Business Information */}
      <div className="bg-white p-5 rounded-lg shadow mb-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">{business.business_name}</h1>
        <p className="text-lg text-gray-600 mb-2">{business.product_service}</p>
        <p className="text-gray-600 mb-2">Address: {business.business_address}</p>
        <p className="text-gray-600 mb-2">Phone: {business.phone}</p>
        <p className="text-gray-600">
          Website:{' '}
          <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
            {business.website}
          </a>
        </p>
      </div>

      {/* Products Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-5">Products</h2>
        <div className="flex flex-wrap gap-5 justify-center">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBuyNow={setSelectedProduct}
              addCartIcon={true} // Ensure this works
            />
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white p-5 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">Comments</h2>
        {business.comments?.length ? (
          <ul className="space-y-4 mb-5">
            {business.comments.map((comment, index) => (
              <li key={index} className="p-3 bg-gray-100 rounded-lg">
                <strong className="block text-gray-800">{comment.user}:</strong>
                <span className="text-gray-600">{comment.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No comments yet. Be the first to leave feedback!</p>
        )}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment..."
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-black py-2 px-4"
        ></textarea>
        <button onClick={handleCommentSubmit} className="bg-green-600 text-white py-2 px-4 rounded-lg">
          Submit Comment
        </button>
      </div>

      {/* Buy Now Modal */}
      {selectedProduct && (
        <BuyNowModal
          product={selectedProduct}
          businessId={business.user_id} // Pass the business ID
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
