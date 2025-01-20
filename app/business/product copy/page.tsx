'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import styles from './ProductUploadPage.module.css';


interface User {
  user_id: string;
  email: string;
  phone: string;
  whatsapp: string;
}

interface Product {
  id: number;
  name: string;  
  description: string;
  price_inr: number;
  media_urls: string[];
}

export default function ProductUploadPage() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productMedia, setProductMedia] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<{ url: string; loading: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [updatedPrice, setUpdatedPrice] = useState('');
  const [updatedMedia, setUpdatedMedia] = useState<File[]>([]);
  const [editMediaPreviews, setEditMediaPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user and products
  useEffect(() => {
    const fetchUser = async () => {
      const sessionUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      if (sessionUser?.email) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_id, email, phone, whatsapp')
          .eq('email', sessionUser.email)
          .single();

        if (userError || !userData) {
          setError('Failed to fetch user data. Please log in again.');
        } else {
          setUser(userData);
          fetchProducts(userData.user_id);
        }
      } else {
        setError('User not logged in. Please log in first.');
      }
    };

    fetchUser();
  }, []);

  const fetchProducts = async (userId: string) => {
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId);

    if (productsError) {
      setError('Failed to fetch products.');
    } else {
      setProducts(productsData || []);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      if (isEdit) {
        setUpdatedMedia(files);
        const previews = files.map((file) => URL.createObjectURL(file));
        setEditMediaPreviews(previews);
      } else {
        setProductMedia(files);
        const previews = files.map((file) => ({ url: '', loading: true }));
        setMediaPreviews(previews);

        files.forEach((file, index) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setMediaPreviews((prev) => {
              const updatedPreviews = [...prev];
              updatedPreviews[index] = { url: reader.result as string, loading: false };
              return updatedPreviews;
            });
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!user) {
      setError('User information is missing. Please log in again.');
      return;
    }

    if (!productName || !productDescription || !productPrice || productMedia.length === 0) {
      setError('All fields are required.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const mediaUrls: string[] = [];

      for (const file of productMedia) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.user_id}_${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('product-media')
          .upload(`media/${fileName}`, file);

        if (error) throw new Error('Error uploading media files.');

        const { publicUrl } = supabase.storage
          .from('product-media')
          .getPublicUrl(`media/${fileName}`).data;

        if (publicUrl) mediaUrls.push(publicUrl);
      }

      const { error: dbError } = await supabase
        .from('products')
        .insert({
          user_id: user.user_id,
          name: productName,
          description: productDescription,
          price_inr: parseFloat(productPrice),
          media_urls: mediaUrls,
        });

      if (dbError) throw new Error('Failed to save product.');

      setSuccessMessage('Product uploaded successfully!');
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductMedia([]);
      setMediaPreviews([]);
      fetchProducts(user.user_id); // Refresh products
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setUpdatedName(product.name);
    setUpdatedDescription(product.description);
    setUpdatedPrice(product.price_inr.toString());
    setEditMediaPreviews(product.media_urls);
    setUpdatedMedia([]);
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setUpdatedName('');
    setUpdatedDescription('');
    setUpdatedPrice('');
    setUpdatedMedia([]);
    setEditMediaPreviews([]);
  };

  const handleSaveChanges = async () => {
    if (!editingProductId || !updatedName || !updatedDescription || !updatedPrice) {
      setError('All fields are required.');
      return;
    }
  
    setError(null);
    setSuccessMessage(null);
  
    try {
      const mediaUrls: string[] = [];
  
      // If new media is uploaded, replace old media URLs
      if (updatedMedia.length > 0) {
        for (const file of updatedMedia) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user?.user_id}_${Date.now()}.${fileExt}`;
          const { data, error } = await supabase.storage
            .from('product-media')
            .upload(`media/${fileName}`, file);
  
          if (error) throw new Error('Error uploading media files.');
  
          const { publicUrl } = supabase.storage
            .from('product-media')
            .getPublicUrl(`media/${fileName}`).data;
  
          if (publicUrl) mediaUrls.push(publicUrl);
        }
      } else {
        // Retain the existing media URLs if no new media is uploaded
        mediaUrls.push(...editMediaPreviews);
      }
  
      // Update the product with the updated media URLs
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: updatedName,
          description: updatedDescription,
          price_inr: parseFloat(updatedPrice),
          media_urls: mediaUrls, // Replace old media URLs
        })
        .eq('id', editingProductId);
  
      if (updateError) throw new Error('Failed to update product.');
  
      setSuccessMessage('Product updated successfully!');
      handleCancelEdit();
      fetchProducts(user?.user_id || ''); // Refresh the product list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Upload Product</h1>

      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}

      <div>
        <div className={styles.formGroup}>
          <label htmlFor="productName">Product Name</label>
          <input
            id="productName"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="productDescription">Product Description</label>
          <textarea
            id="productDescription"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className={styles.textarea}
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="productPrice">Product Price (INR)</label>
          <input
            id="productPrice"
            type="text"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="productMedia">Upload Media</label>
          <input
            id="productMedia"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleMediaChange(e)}
            className={styles.fileInput}
          />
          <div className={styles.previewContainer}>
            {mediaPreviews.map((preview, index) => (
              <div key={index} className={styles.previewItem}>
                {preview.loading ? (
                  <p>Loading...</p>
                ) : (
                  <img src={preview.url} alt={`Preview ${index + 1}`} className={styles.previewImage} />
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading}
          className={styles.uploadButton}
        >
          {uploading ? 'Uploading...' : 'Upload Product'}
        </button>
      </div>

      <h1 className={styles.title}>Your Products</h1>
      <div className={styles.productGrid}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
            {editingProductId === product.id ? (
              <div className={styles.editForm}>
                <h3>Edit Product</h3>
                <div className={styles.formGroup}>
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={updatedDescription}
                    onChange={(e) => setUpdatedDescription(e.target.value)}
                    className={styles.textarea}
                  ></textarea>
                </div>
                <div className={styles.formGroup}>
                  <label>Price (INR)</label>
                  <input
                    type="text"
                    value={updatedPrice}
                    onChange={(e) => setUpdatedPrice(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Media</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleMediaChange(e, true)}
                    className={styles.fileInput}
                  />
                  <div className={styles.previewContainer}>
                    {editMediaPreviews.map((url, index) => (
                      <img key={index} src={url} alt={`Preview ${index}`} className={styles.previewImage} />
                    ))}
                  </div>
                </div>
                <button onClick={handleSaveChanges} className={styles.saveButton}>
                  Save Changes
                </button>
                <button onClick={handleCancelEdit} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <p>Price: ₹{product.price_inr}</p>
                <div className={styles.mediaContainer}>
                  {product.media_urls.map((url, index) => (
                    <img key={index} src={url} alt={`Media ${index}`} className={styles.media} />
                  ))}
                </div>
                <button onClick={() => handleEdit(product)} className={styles.editButton}>
                  Edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
