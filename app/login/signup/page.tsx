'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';
import styles from './Signup.module.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSignup = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(password, saltRounds);

      // Insert the new user into the Supabase users table
      const { data, error } = await supabase.from('users').insert([
        {
          name,
          email,
          password: hashedPassword,
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMessage('Account created successfully!');
      setTimeout(() => {
        router.push('/login'); // Redirect to login page after successful signup
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error signing up:', error.message);
        setErrorMessage(error.message);
      } else {
        console.error('Unknown error:', error);
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <h1>Sign Up</h1>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
          className={styles.inputField}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          className={styles.inputField}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          className={styles.inputField}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className={styles.inputField}
        />
        <button onClick={handleSignup} className={styles.signupButton}>
          Sign Up
        </button>

        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

        <div className={styles.linkContainer}>
          <p>
            Already have an account? <a href="/login" className={styles.link}>Log In</a>
          </p>
        </div>
      </main>
    </div>
  );
}
