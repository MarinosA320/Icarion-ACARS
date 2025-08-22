import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing up
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Ensure the _getIconUrl method is defined
if (typeof L.Icon.Default.prototype._getIconUrl === 'undefined') {
  L.Icon.Default.prototype._getIconUrl = function (name: string) {
    return L.Icon.Default.prototype.options[name];
  };
}

const IfrFlightPlanning: React.FC = () => {
  const defaultCenter: [number, number] = [51.505, -0.09]; // London coordinates
  const defaultZoom = 13;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-24 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">Basic Map Test</h1>
      <div className="w-full max-w-4xl h-[600px] shadow-md rounded-lg overflow-hidden border border-blue-500">
        <MapContainer center={defaultCenter} zoom={defaultZoom} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={defaultCenter} />
        </MapContainer>
      </div>
      <div className="w-full max-w-4xl mt-4 p-2 rounded-md text-xs text-gray-900 dark:text-white bg-white/80 dark:bg-gray-800/80">
        <p>This is a minimal map test. If you see a map here, the core Leaflet setup is working.</p>
      </div>
    </div>
  );
};

export default IfrFlightPlanning;