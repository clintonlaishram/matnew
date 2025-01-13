"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, LoadScript, Marker, Autocomplete, DirectionsRenderer, Libraries } from "@react-google-maps/api";

const libraries: Libraries = ["places"];
const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 28.6139, // Fallback to New Delhi, India
  lng: 77.209,
};

const calculateDeliveryCharge = (distanceInKm: number): number => {
  const baseRate = 50; // Base charge
  const ratePerKm = 10; // Charge per km
  return baseRate + distanceInKm * ratePerKm;
};

const DistanceCalculator = () => {
  const [pickup, setPickup] = useState<string>("");
  const [dropoff, setDropoff] = useState<string>("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [charge, setCharge] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showCurrentLocationButton, setShowCurrentLocationButton] = useState<{ pickup: boolean; dropoff: boolean }>({
    pickup: false,
    dropoff: false,
  });

  const autocompletePickupRef = useRef<google.maps.places.Autocomplete | null>(null);
  const autocompleteDropoffRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const handleGoogleMapsLoad = useCallback(() => {
    geocoderRef.current = new google.maps.Geocoder();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setCurrentLocation(location);
      },
      (error) => {
        console.error("Error getting current location: ", error);
      }
    );
  }, []);

  const handlePlaceChange = (field: "pickup" | "dropoff") => {
    const autocomplete = field === "pickup" ? autocompletePickupRef.current : autocompleteDropoffRef.current;

    if (autocomplete) {
      const place = autocomplete.getPlace();

      if (place && place.geometry && place.geometry.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        if (field === "pickup") {
          setPickupCoords(location);
          setPickup(place.formatted_address || "Selected Location");
        } else {
          setDropoffCoords(location);
          setDropoff(place.formatted_address || "Selected Location");
        }
      } else {
        alert("Could not retrieve location details. Please select a valid location.");
      }
    }
    setShowCurrentLocationButton({ pickup: false, dropoff: false });
  };

  const selectCurrentLocation = (field: "pickup" | "dropoff") => {
    if (currentLocation && geocoderRef.current) {
      geocoderRef.current.geocode({ location: currentLocation }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const address = results[0].formatted_address;
          if (field === "pickup") {
            setPickupCoords(currentLocation);
            setPickup(address);
          } else {
            setDropoffCoords(currentLocation);
            setDropoff(address);
          }
        } else {
          alert("Unable to get the current location address.");
        }
      });
    } else {
      alert("Current location is not available.");
    }
    setShowCurrentLocationButton({ pickup: false, dropoff: false });
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!geocoderRef.current) return;

    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const location = { lat, lng };

      geocoderRef.current.geocode({ location }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          if (!pickupCoords) {
            setPickupCoords(location);
            setPickup(results[0].formatted_address);
          } else if (!dropoffCoords) {
            setDropoffCoords(location);
            setDropoff(results[0].formatted_address);
          }
        }
      });
    }
  };

  const handleCalculateRoute = async () => {
    if (!pickupCoords || !dropoffCoords) {
      alert("Please select both pickup and drop-off locations.");
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const result = await directionsService.route({
      origin: pickupCoords,
      destination: dropoffCoords,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    if (result.routes.length > 0) {
      const routeDistance = result.routes[0].legs[0].distance?.value || 0; // Distance in meters
      const distanceInKm = routeDistance / 1000;
      setDistance(distanceInKm);
      setCharge(calculateDeliveryCharge(distanceInKm));
      setDirections(result);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto bg-black-100 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center text-white-800 mb-6">Distance & Delivery Charge Calculator</h1>

      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
        libraries={libraries}
        onLoad={handleGoogleMapsLoad}
      >
        <div className="flex flex-col mb-4">
          <label className="font-semibold text-white-600 mb-2">Pick-Up Location:</label>
          <Autocomplete
            onLoad={(autocomplete) => (autocompletePickupRef.current = autocomplete)}
            onPlaceChanged={() => handlePlaceChange("pickup")}
          >
            <input
              type="text"
              placeholder="Enter pickup location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              onFocus={() => setShowCurrentLocationButton({ ...showCurrentLocationButton, pickup: true })}
              className="p-3 border text-black border-black-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
"
            />
          </Autocomplete>
          {showCurrentLocationButton.pickup && (
            <button
              onClick={() => selectCurrentLocation("pickup")}
              className="p-2 mt-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition duration-300"
            >
              Use Current Location
            </button>
          )}
        </div>

        <div className="flex flex-col mb-4">
          <label className="font-semibold text-gray-600 mb-2">Drop-Off Location:</label>
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteDropoffRef.current = autocomplete)}
            onPlaceChanged={() => handlePlaceChange("dropoff")}
          >
            <input
              type="text"
              placeholder="Enter drop-off location"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              onFocus={() => setShowCurrentLocationButton({ ...showCurrentLocationButton, dropoff: true })}
              className="p-3 border text-black border-black-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Autocomplete>
          {showCurrentLocationButton.dropoff && (
            <button
              onClick={() => selectCurrentLocation("dropoff")}
              className="p-2 mt-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition duration-300"
            >
              Use Current Location
            </button>
          )}
        </div>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={pickupCoords || currentLocation || defaultCenter}
          zoom={pickupCoords && dropoffCoords ? 10 : 6}
          onClick={handleMapClick}
        >
          {pickupCoords && <Marker position={pickupCoords} />}
          {dropoffCoords && <Marker position={dropoffCoords} />}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>

      <button
        onClick={handleCalculateRoute}
        className="p-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition duration-300 mt-4"
      >
        Calculate Distance & Delivery Charge
      </button>

      {distance !== null && charge !== null && (
        <div className="mt-6">
          <p className="text-lg font-semibold">Distance: {distance.toFixed(2)} km</p>
          <p className="text-lg font-semibold">Delivery Charge: ₹{charge.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default DistanceCalculator;
