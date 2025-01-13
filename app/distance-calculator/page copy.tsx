'use client';

import { useState } from 'react';
import { useUserDetails } from '../../components/UserDetailsFetcher';
import { calculateDeliveryCharge } from '../../components/DistanceUtils';
import {
  GoogleMap,
  LoadScript,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';
import styles from './styles/page.module.css';

const libraries: ['places'] = ['places'];
const containerStyle = { width: '100%', height: '400px' };
const defaultCenter = { lat: 28.6139, lng: 77.209 };

export default function DistanceCalculatorPage() {
  const userDetails = useUserDetails();
  const [pickup, setPickup] = useState({ name: '', phone: '', address: '' });
  const [dropoff, setDropoff] = useState({ name: '', phone: '', address: '' });
  const [sameAsProfilePickup, setSameAsProfilePickup] = useState(false);
  const [sameAsProfileDropoff, setSameAsProfileDropoff] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [charge, setCharge] = useState<number | null>(null);
  const [directions, setDirections] = useState(null);

  const handleDirectionsResponse = (response: any) => {
    if (response && response.routes.length > 0) {
      const routeDistance = response.routes[0].legs[0].distance.value / 1000; // Convert to km
      setDistance(routeDistance);
      setCharge(calculateDeliveryCharge(routeDistance));
      setDirections(response);
    }
  };

  const handleCheckboxChange = (field: 'pickup' | 'dropoff') => {
    if (field === 'pickup') {
      if (sameAsProfilePickup && userDetails) {
        setPickup({ name: '', phone: '', address: '' });
      } else if (userDetails) {
        setPickup(userDetails);
      }
      setSameAsProfilePickup(!sameAsProfilePickup);
    } else {
      if (sameAsProfileDropoff && userDetails) {
        setDropoff({ name: '', phone: '', address: '' });
      } else if (userDetails) {
        setDropoff(userDetails);
      }
      setSameAsProfileDropoff(!sameAsProfileDropoff);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Distance & Delivery Charge Calculator</h1>

      {/* Pickup Section */}
      <div className={styles.formSection}>
        <h2 className={styles.subtitle}>Pickup Details</h2>
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
        <input
          className={styles.input}
          type="text"
          placeholder="Address"
          value={pickup.address}
          onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
        />
      </div>

      {/* Drop-Off Section */}
      <div className={styles.formSection}>
        <h2 className={styles.subtitle}>Drop-Off Details</h2>
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
        <input
          className={styles.input}
          type="text"
          placeholder="Address"
          value={dropoff.address}
          onChange={(e) => setDropoff({ ...dropoff, address: e.target.value })}
        />
      </div>

      {/* Map and Distance Calculation */}
      <div className={styles.mapSection}>
        <h2 className={styles.subtitle}>Map</h2>
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} libraries={libraries}>
          <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={8}>
            {pickup.address && dropoff.address && (
              <DirectionsService
                options={{
                  origin: pickup.address,
                  destination: dropoff.address,
                  travelMode: google.maps.TravelMode.DRIVING,
                }}
                callback={handleDirectionsResponse}
              />
            )}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Results */}
      {distance !== null && charge !== null && (
        <div className={styles.results}>
          <h2>Results</h2>
          <p>Distance: {distance.toFixed(2)} km</p>
          <p>Delivery Charge: ₹{charge.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
