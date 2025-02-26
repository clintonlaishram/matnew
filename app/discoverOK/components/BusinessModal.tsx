'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../styles/BusinessModal.module.css';

type User = {
  user_id: string;
  name: string;
  email: string;
  business_name?: string;
  business_address?: string;
  product_service?: string;
  phone?: string;
  website?: string;
  photo?: string;
  categories?: string[];
  ratings?: number;
};

export default function BusinessModal({
  business,
  onClose,
  onRate,
}: {
  business: User;
  onClose: () => void;
  onRate: (rating: number) => void;
}) {
  const router = useRouter();

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>X</button>
        <h2>{business.business_name || 'Business Details'}</h2>
        <Image
          src={business.photo || '/default-business.jpg'}
          alt="Business"
          width={150}
          height={150}
        />
        <p><strong>Owner:</strong> {business.name}</p>
        <p><strong>Email:</strong> {business.email}</p>
        <p><strong>Business Address:</strong> {business.business_address || 'N/A'}</p>
        <p><strong>Product/Service:</strong> {business.product_service || 'N/A'}</p>

        {/* "See More" Button */}
        <button
          className={styles.seeMoreButton}
          onClick={() => router.push(`/business/${business.user_id}`)}
        >
          See More
        </button>

        <div>
          <h4>Rate this Business</h4>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => onRate(star)}
              style={{
                cursor: 'pointer',
                color: star <= (business.ratings || 0) ? 'gold' : 'gray', // Default to 0 if undefined
                fontSize: '1.5rem',
              }}
            >
              ★
            </span>
          ))}
        </div>
        
      </div>
    </div>
  );
}
