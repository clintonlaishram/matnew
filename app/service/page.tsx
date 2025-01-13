"use client";

import Link from "next/link";
import styles from './page.module.css';

export default function Pricing() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Service Provided</h1>
      <div className={styles.pricingContainer}>
        <div className={styles.service}>
          <h2>Instant Pickup and Delivery</h2>
          <p>For information on our services, please contact us directly.</p>
          <Link href="https://wa.link/59odie" className={styles.link}>Contact Us</Link>
        </div>
        <div className={styles.service}>
          <h2>Standard Delivery</h2>
          <p>For information on our services, please contact us directly.</p>
          <Link href="https://wa.link/59odie" className={styles.link}>Contact Us</Link>
        </div>
        <div className={styles.service}>
          <h2>Business Discovery</h2>
          <p>For information on our services, please contact us directly.</p>
          <Link href="https://wa.link/59odie" className={styles.link}>Contact Us</Link>
        </div>
        <div className={styles.service}>
          <h2>Order Management Tools</h2>
          <p>For information on our services, please contact us directly.</p>
          <Link href="https://wa.link/59odie" className={styles.link}>Contact Us</Link>
        </div>
      </div>
    </main>
  );
}
