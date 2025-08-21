import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { showSuccess, showError } from '@/utils/toast';
import { mockAirports, mockNavaids } from '@/utils/mockAviationData'; // Import mock data
import DynamicBackground from '@/components/DynamicBackground';
import { Plane, MapPin, Plus, Trash2, Download } from 'lucide-react';

// Fix for default marker icon not showing up
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icon for airports
const airportIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plane"><path d="M17.8 19.2 16 11.4l4.8 1.5c.9.3 1.5.9 1.5 1.7v.2c0 1-.7 1.5-1.5 1.7L17.8 19.2Z"/><path d="M13.6 19.8c-.6.8-1.5 1.2-2.4 1.2H9.5c-.9 0-1.8-.4-2.4-1.2L3.6 14.4c-.9-1.2-.6-2.9.7-3.8l1.5-1c.9-.6 2.2-.6 3.1 0L12 12l3.1-2.4c.9-.6 2.2-.6 3.1 0l1.5 1c1.3.9 1.6 2.6.7 3.8l-3.6 5.4Z"/><path d="M17.8 4.8 16 12.6l4.8-1.5c.9-.3 1.5-.9 1.5-1.7v-.2c0-1-.7-1.5-1.5-1.7L17.8 4.8Z"/></svg>'),
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10],
  className: 'text-blue-600 dark:text-blue-400'
});

// Custom icon for navaids
const navaidIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M12 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M12 22.5V12"/><path d="M12 12H4.2C3.7 12 3 11.3 3 10.8V6.2C3 5.7 3.7 5 4.2 5h15.6c.5 0 1.2.7 1.2 1.2v4.7c0 .5-.7 1.2-1.2 1.2H12Z"/></svg>'),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
  className: 'text-green-600 dark:text-green-400'
});

interface Waypoint {
  id: string;
  type: 'airport' | 'navaid' | 'custom';
  icao?: string;
  name: string;
  lat: number;
  lng: number;
}

const flightPlanningBackgroundImages = [
  '/images/backgrounds/flight-planning-bg.jpg', // Placeholder, replace with actual image
];

const FlightPlanningMap: React.FC = () => {
  const [routeWaypoints, setRouteWaypoints] = useState<Waypoint[]>([]);
  const [newWaypointInput, setNewWaypointInput] = useState('');
  const mapRef = useRef<L.Map | null>(null);

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

  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    addWaypoint({
      id: `custom-${Date.now()}`,
      type: 'custom',
      name: `Custom Point (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
      lat,
      lng,
    });
  }, [addWaypoint]);

  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  // Fit map to bounds of waypoints
  useEffect(() => {
    if (mapRef.current && routeWaypoints.length > 0) {
      const bounds = L.latLngBounds(routeWaypoints.map(wp => [wp.lat, wp.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
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
              <MapContainer
                center={[38.0, 23.0]} // Centered near Athens for initial view
                zoom={5}
                scrollWheelZoom={true}
                className="h-full w-full"
                whenCreated={mapInstance => { mapRef.current = mapInstance; }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler />
                {routeWaypoints.map((wp) => (
                  <Marker
                    key={wp.id}
                    position={[wp.lat, wp.lng]}
                    icon={wp.type === 'airport' ? airportIcon : navaidIcon}
                  >
                    <L.Popup>
                      <strong>{wp.name}</strong><br />
                      Lat: {wp.lat.toFixed(4)}, Lng: {wp.lng.toFixed(4)}
                      <br />
                      <Button variant="destructive" size="sm" className="mt-2" onClick={() => removeWaypoint(wp.id)}>
                        Remove
                      </Button>
                    </L.Popup>
                  </Marker>
                ))}
                {routeWaypoints.length > 1 && (
                  <Polyline
                    positions={routeWaypoints.map(wp => [wp.lat, wp.lng])}
                    color="#007bff"
                    weight={3}
                    dashArray="5, 10"
                  />
                )}
              </MapContainer>
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