import { useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

interface MapClickHandlerProps {
  onMapClick: (coords: { lat: number; lng: number }) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick }) => {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
      onMapClick(coords);
    },
  });
  return null;
};

export default MapClickHandler;