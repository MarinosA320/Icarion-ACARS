import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing up
// Instead of deleting, explicitly set the _getIconUrl method
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Define the _getIconUrl method on the prototype
// This is a common workaround for Leaflet icons not appearing in some environments
if (typeof L.Icon.Default.prototype._getIconUrl === 'undefined') {
  L.Icon.Default.prototype._getIconUrl = function (name: string) {
    return L.Icon.Default.prototype.options[name];
  };
}


interface FlightPathMapProps {
  geoJsonData: any; // Expecting GeoJSON LineString or FeatureCollection with LineString
}

const FlightPathMap: React.FC<FlightPathMapProps> = ({ geoJsonData }) => {
  if (!geoJsonData || !geoJsonData.coordinates || geoJsonData.coordinates.length === 0) {
    return <div className="text-center text-muted-foreground p-4">No flight path data available.</div>;
  }

  // Extract coordinates from GeoJSON LineString
  const pathCoordinates = geoJsonData.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]); // Leaflet expects [lat, lng]

  if (pathCoordinates.length === 0) {
    return <div className="text-center text-muted-foreground p-4">Invalid flight path data.</div>;
  }

  const startPoint = pathCoordinates[0];
  const endPoint = pathCoordinates[pathCoordinates.length - 1];

  return (
    <MapContainer
      center={startPoint}
      zoom={6}
      scrollWheelZoom={false}
      className="h-96 w-full rounded-md shadow-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={pathCoordinates} color="#007bff" weight={3} />
      <Marker position={startPoint} title="Departure" />
      <Marker position={endPoint} title="Arrival" />
    </MapContainer>
  );
};

export default FlightPathMap;