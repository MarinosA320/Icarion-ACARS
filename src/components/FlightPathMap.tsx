import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet'; // Import Leaflet library for custom icon

// Fix for default Leaflet icon issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface FlightPathMapProps {
  geoJsonData: any; // Expecting GeoJSON LineString or FeatureCollection with LineString
}

const FlightPathMap: React.FC<FlightPathMapProps> = ({ geoJsonData }) => {
  if (!geoJsonData || !geoJsonData.coordinates || geoJsonData.coordinates.length === 0) {
    return <div className="text-center text-muted-foreground p-4">No flight path data available.</div>;
  }

  // Leaflet expects [latitude, longitude] for coordinates, GeoJSON is [longitude, latitude]
  const pathCoordinates = geoJsonData.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);

  if (pathCoordinates.length === 0) {
    return <div className="text-center text-muted-foreground p-4">Invalid flight path data.</div>;
  }

  const startPoint = pathCoordinates[0];
  const endPoint = pathCoordinates[pathCoordinates.length - 1];

  // Calculate bounds for fitting the map
  const bounds = L.latLngBounds(pathCoordinates);

  return (
    <MapContainer
      bounds={bounds}
      zoom={6} // Default zoom, will be adjusted by fitBounds
      scrollWheelZoom={false} // Make it non-interactive for display purposes
      style={{ width: '100%', height: '384px' }} // h-96 is 384px
      className="rounded-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={pathCoordinates} color="#007bff" weight={3} />
      <Marker position={startPoint}>
        <Popup>Departure</Popup>
      </Marker>
      <Marker position={endPoint}>
        <Popup>Arrival</Popup>
      </Marker>
    </MapContainer>
  );
};

export default FlightPathMap;