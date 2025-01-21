// File: app/distance-calculator/layout.tsx

import { ReactNode } from 'react';
import styles from './styles/layout.module.css';

export default function DistanceCalculatorLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1>Distance & Delivery Charge Calculator</h1>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
      </footer>
    </div>
  );
}
