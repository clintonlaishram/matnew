'use client';

import { useState, useEffect } from 'react';
import { useUserDetails } from '../../components/UserDetailsFetcher';
import { calculateDeliveryCharge } from '../../components/DistanceUtils';
import { supabase } from '../../lib/supabaseClient';
import styles from './styles/page.module.css';
import Link from 'next/link'; // Import Link from Next.js

export default function DistanceCalculatorPage() {
  const userDetails = useUserDetails();
  const [pickup, setPickup] = useState({ name: '', phone: '', address: '', instructions: '' });
  const [dropoff, setDropoff] = useState({ name: '', phone: '', address: '', instructions: '' });
  const [sameAsProfilePickup, setSameAsProfilePickup] = useState(false);
  const [sameAsProfileDropoff, setSameAsProfileDropoff] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [charge, setCharge] = useState<number | null>(null);

  // Function to fetch pickup and dropoff data// Add this function to fetch user data from the 'users' table
const fetchUserData = async (userName: string) => {
  if (!userName) {
    console.log("No username provided.");
    return;
  }

  try {
    // Fetch user data from 'users' table
    const { data: userData, error } = await supabase
      .from('users')  // Assuming your users table is named 'users'
      .select('name, phone, address')
      .eq('name', userName)
      .single();  // Fetch a single user by name

    if (error) {
      throw new Error(error.message);
    }

    // If user data exists, update pickup/dropoff
    if (userData) {
      return {
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        instructions: '',
      };
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    alert('Error fetching user data from the users database.');
  }
};

const handleCheckboxChange = async (field: 'pickup' | 'dropoff') => {
  if (field === 'pickup') {
    if (sameAsProfilePickup) {
      setPickup({ name: '', phone: '', address: '', instructions: '' });
    } else if (userDetails) {
      // Fetch user data from the 'users' table when checkbox is checked
      const userData = await fetchUserData(userDetails.name);
      if (userData) {
        setPickup(userData);  // Set the fetched user data for pickup
      }
    }
    setSameAsProfilePickup(!sameAsProfilePickup);
  } else {
    if (sameAsProfileDropoff) {
      setDropoff({ name: '', phone: '', address: '', instructions: '' });
    } else if (userDetails) {
      // Fetch user data from the 'users' table when checkbox is checked
      const userData = await fetchUserData(userDetails.name);
      if (userData) {
        setDropoff(userData);  // Set the fetched user data for dropoff
      }
    }
    setSameAsProfileDropoff(!sameAsProfileDropoff);
  }
};


  const confirmBooking = async () => {
    if (!pickup.address || !dropoff.address || distance === null || charge === null) {
      alert('Please fill in all the required details.');
      return;
    }

    const orderData = {
      pickup_name: pickup.name,
      pickup_phone: pickup.phone,
      pickup_address: pickup.address,
      dropoff_name: dropoff.name,
      dropoff_phone: dropoff.phone,
      dropoff_address: dropoff.address,
      instructions: { pickup: pickup.instructions, dropoff: dropoff.instructions },
      distance,
      charge,
    };

    try {
      // Save to database
      const { error } = await supabase.from('delivery_orders').insert(orderData);
      if (error) throw error;

      // Send to Telegram
      const response = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${pickup.name} → ${dropoff.name}`,
          message: `New Delivery:\nPickup: ${pickup.address}\nDropoff: ${dropoff.address}\nDistance: ${distance.toFixed(
            2
          )} km\nCharge: ₹${charge.toFixed(2)}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Telegram Error: ${errorText}`);
      }

      alert('Booking confirmed and notification sent!');
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.container}>

      <div className={styles.detailsWrapper}>
        {/* Pickup Section */}
        <div className={styles.detailsSection}>
          <h2>Pickup Details</h2>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={sameAsProfilePickup}
              onChange={() => handleCheckboxChange('pickup')}
            />
            Same as My Details
          </label>
          <input
            className={styles.input}
            type="text"
            placeholder="Address"
            value={pickup.address}
            onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Name"
            value={pickup.name}
            onChange={(e) => setPickup({ ...pickup, name: e.target.value })}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Phone"
            value={pickup.phone}
            onChange={(e) => setPickup({ ...pickup, phone: e.target.value })}
          />
        </div>

        {/* Drop-Off Section */}
        <div className={styles.detailsSection}>
          <h2>Drop-Off Details</h2>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={sameAsProfileDropoff}
              onChange={() => handleCheckboxChange('dropoff')}
            />
            Same as My Details
          </label>
          <input
            className={styles.input}
            type="text"
            placeholder="Address"
            value={dropoff.address}
            onChange={(e) => setDropoff({ ...dropoff, address: e.target.value })}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Name"
            value={dropoff.name}
            onChange={(e) => setDropoff({ ...dropoff, name: e.target.value })}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Phone"
            value={dropoff.phone}
            onChange={(e) => setDropoff({ ...dropoff, phone: e.target.value })}
          />
        </div>
      </div>

      {/* Results */} 
      {distance !== null && charge !== null && (
        <div className={styles.results}>
          <p>Distance: {distance.toFixed(2)} km</p>
          <p>Delivery Charge: ₹{charge.toFixed(2)}</p>
        </div>
      )}

      {/* Buttons */}
      <div className={styles.buttons}>
        <button className={styles.button} onClick={confirmBooking}>
          Confirm Booking
        </button>
      </div>
      <br/><br/><br/>
      <div className={styles.cen}>
          For Delivery rates in PDF, click the links below
      </div><br/>

      <div></div>
        <div>
        <Link href="/standard.pdf" className={styles.links}>Standard delivery rates.</Link>
      </div>
      <div></div>
      <div>
        <Link href="/instant.pdf" className={styles.links}>Instant delivery rates Outside Imphal.</Link>
      </div>
      <div></div>
    </div>
  );
}
