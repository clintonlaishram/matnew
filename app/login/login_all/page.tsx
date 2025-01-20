'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import bcrypt from 'bcryptjs'; // Import bcryptjs
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMessage(null);

    try {
      // Fetch user record by email
      const { data: users, error } = await supabase
        .from('users')
        .select('user_id, name, email, password, address, phone')
        .eq('email', email)
        .limit(1);

      if (error) throw new Error(error.message);

      if (users && users.length > 0) {
        const user = users[0];

        // Compare provided password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
          // Store the entire user object, excluding the password
          const { password, ...userWithoutPassword } = user;
          sessionStorage.setItem('user', JSON.stringify(userWithoutPassword));

          alert('Login successful!');

          // Emit a custom event to notify Header about login
          window.dispatchEvent(new Event('loginStatusChange'));

          router.push('/discover');
        } else {
          setErrorMessage('Invalid email or password');
        }
      } else {
        setErrorMessage('Invalid email or password');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error logging in:', error.message);
        setErrorMessage(error.message);
      } else {
        console.error('Unknown error:', error);
        setErrorMessage('An unexpected error occurred during login.');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <h1>Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown} // Trigger login on Enter
          className={styles.inputField}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown} // Trigger login on Enter
          className={styles.inputField}
        />
        <button onClick={handleLogin} className={styles.loginButton}>
          Log In
        </button>

        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <div className={styles.linkContainer}>
          <Link href="/forgot-password" className={styles.link}>
            Forgot Password?
          </Link>
          <br /><br />
          <Link href="/login/signup" className={styles.link}>
            Sign Up if you&apos;re a new user
          </Link>
        </div>
      </main>
    </div>
  );
}
