import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox GL CSS
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { showSuccess, showError } from '@/utils/toast';
import { mockAirports, mockNavaids } from '@/utils/mockAviationData';
import DynamicBackground from '@/components/DynamicBackground';
import { Plus, Trash2, Download } from 'lucide-react';

// IMPORTANT: Replace 'YOUR_MAPBOX_ACCESS_TOKEN' with your actual Mapbox Public Access Token.
// You can get one from https://account.mapbox.com/access-tokens/
// For production, consider loading this from an environment variable.
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN';

interface Waypoint {
  id: string;
  type: 'airport' | 'navaid' | 'custom';
  icao?: string;
  name: string;
  lat: number;
  lng: number;
}

const flightPlanningBackgroundImages = [
  '/images/backgrounds/flight-planning-bg.jpg',
];

const FlightPlanningMap: React.FC = () => {
  const [routeWaypoints, setRouteWaypoints] = useState<Waypoint[]>([]);
  const [newWaypointInput, setNewWaypointInput] = useState('');
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [viewState, setViewState] = useState({
    longitude: 23.0,
    latitude: 38.0,
    zoom: 5,
  });

  const addWaypoint = useCallback((waypoint: Waypoint) => {
    setRouteWaypoints((prev) => {
      const newWaypoints = [...prev, waypoint];
      showSuccess(`Added ${waypoint.name} to route!`);
      return newWaypoints;
    });
  }, []);

  const removeWaypoint = useCallback((id: string) => {
    setRouteWaypoints((prev) => prev.filter((wp) => wp.id !== id));
    showSuccess('Waypoint removed.');
  }, []);

  const handleAddWaypointFromInput = () => {
    const searchTerm = newWaypointInput.trim().toUpperCase();
    if (!searchTerm) {
      showError('Please enter an ICAO code or Navaid ID.');
      return;
    }

    const foundAirport = mockAirports.find((a) => a.icao === searchTerm);
    const foundNavaid = mockNavaids.find((n) => n.id === searchTerm);

    if (foundAirport) {
      addWaypoint({
        id: `airport-${foundAirport.icao}`,
        type: 'airport',
        icao: foundAirport.icao,
        name: foundAirport.name,
        lat: foundAirport.lat,
        lng: foundAirport.lng,
      });
    } else if (foundNavaid) {
      addWaypoint({
        id: `navaid-${foundNavaid.id}`,
        type: 'navaid',
        icao: foundNavaid.id,
        name: foundNavaid.name,
        lat: foundNavaid.lat,
        lng: foundNavaid.lng,
      });
    } else {
      showError('Airport or Navaid not found. Try LGAV, KJFK, ATH, etc.');
    }
    setNewWaypointInput('');
  };

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    addWaypoint({
      id: `custom-${Date.now()}`,
      type: 'custom',
      name: `Custom Point (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
      lat,
      lng,
    });
  }, [addWaypoint]);

  // Fit map to bounds of waypoints
  useEffect(() => {
    if (mapRef.current && routeWaypoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      routeWaypoints.forEach(wp => bounds.extend([wp.lng, wp.lat]));
      mapRef.current.fitBounds(bounds, { padding: 50, duration: 1000 });
    }
  }, [routeWaypoints]);

  const generateGeoJSON = () => {
    if (routeWaypoints.length < 2) {
      showError('Need at least two waypoints to generate a flight path.');
      return;
    }

    const coordinates = routeWaypoints.map(wp => [wp.lng, wp.lat]); // GeoJSON is [lng, lat]

    const geoJson = {
      type: 'LineString',
      coordinates: coordinates,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geoJson, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "flight_path.geojson");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showSuccess('GeoJSON file downloaded!');
  };

  const lineGeoJson = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: routeWaypoints.map(wp => [wp.lng, wp.lat]),
    },
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <DynamicBackground images={flightPlanningBackgroundImages} interval={10000} />
      <div className="fixed inset-0 bg-black opacity-40 z-0"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto text-white flex-grow flex flex-col items-center justify-start p-4 pt-24 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
          Flight Planning Map
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
          Click on the map to add custom waypoints, or search for airports/navaids.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Map Section */}
          <Card className="lg:col-span-2 shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white overflow-hidden">
            <CardHeader>
              <CardTitle>Interactive Map</CardTitle>
              <CardDescription>Click to add waypoints or drag to pan.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[500px]">
              <Map
                mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v11" // You can change this style
                onClick={handleMapClick}
                ref={mapRef}
              >
                {routeWaypoints.map((wp) => (
                  <Marker
                    key={wp.id}
                    longitude={wp.lng}
                    latitude={wp.lat}
                    anchor="bottom"
                  >
                    <div className="relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                        {wp.name}
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-map-pin text-red-500"
                      >
                        <path d="M12 17.5L12 17.5" />
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle cx="12" cy="9" r="3" />
                      </svg>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs h-6 px-2 py-0"
                        onClick={() => removeWaypoint(wp.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </Marker>
                ))}
                {routeWaypoints.length > 1 && (
                  <Source id="route-line" type="geojson" data={lineGeoJson}>
                    <Layer
                      id="line-layer"
                      type="line"
                      paint={{
                        'line-color': '#007bff',
                        'line-width': 3,
                        'line-dasharray': [2, 2],
                      }}
                    />
                  </Source>
                )}
              </Map>
            </CardContent>
          </Card>

          {/* Waypoint Management & Export */}
          <Card className="lg:col-span-1 shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white flex flex-col">
            <CardHeader>
              <CardTitle>Route Builder</CardTitle>
              <CardDescription>Manage your flight plan waypoints.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="newWaypoint">Add Airport (ICAO) / Navaid (ID)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="newWaypoint"
                      value={newWaypointInput}
                      onChange={(e) => setNewWaypointInput(e.target.value)}
                      placeholder="e.g., LGAV, ATH"
                    />
                    <Button onClick={handleAddWaypointFromInput}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
                <Separator />
                <h3 className="font-semibold text-lg">Current Route:</h3>
                <div className="max-h-60 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-700">
                  {routeWaypoints.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No waypoints added yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {routeWaypoints.map((wp, index) => (
                        <li key={wp.id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{index + 1}. {wp.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeWaypoint(wp.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={generateGeoJSON} className="w-full" disabled={routeWaypoints.length < 2}>
                  <Download className="mr-2 h-4 w-4" /> Download GeoJSON
                </Button>
                <Button variant="outline" onClick={() => setRouteWaypoints([])} className="w-full mt-2">
                  Clear All Waypoints
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlightPlanningMap;