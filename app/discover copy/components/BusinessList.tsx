'use client';

import Image from 'next/image';
import styles from '../styles/BusinessList.module.css';

type User = {
  user_id: string; // Ensure this is a required field
  name: string;
  email: string;
  business_name?: string;
  business_address?: string;
  product_service?: string;
  phone?: string;
  photo?: string;
  ratings?: number;
};

export default function BusinessList({
  businesses,
  onSelectBusiness,
}: {
  businesses: User[];
  onSelectBusiness: (business: User) => void;
}) {
  return (
    <div className={styles.businessContainer}>
      <div className={styles.businessList}>
        {businesses.map((business) => {
          // Ensure each business object has a user_id
          if (!business.user_id) {
            console.warn('Missing user_id for business:', business);
            return null; // Skip entries with missing user_id
          }

          return (
            <div
              key={business.user_id} // Use user_id as a unique key
              className={styles.businessCard}
              onClick={() => onSelectBusiness(business)}
            >
              {business.photo ? (
                <Image
                  src={business.photo}
                  alt={`${business.business_name || 'Business'} Photo`}
                  width={100}
                  height={100}
                  className={styles.businessPhoto}
                />
              ) : (
                <div className={styles.noPhotoText}>No Photo Available</div>
              )}
              <h3 className={styles.businessName}>{business.business_name || 'Unknown Business'}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}
