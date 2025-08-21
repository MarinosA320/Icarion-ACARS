import React, { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

// Fix for default Leaflet icon issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Waypoint {
  id: string;
  type: 'airport' | 'navaid' | 'custom';
  icao?: string;
  name: string;
  lat: number;
  lng: number;
}

interface MapWrapperProps {
  routeWaypoints: Waypoint[];
  handleMapClick: (e: L.LeafletMouseEvent) => void;
  removeWaypoint: (id: string) => void;
}

const MapWrapper: React.FC<MapWrapperProps> = ({ routeWaypoints, handleMapClick, removeWaypoint }) => {
  const mapRef = useRef<L.Map | null>(null);

  // Effect to explicitly clean up the Leaflet map instance when the component unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        console.log('MapWrapper: Cleaning up Leaflet map instance.');
        mapRef.current.remove(); // Remove the map from the DOM and destroy its internal state
        mapRef.current = null; // Clear the ref
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleanup on unmount

  // Effect to fit map to bounds of waypoints whenever routeWaypoints change
  useEffect(() => {
    if (mapRef.current && routeWaypoints.length > 0) {
      const bounds = L.latLngBounds(routeWaypoints.map(wp => [wp.lat, wp.lng]));
      mapRef.current.fitBounds(bounds, { padding: 50, duration: 0.5 });
    }
  }, [routeWaypoints]);

  const lineGeoJsonPositions = routeWaypoints.map(wp => [wp.lat, wp.lng]);

  return (
    <MapContainer
      key={Date.now()} // Keep this dynamic key to force re-mount on HMR updates
      center={[38.0, 23.0]}
      zoom={3}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%' }}
      onClick={handleMapClick}
      whenCreated={mapInstance => { mapRef.current = mapInstance; }}
      className="rounded-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routeWaypoints.map((wp) => (
        <Marker
          key={wp.id}
          position={[wp.lat, wp.lng]}
        >
          <Popup>
            <div className="font-semibold">{wp.name}</div>
            <div className="text-xs text-muted-foreground">Lat: {wp.lat.toFixed(2)}, Lng: {wp.lng.toFixed(2)}</div>
            <Button
              variant="destructive"
              size="sm"
              className="mt-2 text-xs h-6 px-2 py-0"
              onClick={() => removeWaypoint(wp.id)}
            >
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </Popup>
        </Marker>
      ))}
      {routeWaypoints.length > 1 && (
        <Polyline positions={lineGeoJsonPositions} color="#007bff" weight={3} dashArray="5, 5" />
      )}
    </MapContainer>
  );
};

export default MapWrapper;