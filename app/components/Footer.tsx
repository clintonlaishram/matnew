'use client';

import styles from './Footer.module.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Footer: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const updateLoginStatus = () => {
      const userJson = sessionStorage.getItem('user');
      const employeeJson = sessionStorage.getItem('employee');
      setIsLoggedIn(!!userJson);
      setIsEmployeeLoggedIn(!!employeeJson);
    };

    // Initial check
    updateLoginStatus();

    // Listen for custom login status change event
    window.addEventListener('loginStatusChange', updateLoginStatus);

    return () => {
      window.removeEventListener('loginStatusChange', updateLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('employee');
    setIsLoggedIn(false);
    setIsEmployeeLoggedIn(false);

    // Emit the event
    window.dispatchEvent(new Event('loginStatusChange'));

    router.push('/');
  };

  return (
    <footer className={styles.footer}>
      

      {isLoggedIn && (
        <div className={styles['employee-links']}>
          <div className={styles['footer-content']}>
        <p>&copy; {new Date().getFullYear()} Mateng</p>
      </div>
          <Link href="/search_order" className={styles.navButton}>
            Search Orders
          </Link>
          <Link href="/delivery-rates" className={styles.navButton}>
            Delivery Rates
          </Link>
          <Link href="/about-us">About Us</Link>

          
        </div>
      )}

      {/* For non-logged in users */}
      {!isLoggedIn && !isEmployeeLoggedIn && (
          <>
            <div className={styles['footer-content']}>
        <p>&copy; {new Date().getFullYear()} Mateng</p>
      </div>
      <div className={styles['footer-right']}>
        <Link href="/about-us">About Us</Link>
        <Link href="/employee-login">Employee Portal</Link>
        <Link href="/teams">Team Portal</Link>
      </div>
          </>
        )}
    </footer>
  );
};

export default Footer;
