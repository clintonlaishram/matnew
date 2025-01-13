'use client';  // Add this at the top

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import styles from './ProfilePage.module.css';
import Link from 'next/link';
import Image from 'next/image';

type User = {
  user_id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  business_name: string | null;
  business_address: string | null;
  business_type: string | null;
  product_service: string | null;
  business_experience: string | null;
  business_description: string | null;
  is_registered: boolean;
  photo: string | null;
};

export default function ProfilePage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // New state for popup visibility

  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!user?.email) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setUserData(data);
      } catch (err) {
        setError('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    if (!newPhoto || !userData) return;

    setUploading(true);
    const fileExt = newPhoto.name.split('.').pop();
    const fileName = `user_pic_${userData.email}_${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from('user-photos')
        .upload(`user_photos/user_pic/${fileName}`, newPhoto);

      if (error) {
        throw new Error('Error uploading photo');
      }

      const { publicUrl } = supabase.storage
        .from('user-photos')
        .getPublicUrl(`user_photos/user_pic/${fileName}`).data;

      const { error: updateError } = await supabase
        .from('users')
        .update({ photo: publicUrl })
        .eq('email', userData.email);

      if (updateError) {
        throw new Error('Error updating user profile');
      }

      setUserData((prev) => ({
        ...prev!,
        photo: publicUrl,
      }));

      setPhotoPreviewUrl(publicUrl); // Set the public URL as the preview image

      // Show popup and hide after 2 seconds
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userData) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          address: userData.address,
          phone: userData.phone,
          business_name: userData.business_name,
          business_address: userData.business_address,
          business_type: userData.business_type,
          product_service: userData.product_service,
          business_experience: userData.business_experience,
          business_description: userData.business_description,
        })
        .eq('email', userData.email);

      if (error) {
        throw new Error('Failed to save changes.');
      }

      // Show popup and hide after 2 seconds
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Profile</h1>
      <div>
        <Link href="/business/product" className={styles.links}>Add Products</Link>
      </div>
      <div className={styles.profileInfo}>
        <div className={styles.profilePhotoContainer}>
          <Image
            src={userData?.photo || '/default-profile.png'} // Fallback to a default image
            alt="Profile Photo"
            className={styles.profilePhoto}
            width={150}  // Adding width
            height={150} // Adding height
          />
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className={styles.fileInput}
          />
          <button onClick={uploadPhoto} disabled={uploading} className={styles.uploadButton}>
            {uploading ? 'Uploading...' : 'Upload New Photo'}
          </button>
        </div>

        {photoPreviewUrl && (
          <div className={styles.photoPreviewContainer}>
            <h3>Preview</h3>
            <Image
              src={photoPreviewUrl}
              alt="Preview Image"
              width={200}
              height={200}
              className={styles.previewImg}
            />
          </div>
        )}

        <div className={styles.formContainer}>
          {[
            { label: 'Name', value: userData?.name, field: 'name' },
            { label: 'Email', value: userData?.email, field: 'email', disabled: true },
            { label: 'Address', value: userData?.address, field: 'address' },
            { label: 'Phone', value: userData?.phone, field: 'phone' },
            { label: 'Business Name', value: userData?.business_name, field: 'business_name' },
            { label: 'Business Address', value: userData?.business_address, field: 'business_address' },
            { label: 'Business Type', value: userData?.business_type, field: 'business_type' },
            { label: 'Product/Service', value: userData?.product_service, field: 'product_service' },
            { label: 'Business Experience', value: userData?.business_experience, field: 'business_experience' },
            { label: 'Business Description', value: userData?.business_description, field: 'business_description' },
          ].map(({ label, value, field, disabled }) => (
            <div key={field} className={styles.inputGroup}>
              <label>{label}</label>
              <input
                type="text"
                value={value || ''}
                onChange={(e) => setUserData({ ...userData!, [field]: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 bg-gray-800 text-gray-300 py-2 px-4"

                disabled={disabled}
              />
            </div>
          ))}
          <button onClick={handleSave} className={styles.saveButton}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Popup */}
      <div className={`${styles.popup} ${showPopup ? styles.show : ''}`}>
        <p>Update Successful</p>
      </div>
    </div>
  );
}
