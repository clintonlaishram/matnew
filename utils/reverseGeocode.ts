import axios from 'axios';

const GOOGLE_GEOCODING_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEOCODING_API_KEY;

export async function getLocationName(latitude: number, longitude: number): Promise<string> {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_GEOCODING_API_KEY}`
    );
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].formatted_address; // Returns the most relevant address
    }
    return 'Unknown Location';
  } catch (error) {
    console.error('Error fetching location name:', error);
    return 'Unknown Location';
  }
}
