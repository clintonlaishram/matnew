'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import polyline from '@mapbox/polyline'; // For polyline decoding
import { supabase } from '../../lib/supabaseClient'; // Import supabase client
import 'leaflet/dist/leaflet.css';
import styles from './styles/DistanceCalculator.module.css'; // Import the CSS module
import { getDistance } from 'geolib'; // This can help calculate the distance between two lat/lng coordinates in meters

// Define the types for the suggestion response
interface Location {
  lat: number;
  lng: number;
}

interface Prediction {
  description: string;
  geometry: {
    location: Location;
  };
}

interface SuggestionResponse {
  predictions: Prediction[];
}

interface Suggestion {
  description: string;
  latitude: number;
  longitude: number;
}

const DistanceCalculator = () => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<Suggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Suggestion[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState<boolean>(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState<boolean>(false);
  const [distance, setDistance] = useState<string | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<[number, number]>>([]);

  // Coordinates for Manipur, India
  const manipurLocation = { lat: 24.817, lng: 93.936 };

  // Fetch user details from Supabase (specifically the address)
  const fetchUserDetails = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user details:', error);
      return null;
    }

    return user ? user.email : null; // You can replace 'user.email' with any other user property you need
  };

  // Set origin and destination to user's address fetched from Supabase
  const setSameAsMyAddressOrigin = async () => {
    const userAddress = await fetchUserDetails();
    if (userAddress) {
      setOrigin(userAddress); // Set origin to fetched address
      fetchSuggestions(userAddress, true); // Fetch suggestions for the address
    }
  };

  const setSameAsMyAddressDest = async () => {
    const userAddress = await fetchUserDetails();
    if (userAddress) {
      setDestination(userAddress); // Set destination to fetched address
      fetchSuggestions(userAddress, false); // Fetch suggestions for the address
    }
  };

  // Function to fetch suggestions for origin/destination
  const fetchSuggestions = async (input: string, isOrigin: boolean) => {
    try {
      // Fetch location suggestions from an API, biasing towards Manipur
      const response = await fetch(`/api/autocomplete?input=${input}&location=${manipurLocation.lat},${manipurLocation.lng}`);
      if (!response.ok) {
        console.error('Error fetching suggestions:', response.statusText);
        return;
      }

      const data: SuggestionResponse = await response.json();
      const suggestions = data.predictions.map((prediction) => ({
        description: prediction.description,
        latitude: prediction.geometry.location.lat,
        longitude: prediction.geometry.location.lng,
      }));

      if (isOrigin) {
        setOriginSuggestions(suggestions);
        setShowOriginSuggestions(true);
      } else {
        setDestinationSuggestions(suggestions);
        setShowDestinationSuggestions(true);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  // Function to calculate distance between origin and destination
  const calculateDistance = async () => {
    setDistance('Calculating...');
    if (!originCoords || !destinationCoords) {
      console.error('Both origin and destination coordinates are required');
      return;
    }

    const origin = `${originCoords.lat},${originCoords.lng}`;
    const destination = `${destinationCoords.lat},${destinationCoords.lng}`;

    try {
      const response = await fetch(`/api/distance-matrix?origin=${origin}&destination=${destination}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching distance:', response.statusText, errorText);
        setDistance('Error calculating distance');
        return;
      }

      const data = await response.json();

      const distanceInMeters = data.rows[0].elements[0].distance;
      const distanceInKm = (distanceInMeters / 1000).toFixed(2); // Convert and round to 2 decimals
      setDistance(`${distanceInKm} km`);

      // Decode polyline for route display
      const routePolyline = data.rows[0].elements[0].polyline;
      const decodedPolyline = polyline.decode(routePolyline);
      setRouteCoordinates(decodedPolyline);

      // Calculate delivery charge based on the distance
      calculateDeliveryCharge(distanceInKm);
    } catch (error) {
      console.error('Fetch error:', error);
      setDistance('Error calculating distance');
    }
  };

  const calculateDistanceFromCenter = (coords: { lat: number; lng: number }) => {
    return getDistance(manipurLocation, coords) / 1000; // Returns distance in kilometers
  };

  const calculateDeliveryCharge = (distanceInKm: string) => {
    const distance = parseFloat(distanceInKm);

    // Calculate distance from center for both origin and destination
    const originDistanceFromCenter = originCoords ? calculateDistanceFromCenter(originCoords) : 0;
    const destinationDistanceFromCenter = destinationCoords ? calculateDistanceFromCenter(destinationCoords) : 0;

    // Base charge
    const baseCharge = 27;

    let charge = 0;

    if (distance <= 5) {
      // ₹27 base + ₹10 per km for distances up to 5 km
      charge = baseCharge + (distance - 0) * 10;
    } else if (distance <= 20) {
      // Base charge for 5 km + ₹15 for each km from 5 to 20 km
      charge = baseCharge + 5 * 10 + (distance - 5) * 15;
    } else if (distance <= 35) {
      // Base charge for 5 km + ₹15 for each km from 5 to 20 km + ₹20 for each km from 20 to 35 km
      charge = baseCharge + 5 * 10 + 15 * 15 + (distance - 20) * 20;
    } else if (distance > 35 && distance <= 40) {
      // Base charge for 5 km + ₹15 for each km from 5 to 20 km + ₹20 for each km from 20 to 35 km + ₹50 for each km from 35 to 40 km
      charge = baseCharge + 5 * 10 + 15 * 15 + 15 * 20 + (distance - 35) * 50;
    } else {
      // For distances over 40 km, ₹60 for every km beyond 40 km
      charge = baseCharge + 5 * 10 + 15 * 15 + 15 * 20 + 5 * 50 + (distance - 40) * 60;
    }

    // If both origin and destination are within 5 km radius of Manipur, but charge exceeds ₹100, cap the charge at ₹100
    if (originDistanceFromCenter <= 5 && destinationDistanceFromCenter <= 5 && charge > 100) {
      setDeliveryCharge("₹100");
    } else {
      // Otherwise, show the calculated charge
      setDeliveryCharge(`₹${charge.toFixed(2)}`);
    }
  };

  // Map click handler to capture origin/destination
  const MapClickHandler = () => {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        const selectedCoords = { lat: e.latlng.lat, lng: e.latlng.lng };

        if (!originCoords) {
          setOriginCoords(selectedCoords);
          reverseGeocode(selectedCoords, setOrigin);
        } else {
          setDestinationCoords(selectedCoords);
          reverseGeocode(selectedCoords, setDestination);
        }
      },
    });
    return null;
  };

  // Reverse geocode to get the name of the place
  const reverseGeocode = async (
    coords: { lat: number; lng: number },
    setLocation: (name: string) => void
  ) => {
    try {
      const response = await fetch(`/api/reverse-geocode?lat=${coords.lat}&lng=${coords.lng}`);
      const data = await response.json();
      setLocation(data.place_name || 'Selected Location');
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setLocation('Selected Location');
    }
  };

  // Map redrawing logic to ensure the map is resized properly
  const MapRedraw = () => {
    const map = useMap();
    useEffect(() => {
      if (map) {
        map.invalidateSize();
      }
    }, [originCoords, destinationCoords, routeCoordinates, map]);
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputSection}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value);
              fetchSuggestions(e.target.value, true); // Pass 'true' for origin
            }}
            className={styles.input}
            placeholder="Enter origin"
          />
          {showOriginSuggestions && (
            <ul className={styles.suggestionsList}>
              {originSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={styles.suggestionItem}
                  onClick={() => {
                    setOrigin(suggestion.description);
                    setOriginCoords({
                      lat: suggestion.latitude,
                      lng: suggestion.longitude,
                    });
                    setShowOriginSuggestions(false);
                  }}
                >
                  {suggestion.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.inputGroup}>
          <input
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              fetchSuggestions(e.target.value, false); // Pass 'false' for destination
            }}
            className={styles.input}
            placeholder="Enter destination"
          />
          {showDestinationSuggestions && (
            <ul className={styles.suggestionsList}>
              {destinationSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={styles.suggestionItem}
                  onClick={() => {
                    setDestination(suggestion.description);
                    setDestinationCoords({
                      lat: suggestion.latitude,
                      lng: suggestion.longitude,
                    });
                    setShowDestinationSuggestions(false);
                  }}
                >
                  {suggestion.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={calculateDistance} className={styles.button}>
          Calculate
        </button>
        {distance && <p className={styles.distance}>Distance: {distance}</p>}
        {deliveryCharge && <p className={styles.deliveryCharge}>Delivery Charge: {deliveryCharge}</p>}
      </div>

      <div className={styles.mapContainer}>
        <MapContainer
          center={[24.817, 93.936]} // Default to Manipur
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler />
          <MapRedraw />
          {originCoords && <Marker position={[originCoords.lat, originCoords.lng]}>
            <Popup>Origin</Popup>
          </Marker>}
          {destinationCoords && <Marker position={[destinationCoords.lat, destinationCoords.lng]}>
            <Popup>Destination</Popup>
          </Marker>}
          {routeCoordinates.length > 0 && (
            <Polyline positions={routeCoordinates} color="blue" />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default DistanceCalculator;
