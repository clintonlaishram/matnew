'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './Signup.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [productService, setProductService] = useState('');
  const [businessExperience, setBusinessExperience] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [category, setCategory] = useState<string>('');
  const [otherCategory, setOtherCategory] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  const router = useRouter();

  const availableCategories = ['Select One', 'Clothing', 'Bakery', 'Flower Shop', 'Finance', 'Retail', 'Hospitality', 'Education', 'Cafe', 'Hangout Spot', 'Service Sector', 'Others'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setWhatsapp(input);
    if (input.trim()) {
      const link = `https://wa.me/${input.replace(/\D/g, '')}`;
      setWhatsappLink(link);
    } else {
      setWhatsappLink(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const selectedCategory = category === 'Others' && otherCategory.trim() ? otherCategory : category;

    const { data: existingUser, error: emailCheckError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .limit(1);

    if (emailCheckError) {
      console.error('Error checking email:', emailCheckError);
    }

    if (existingUser && existingUser.length > 0) {
      setStatusMessage('Error: This email is already registered.');
      return;
    }

    const userPayload = {
      name,
      email,
      password,
      address,
      phone,
      is_business_owner: isBusinessOwner,
      business_name: isBusinessOwner ? businessName : null,
      business_address: isBusinessOwner ? businessAddress : null,
      business_type: isBusinessOwner ? businessType : null,
      product_service: isBusinessOwner ? productService : null,
      business_experience: isBusinessOwner ? businessExperience : null,
      business_description: isBusinessOwner ? businessDescription : null,
      is_registered: isBusinessOwner ? isRegistered : null,
      categories: selectedCategory ? [selectedCategory] : [],
      whatsapp: whatsappLink,
    };

    const { error: userError } = await supabase.from('users').insert([userPayload]);

    if (userError) {
      console.error('Signup error:', userError);
      setStatusMessage(`Error: ${userError.message}`);
      return;
    }

    setStatusMessage('Signup successful! You can now log in at the login page.');

    if (photo && isBusinessOwner) {
      try {
        const photoPath = `user_photos/user_pic/${email}_${photo.name}`;

        const { error: uploadError } = await supabase.storage
          .from('user-photos')
          .upload(photoPath, photo);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          setStatusMessage(`Error uploading photo: ${uploadError.message}`);
          return;
        }

        const { data: { publicUrl } } = supabase
          .storage
          .from('user-photos')
          .getPublicUrl(photoPath);

        if (!publicUrl) {
          console.error('Error: No public URL returned');
          setStatusMessage('Error retrieving the photo URL.');
          return;
        }

        const { error: updateError } = await supabase
          .from('users')
          .update({ photo: publicUrl })
          .eq('email', email);

        if (updateError) {
          console.error('Error updating photo URL:', updateError);
          setStatusMessage(`Error saving photo URL: ${updateError.message}`);
        } else {
          setStatusMessage('Sign up successfully! You can now Login.');
        }

      } catch (err) {
        console.error('Unexpected error:', err);
        setStatusMessage('Unexpected error occurred while uploading photo.');
      }
    }

    setTimeout(() => {
      router.push('/login');
      alert('Sign up successfully! You can now Login.');
    }, 2000);

    resetFormFields();
  };

  const resetFormFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setAddress('');
    setPhone('');
    setIsBusinessOwner(false);
    setBusinessName('');
    setBusinessAddress('');
    setBusinessType('');
    setProductService('');
    setBusinessExperience('');
    setBusinessDescription('');
    setIsRegistered(false);
    setPhoto(null);
    setPhotoPreviewUrl(null);
    setCategory('');
    setOtherCategory('');
    setWhatsapp('');
    setWhatsappLink(null);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    if (selectedCategory === 'Others') {
      setOtherCategory('');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sign Up</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Name:</label>
          <input
            type="text"
            className={styles.inputField}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email:</label>
          <input
            type="email"
            className={styles.inputField}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Password:</label>
          <input
            type="password"
            className={styles.inputField}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Address:</label>
          <input
            type="text"
            className={styles.inputField}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Phone:</label>
          <input
            type="tel"
            className={styles.inputField}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>WhatsApp Number:</label>
          <input
            type="text"
            className={styles.inputField}
            value={whatsapp}
            onChange={handleWhatsappChange}
            placeholder="Enter WhatsApp number"
          />
          {whatsappLink && (
            <p className={styles.linkPreview}>Generated Link: <a href={whatsappLink} target="_blank" rel="noopener noreferrer">{whatsappLink}</a></p>
          )}
        </div>

        <button type="submit" className={styles.submitButton}>Sign Up</button>

        {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
      </form>
    </div>
  );
}
