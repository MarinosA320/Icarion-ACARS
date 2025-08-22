import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import SimpleMap from '@/components/SimpleMap'; // Import the new SimpleMap component

const IfrFlightPlanning: React.FC = () => {
  const [departureIcao, setDepartureIcao] = useState('');
  const [arrivalIcao, setArrivalIcao] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([34.0522, -118.2437]); // Default to Los Angeles
  const [mapZoom, setMapZoom] = useState(5);
  const [depCoords, setDepCoords] = useState<[number, number] | null>(null);
  const [arrCoords, setArrCoords] = useState<[number, number] | null>(null);

  // Dummy airport coordinates for demonstration
  const airportCoordinates: { [key: string]: [number, number] } = {
    'KLAX': [33.9425, -118.4085], // Los Angeles
    'KJFK': [40.6413, -73.7781],  // New York
    'KORD': [41.9742, -87.9073],  // Chicago
    'EGLL': [51.4700, -0.4543],   // London Heathrow
    'EDDF': [50.0333, 8.5706],    // Frankfurt
    'LFPG': [49.0097, 2.5479],    // Paris CDG
    'OMDB': [25.2532, 55.3657],   // Dubai
    'RJTT': [35.5494, 139.7798],  // Tokyo Haneda
  };

  const handleLoadMap = () => {
    const dep = departureIcao.toUpperCase();
    const arr = arrivalIcao.toUpperCase();

    const newDepCoords = airportCoordinates[dep] || null;
    const newArrCoords = airportCoordinates[arr] || null;

    setDepCoords(newDepCoords);
    setArrCoords(newArrCoords);

    if (newDepCoords && newArrCoords) {
      const centerLat = (newDepCoords[0] + newArrCoords[0]) / 2;
      const centerLng = (newDepCoords[1] + newArrCoords[1]) / 2;
      setMapCenter([centerLat, centerLng]);

      const latDiff = Math.abs(newDepCoords[0] - newArrCoords[0]);
      const lngDiff = Math.abs(newDepCoords[1] - newArrCoords[1]);
      const maxDiff = Math.max(latDiff, lngDiff);

      if (maxDiff < 5) setMapZoom(7);
      else if (maxDiff < 15) setMapZoom(6);
      else if (maxDiff < 30) setMapZoom(5);
      else setMapZoom(4);

    } else if (newDepCoords) {
      setMapCenter(newDepCoords);
      setMapZoom(8);
    } else if (newArrCoords) {
      setMapCenter(newArrCoords);
      setMapZoom(8);
    } else {
      showError('Please enter valid ICAO codes to load the map.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-24 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">IFR Flight Planning Map</h1>

      <div className="w-full max-w-7xl h-[70vh] shadow-md rounded-lg bg-white dark:bg-gray-800 relative overflow-hidden">
        {/* Input fields as an overlay */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 dark:bg-gray-800/90 p-4 rounded-t-lg flex flex-col md:flex-row gap-2">
          <Input
            placeholder="Departure ICAO (e.g., KLAX)"
            value={departureIcao}
            onChange={(e) => setDepartureIcao(e.target.value.toUpperCase())}
            maxLength={4}
            className="flex-1"
          />
          <Input
            placeholder="Arrival ICAO (e.g., KJFK)"
            value={arrivalIcao}
            onChange={(e) => setArrivalIcao(e.target.value.toUpperCase())}
            maxLength={4}
            className="flex-1"
          />
          <Button onClick={handleLoadMap} className="w-full md:w-auto">Load Map</Button>
        </div>

        {/* Map Component */}
        <SimpleMap
          center={mapCenter}
          zoom={mapZoom}
          depCoords={depCoords}
          arrCoords={arrCoords}
          departureIcao={departureIcao}
          arrivalIcao={arrivalIcao}
        />

        <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-gray-800/80 p-2 rounded-md text-xs text-gray-900 dark:text-white z-20">
          <p>Map data from OpenStreetMap contributors.</p>
          <p className="text-red-600">
            Note: Official IFR charts and detailed airway data are copyrighted and cannot be freely embedded. This map provides a basic visualization.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IfrFlightPlanning;