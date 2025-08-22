import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } => {
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
      // Calculate center point between two airports
      const centerLat = (newDepCoords[0] + newArrCoords[0]) / 2;
      const centerLng = (newDepCoords[1] + newArrCoords[1]) / 2;
      setMapCenter([centerLat, centerLng]);

      // Adjust zoom based on distance (simple heuristic)
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
    <div className="relative min-h-screen flex flex-col">
      <DynamicBackground images={ifrFlightPlanningBackgroundImages} interval={10000} />
      <div className="fixed inset-0 bg-black opacity-50 z-0"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto text-white flex-grow flex flex-col items-center justify-start p-4 pt-24 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">IFR Flight Planning Map</h1>

        <Card className="w-full h-[70vh] shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white relative overflow-hidden">
          <CardHeader className="absolute top-0 left-0 right-0 z-20 bg-white/90 dark:bg-gray-800/90 p-4 rounded-t-lg">
            <CardTitle>Interactive IFR Map</CardTitle>
            <CardDescription>Visualize your route and key aviation points.</CardDescription>
            <div className="flex flex-col md:flex-row gap-2 mt-4">
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
          </CardHeader>
          <CardContent className="p-0 h-full w-full relative">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {depCoords && <Marker position={depCoords} title={`Departure: ${departureIcao}`} />}
              {arrCoords && <Marker position={arrCoords} title={`Arrival: ${arrivalIcao}`} />}
              {depCoords && arrCoords && (
                <Polyline positions={[depCoords, arrCoords]} color="#007bff" weight={3} opacity={0.7} />
              )}
              {/* Placeholder for IFR Airways/Navaids - In a real app, this would load GeoJSON data */}
              {depCoords && arrCoords && (
                <Polyline
                  positions={[
                    [depCoords[0] + 1, depCoords[1] + 1],
                    [mapCenter[0], mapCenter[1]],
                    [arrCoords[0] - 1, arrCoords[1] - 1],
                  ]}
                  color="#ff7800"
                  weight={2}
                  dashArray="5, 5"
                  opacity={0.5}
                  tooltip="Simulated Airway"
                />
              )}
            </MapContainer>
            <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-gray-800/80 p-2 rounded-md text-xs text-gray-900 dark:text-white z-20">
              <p>Map data from OpenStreetMap contributors.</p>
              <p className="text-red-600">
                Note: Official IFR charts and detailed airway data are copyrighted and cannot be freely embedded. This map provides a basic visualization.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IfrFlightPlanning;