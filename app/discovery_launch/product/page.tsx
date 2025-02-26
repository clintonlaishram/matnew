'use client'; // Ensure this is at the top to mark it as a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { useCart } from '../../business/context/CartContext';
import styles from './AllProductsPage.module.css';

interface Product {
  id: number;
  user_id: string;
  user_name: string;
  name: string;
  description: string;
  media_urls: string[];
  phone?: string;
  whatsapp?: string;
  price_inr: string;
  price?: string;
  category?: string;
}

const AllProductMediaPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('new_products').select('*');
        if (error) throw new Error(error.message);
        setProducts(data || []);
        setFilteredProducts(data || []);

        const allCategories = [...new Set(data?.map((product) => product.category))];
        setCategories(allCategories);
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

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price || 'N/A',
      qty: 1,
    });
    setSelectedProduct(product);
  };

  const handleCall = (phone?: string) => {
    if (phone) window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (whatsapp?: string) => {
    if (whatsapp) window.open(whatsapp, '_blank');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    filterProducts(e.target.value, selectedCategory);
  };

  const filterProducts = (search: string, category: string | null) => {
    let filtered = products;

    if (search) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter((product) => product.category === category);
    }

    setFilteredProducts(filtered);
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  if (loading) return <p className={styles.loading}>Loading...</p>;

  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.exploreContainer}>
      <div className="flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white-800 md:text-6xl">Explore Products</h1>
      </div>

      <button className={styles.exploreSellersButton} onClick={() => router.push('/discover_full')}>
        Explore Sellers
      </button>

      {/* Category Filter */}
      <div className={styles.categoryButtons}>
  {categories.map((category, index) => (
    <button
      key={index}
      className={`${styles.categoryButton} ${selectedCategory === category ? styles.selected : ''}`}
      onClick={() => {
        setSelectedCategory(category);
        filterProducts(searchTerm, category);
      }}
    >
      {category}
    </button>
  ))}
  <button
    className={`${styles.categoryButton} ${!selectedCategory ? styles.selected : ''}`}
    onClick={() => {
      setSelectedCategory(null);
      filterProducts(searchTerm, null);
    }}
  >
    All Categories
  </button>
</div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search products..."
          className={styles.searchInput}
        />
      </div>

      <a href="/cart" className="text-2xl font-bold mb-5 text-gray-500 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
        My carts🛒
      </a>

      <div className={styles.productList}>
        {filteredProducts.map((product) => (
          <div key={product.id} className={styles.mediaItem}>
            <div onClick={() => openModal(product)} className={styles.mediaContentWrapper}>
              {product.media_urls.map((url, index) => {
                const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
                return isVideo ? (
                  <video key={index} src={url} autoPlay loop muted playsInline className={styles.mediaContent}></video>
                ) : (
                  <img key={index} src={url} alt={`Product ${product.id}`} className={styles.mediaContent} />
                );
              })}
            </div>

            <div className={styles.overlay}>
              <div className={styles.productInfo}>
                <h2 className={styles.productName}>{product.name}</h2>
                <p className={styles.productDescription}>
                  {product.description.length > 100 ? `${product.description.slice(0, 100)}...` : product.description}
                </p>
              </div>
              <div className={styles.actionIcons}>
                <button className={styles.buyNowButton} onClick={() => handleAddToCart(product)} aria-label="Add to Cart">
                  🛒
                </button>
                {product.phone && (
                  <button className={styles.callIcon} onClick={() => handleCall(product.phone)} aria-label="Call">
                    📞
                  </button>
                )}
                {product.whatsapp && (
                  <button className={styles.whatsappIcon} onClick={() => handleWhatsApp(product.whatsapp)} aria-label="WhatsApp">
                    💬
                  </button>
                )}
                <button className={styles.infoButton} onClick={() => openModal(product)} aria-label="More Info">
                  ℹ️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedProduct && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className={styles.closeButton}>
              ✖️
            </button>
            <h2 className={styles.productName}>{selectedProduct.name}</h2>
            <p className={styles.productDescription}>{selectedProduct.description}</p>
            <p className={styles.productCategory}>Category: {selectedProduct.category || 'N/A'}</p>
            <div className={styles.modalMedia}>
              {selectedProduct.media_urls.map((url, index) => {
                const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
                return isVideo ? (
                  <video key={index} src={url} controls className={styles.modalMediaContent}></video>
                ) : (
                  <img key={index} src={url} alt={`Product ${selectedProduct.id}`} className={styles.modalMediaContent} />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => {
              handleAddToCart(selectedProduct);
              router.push('/cart');
            }}
            className="bg-yellow-500 text-white p-3 rounded-full shadow-lg hover:bg-yellow-600"
            aria-label="Add to Cart"
          >
            🛒
          </button>
        </div>
      )}
    </div>
  );
};

export default AllProductMediaPage;
