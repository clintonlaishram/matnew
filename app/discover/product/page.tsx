'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { useCart } from '../../business/context/CartContext';
import styles from './AllProductsPage.module.css';


interface Product {
  id: number;
  user_id: string;
  name: string;
  description: string;
  media_urls: string[];
  phone?: string;
  whatsapp?: string;
  price?: string;
}

const AllProductMediaPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');

        if (error) {
          throw new Error(error.message);
        }

        setProducts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleBuyNow = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
    });
    router.push('/cart');
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleWhatsApp = (whatsapp?: string) => {
    if (whatsapp) {
      window.open(whatsapp, '_blank');
    }
  };

  if (loading) return <p className={styles.loading}>Loading...</p>;

  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.exploreContainer}>
      {products.map((product) => (
        <div key={product.id} className={styles.mediaItem}>
          {product.media_urls.map((url, index) => {
            const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
            return isVideo ? (
              <video
                key={index}
                src={url}
                autoPlay
                loop
                muted
                playsInline
                className={styles.mediaContent}
              ></video>
            ) : (
              <img
                key={index}
                src={url}
                alt={`Product ${product.id}`}
                className={styles.mediaContent}
              />
            );
          })}
<div className={styles.overlay}>
  <div className={styles.productInfo}>
    <h2 className={styles.productName}>{product.name}</h2>
    <p className={styles.productDescription}>
      {product.description.length > 100
        ? `${product.description.slice(0, 100)}...`
        : product.description}
    </p>
  </div>
  <div className={styles.actionIcons}>
    <button
      className={styles.buyNowButton}
      onClick={() => handleBuyNow(product)}
      aria-label="Buy Now"
    >
      🛒
    </button>
    {product.phone && (
      <button
        className={styles.callIcon}
        onClick={() => handleCall(product.phone)}
        aria-label="Call"
      >
        📞
      </button>
    )}
    {product.whatsapp && (
      <button
        className={styles.whatsappIcon}
        onClick={() => handleWhatsApp(product.whatsapp)}
        aria-label="WhatsApp"
      >
        💬
      </button>
    )}
    <button
      className={styles.seeMoreButton}
      onClick={() => router.push(`/business/${product.user_id}`)}
      aria-label="See More"
    >
      More
    </button>
  </div>
</div>
        </div>
      ))}
    </div>
  );
};

export default AllProductMediaPage;
