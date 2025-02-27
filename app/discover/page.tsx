'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import BusinessModal from './components/BusinessModal';
import styles from './styles/Discover.module.css';
import Link from "next/link";


type User = {
  user_id: string;
  name: string;
  email: string;
  business_name?: string;
  business_address?: string;
  product_service?: string;
  phone?: string;
  photo?: string;
  ratings?: number;
  categories?: string[];
};

type Product = {
  id: number;
  user_id: string;
  name: string;
  description: string;
  media_urls: string[];
};

export default function Discover() {
  const [businessOwners, setBusinessOwners] = useState<User[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (!error) {
        const businesses = data || [];
        setBusinessOwners(businesses);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(businesses.flatMap((business) => business.categories || []))
        );
        setCategories(uniqueCategories);
      }
    };

    const fetchAllProducts = async () => {
      try {
        const { data, error } = await supabase.from('new_products').select('*');
        if (error) {
          throw new Error(error.message);
        }
        setProducts(data || []);
      } catch (err) {
        setProductError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchAllUsers();
    fetchAllProducts();
  }, []);

  const filteredBusinesses = businessOwners.filter((owner) =>
    (owner.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.categories?.some((category) =>
        category.toLowerCase().includes(searchQuery.toLowerCase())
      )) &&
    (selectedCategory ? owner.categories?.includes(selectedCategory) : true)
  );

  return (
    <div className={styles.container}>
      <section className="bg-black py-16">
        <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl font-bold text-white md:text-6xl">
            Welcome to Mateng Discovery
          </h1>
          <p className="mt-4 text-gray-600">
            Explore every businesses directly.
          </p>
          <Link
            href="/discover/product"
            className="mt-6 inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-white hover:text-green-600"
          >
            Explore Products Now
          </Link>
        </div>
      </section>
      {/* Search and Filter Inputs */}
      <div className={styles.searchFilter}>
        <input
          type="text"
          placeholder="Search businesses or categories"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.categoryChips}>
          {categories.map((category, idx) => (
            <button
              key={idx}
              className={`${styles.chip} ${selectedCategory === category ? styles.selected : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {/* Business List */}
        <div className={styles.businessSection}>
          {filteredBusinesses.map((business) => (
            <div
              key={business.user_id}
              className={styles.businessCard}
              onClick={() => setSelectedBusiness(business)}
            >
              <h3>{business.business_name}</h3>
              <p>{business.product_service}</p>
              {/* Optional photo */}
              {business.photo && (
                <div className={styles.photoFrame}>
                  <img src={business.photo} alt={business.business_name} className={styles.photo} />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>



      {/* Business Modal */}
      {selectedBusiness && (
        <BusinessModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onRate={() => {}}
        />
      )}
    </div>
  );
}
