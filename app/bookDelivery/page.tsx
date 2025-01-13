'use client';

import { useState, useRef } from 'react';
import {
  GoogleMap,
  LoadScript,
  Autocomplete,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { useUserDetails } from '../../components/UserDetailsFetcher';
import { calculateDeliveryCharge } from '../../components/DistanceUtils';
import { supabase } from '../../lib/supabaseClient';
import styles from './styles/page.module.css';

const libraries: ['places'] = ['places'];
const containerStyle = { width: '100%', height: '400px' };
const defaultCenter = { lat: 28.6139, lng: 77.209 }; // New Delhi, India

export default function DistanceCalculatorPage() {
  const userDetails = useUserDetails();
  const [pickup, setPickup] = useState({ name: '', phone: '', address: '', instructions: '' });
  const [dropoff, setDropoff] = useState({ name: '', phone: '', address: '', instructions: '' });
  const [sameAsProfilePickup, setSameAsProfilePickup] = useState(false);
  const [sameAsProfileDropoff, setSameAsProfileDropoff] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [charge, setCharge] = useState<number | null>(null);
  const [directions, setDirections] = useState(null);

  const autocompletePickupRef = useRef<google.maps.places.Autocomplete | null>(null);
  const autocompleteDropoffRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceChanged = (field: 'pickup' | 'dropoff') => {
    const autocomplete = field === 'pickup' ? autocompletePickupRef.current : autocompleteDropoffRef.current;
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place?.geometry?.location) {
        const address = place.formatted_address || '';
        if (field === 'pickup') setPickup({ ...pickup, address });
        if (field === 'dropoff') setDropoff({ ...dropoff, address });
      }
    }
  };

  const handleCheckboxChange = (field: 'pickup' | 'dropoff') => {
    if (field === 'pickup') {
      if (sameAsProfilePickup) {
        setPickup({ name: '', phone: '', address: '', instructions: '' });
      } else if (userDetails) {
        setPickup({ ...userDetails, instructions: '' });
      }
      setSameAsProfilePickup(!sameAsProfilePickup);
    } else {
      if (sameAsProfileDropoff) {
        setDropoff({ name: '', phone: '', address: '', instructions: '' });
      } else if (userDetails) {
        setDropoff({ ...userDetails, instructions: '' });
      }
      setSameAsProfileDropoff(!sameAsProfileDropoff);
    }
  };

  const handleDirectionsResponse = (response: any) => {
    if (response?.routes.length > 0) {
      const routeDistance = response.routes[0].legs[0].distance.value / 1000; // Convert to km
      setDistance(routeDistance);
      setCharge(calculateDeliveryCharge(routeDistance));
      setDirections(response);
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
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} libraries={libraries}>
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
            <Autocomplete
              onLoad={(autocomplete) => (autocompletePickupRef.current = autocomplete)}
              onPlaceChanged={() => handlePlaceChanged('pickup')}
            >
              <input
                className={styles.input}
                type="text"
                placeholder="Address"
                value={pickup.address}
                onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
              />
            </Autocomplete>
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
            <Autocomplete
              onLoad={(autocomplete) => (autocompleteDropoffRef.current = autocomplete)}
              onPlaceChanged={() => handlePlaceChanged('dropoff')}
            >
              <input
                className={styles.input}
                type="text"
                placeholder="Address"
                value={dropoff.address}
                onChange={(e) => setDropoff({ ...dropoff, address: e.target.value })}
              />
            </Autocomplete>
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

        {/* Map Section */}
        <div className={styles.mapSection}>
          <h2>Map</h2>
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
      </div>
    </LoadScript>
  );
}
