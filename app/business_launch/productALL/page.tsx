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
      .from('new_products')
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
        const previews = files.map(() => ({ url: '', loading: true }));
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

  const uploadMediaFiles = async (files: File[], userId: string) => {
    const mediaUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('product-media')
        .upload(`media/${fileName}`, file);

      if (error) throw new Error('Error uploading media files.');

      const { publicUrl } = supabase.storage
        .from('product-media')
        .getPublicUrl(`media/${fileName}`).data;

      if (publicUrl) mediaUrls.push(publicUrl);
    }

    return mediaUrls;
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
      const mediaUrls = await uploadMediaFiles(productMedia, user.user_id);

      const { error: dbError } = await supabase
        .from('new_products')
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
      fetchProducts(user.user_id);
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
      const mediaUrls = updatedMedia.length > 0
        ? await uploadMediaFiles(updatedMedia, user?.user_id || '')
        : editMediaPreviews;

      const { error: updateError } = await supabase
        .from('new_products')
        .update({
          name: updatedName,
          description: updatedDescription,
          price_inr: parseFloat(updatedPrice),
          media_urls: mediaUrls,
        })
        .eq('id', editingProductId);

      if (updateError) throw new Error('Failed to update product.');

      setSuccessMessage('Product updated successfully!');
      handleCancelEdit();
      fetchProducts(user?.user_id || '');
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
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="productPrice">Product Price (INR)</label>
          <input
            id="productPrice"
            type="number"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="productMedia">Upload Images and Videos</label>
          <input
            id="productMedia"
            type="file"
            accept="image/*,video/*" // Allow images and videos
            multiple
            onChange={handleMediaChange}
            className={styles.fileInput}
          />
          <div className={styles.previews}>
            {mediaPreviews.map((preview, index) => (
              <div key={index} className={styles.preview}>
                {preview.loading ? (
                  <div>Loading...</div>
                ) : (
                  <img src={preview.url} alt={`Preview ${index}`} className={styles.thumbnail} />
                )}
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleUpload} disabled={uploading} className={styles.uploadButton}>
          {uploading ? 'Uploading...' : 'Upload Product'}
        </button>
      </div>

      <h2 className={styles.productListTitle}>Your Products</h2>
      <div className={styles.productList}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: ₹{product.price_inr}</p>
            <div className={styles.thumbnailList}>
              {product.media_urls.slice(0, 3).map((url, index) => (
                <img key={index} src={url} alt={`Product ${product.id}`} className={styles.thumbnail} />
              ))}
            </div>
            <div>
              <button onClick={() => handleEdit(product)} className={styles.editButton}>Edit</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingProductId && (
        <div className={styles.editModal}>
          <h3>Edit Product</h3>
          <div className={styles.formGroup}>
            <label htmlFor="updatedName">Product Name</label>
            <input
              id="updatedName"
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="updatedDescription">Product Description</label>
            <textarea
              id="updatedDescription"
              value={updatedDescription}
              onChange={(e) => setUpdatedDescription(e.target.value)}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="updatedPrice">Product Price (INR)</label>
            <input
              id="updatedPrice"
              type="number"
              value={updatedPrice}
              onChange={(e) => setUpdatedPrice(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="updatedMedia">Update Images/Videos</label>
            <input
              id="updatedMedia"
              type="file"
              accept="image/*,video/*" // Allow images and videos
              multiple
              onChange={(e) => handleMediaChange(e, true)}
              className={styles.fileInput}
            />
            <div className={styles.previews}>
              {editMediaPreviews.map((url, index) => (
                <div key={index} className={styles.preview}>
                  <img
                    key={index}
                    src={url}
                    alt={`Edit Preview ${index}`}
                    className={styles.thumbnail}
                  />
                </div>
              ))}
              {updatedMedia.map((file, index) => (
                <div key={index} className={styles.preview}>New</div>
              ))}
            </div>
          </div>

          <button onClick={handleSaveChanges} className={styles.saveButton}>Save Changes</button>
          <button onClick={handleCancelEdit} className={styles.cancelButton}>Cancel</button>
        </div>
      )}
    </div>
  );
}
