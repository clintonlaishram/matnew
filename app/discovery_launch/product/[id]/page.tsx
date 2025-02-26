'use client';

import { use } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import styles from './ProductDetails.module.css';
import Image from 'next/image'; // Importing Image

// Define the Product type
interface Product {
  id: number;
  user_id: string;
  name: string;
  description: string;
  media_urls: string[];
  price: number;
}

// Async function to fetch product details
async function fetchProduct(id: string) {
  const { data, error } = await supabase.from('new_products').select('*').eq('id', id).single();
  if (error) {
    throw new Error(error.message); // Let errors propagate to the error boundary
  }
  return data;
}

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Unwrap the params using `use`
  const product: Product = use(fetchProduct(id)); // Fetch product details using `use`

  // Render the product details
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <Image src={product.media_urls[0]} alt={product.name} className={styles.image} />
      </div>
      <div className={styles.details}>
        <h1 className={styles.name}>{product.name}</h1>
        <p className={styles.price}>₹{product.price}</p>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.buttonGroup}>
          <button
            className={styles.addToCartButton}
            onClick={() => alert('Product added to cart!')}
          >
            Add to Cart
          </button>
          <button
            className={styles.buyNowButton}
            onClick={() => alert('Proceeding to checkout!')}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
