import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { mockAirports, mockNavaids } from '@/utils/mockAviationData';
import DynamicBackground from '@/components/DynamicBackground';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { ALL_AIRLINES } from '@/utils/aircraftData'; // Import ALL_AIRLINES for SimBrief

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

const flightPlanningBackgroundImages = [
  '/images/backgrounds/flight-planning-bg.jpg',
];

const FlightPlanning: React.FC = () => {
  const [departureIcao, setDepartureIcao] = useState('');
  const [arrivalIcao, setArrivalIcao] = useState('');
  const [alternateIcao, setAlternateIcao] = useState('');
  const [aircraftType, setAircraftType] = useState(''); // e.g., B738, A320
  const [cruiseLevel, setCruiseLevel] = useState(''); // e.g., FL350
  const [routeString, setRouteString] = useState(''); // Free text route string
  const [fuelGallons, setFuelGallons] = useState('');
  const [payloadLbs, setPayloadLbs] = useState('');

  const [routeWaypoints, setRouteWaypoints] = useState<Waypoint[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  // Function to parse route string and add waypoints
  const parseAndPlotRoute = useCallback(() => {
    const newWaypoints: Waypoint[] = [];
    const routeParts = routeString.split(/\s+/).filter(Boolean);

    // Add departure airport if valid
    const depAirport = mockAirports.find(a => a.icao === departureIcao.toUpperCase());
    if (depAirport) {
      newWaypoints.push({ id: `airport-${depAirport.icao}`, type: 'airport', icao: depAirport.icao, name: depAirport.name, lat: depAirport.lat, lng: depAirport.lng });
    }

    routeParts.forEach(part => {
      const foundAirport = mockAirports.find(a => a.icao === part.toUpperCase());
      const foundNavaid = mockNavaids.find(n => n.id === part.toUpperCase());

      if (foundAirport) {
        newWaypoints.push({ id: `airport-${foundAirport.icao}`, type: 'airport', icao: foundAirport.icao, name: foundAirport.name, lat: foundAirport.lat, lng: foundAirport.lng });
      } else if (foundNavaid) {
        newWaypoints.push({ id: `navaid-${foundNavaid.id}`, type: 'navaid', icao: foundNavaid.id, name: foundNavaid.name, lat: foundNavaid.lat, lng: foundNavaid.lng });
      }
      // Ignore unknown parts for now
    });

    // Add arrival airport if valid
    const arrAirport = mockAirports.find(a => a.icao === arrivalIcao.toUpperCase());
    if (arrAirport && arrAirport.icao !== (newWaypoints[newWaypoints.length - 1]?.icao || '')) { // Avoid duplicate if already added by route string
      newWaypoints.push({ id: `airport-${arrAirport.icao}`, type: 'airport', icao: arrAirport.icao, name: arrAirport.name, lat: arrAirport.lat, lng: arrAirport.lng });
    }

    setRouteWaypoints(newWaypoints);
    if (newWaypoints.length > 0) {
      showSuccess('Route parsed and plotted!');
    } else {
      showError('No recognizable waypoints found in route string.');
    }
  }, [routeString, departureIcao, arrivalIcao]);

  // Effect to fit map to bounds of waypoints
  useEffect(() => {
    if (mapRef.current && routeWaypoints.length > 0) {
      const bounds = L.latLngBounds(routeWaypoints.map(wp => [wp.lat, wp.lng]));
      mapRef.current.fitBounds(bounds, { padding: 50, duration: 0.5 });
    }
  }, [routeWaypoints]);

  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setRouteWaypoints((prev) => {
      const newWaypoint: Waypoint = {
        id: `custom-${Date.now()}`,
        type: 'custom',
        name: `Custom Point (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
        lat,
        lng,
      };
      return [...prev, newWaypoint];
    });
    showSuccess(`Added custom point (${lat.toFixed(2)}, ${lng.toFixed(2)})`);
  }, []);

  const removeWaypoint = useCallback((id: string) => {
    setRouteWaypoints((prev) => prev.filter((wp) => wp.id !== id));
    showSuccess('Waypoint removed.');
  }, []);

  const generateSimBriefLink = () => {
    if (!departureIcao || !arrivalIcao || !aircraftType) {
      showError('Departure, Arrival, and Aircraft Type are required for SimBrief export.');
      return;
    }

    const simbriefBaseUrl = "https://dispatch.simbrief.com/options/dispatch.php?";
    const params = new URLSearchParams();

    params.append("orig", departureIcao.toUpperCase());
    params.append("dest", arrivalIcao.toUpperCase());
    params.append("type", aircraftType.toUpperCase());
    if (alternateIcao) params.append("alt", alternateIcao.toUpperCase());
    if (cruiseLevel) params.append("fl", cruiseLevel.replace(/FL|F/g, '').trim()); // Remove FL/F prefix
    if (routeString) params.append("route", routeString.trim());
    if (fuelGallons) params.append("fuel", fuelGallons); // SimBrief expects LBS or KGS, but can sometimes parse gallons
    if (payloadLbs) params.append("paxw", payloadLbs); // SimBrief uses paxw for payload weight

    const simbriefUrl = simbriefBaseUrl + params.toString();
    window.open(simbriefUrl, '_blank');
    showSuccess('Opening SimBrief with pre-filled data!');
  };

  const clearAll = () => {
    setDepartureIcao('');
    setArrivalIcao('');
    setAlternateIcao('');
    setAircraftType('');
    setCruiseLevel('');
    setRouteString('');
    setFuelGallons('');
    setPayloadLbs('');
    setRouteWaypoints([]);
    showSuccess('All fields cleared!');
  };

  const lineGeoJsonPositions = routeWaypoints.map(wp => [wp.lat, wp.lng]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <DynamicBackground images={flightPlanningBackgroundImages} interval={10000} />
      <div className="fixed inset-0 bg-black opacity-40 z-0"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto text-white flex-grow flex flex-col items-center justify-start p-4 pt-24 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
          Basic Flight Planning
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
          Plan your route, visualize it on the map, and export to SimBrief.
        </p>

        <Card className="w-full shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white mb-8">
          <CardHeader>
            <CardTitle>Flight Details</CardTitle>
            <CardDescription>Enter your flight information for planning and export.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="departureIcao">Departure Airport (ICAO)</Label>
                <Input id="departureIcao" value={departureIcao} onChange={(e) => setDepartureIcao(e.target.value.toUpperCase())} placeholder="e.g., KLAX" maxLength={4} />
              </div>
              <div>
                <Label htmlFor="arrivalIcao">Arrival Airport (ICAO)</Label>
                <Input id="arrivalIcao" value={arrivalIcao} onChange={(e) => setArrivalIcao(e.target.value.toUpperCase())} placeholder="e.g., KJFK" maxLength={4} />
              </div>
              <div>
                <Label htmlFor="alternateIcao">Alternate Airport (ICAO, Optional)</Label>
                <Input id="alternateIcao" value={alternateIcao} onChange={(e) => setAlternateIcao(e.target.value.toUpperCase())} placeholder="e.g., KORD" maxLength={4} />
              </div>
              <div>
                <Label htmlFor="aircraftType">Aircraft Type (ICAO)</Label>
                <Input id="aircraftType" value={aircraftType} onChange={(e) => setAircraftType(e.target.value.toUpperCase())} placeholder="e.g., B738, A320" />
              </div>
              <div>
                <Label htmlFor="cruiseLevel">Cruise Level (e.g., FL350)</Label>
                <Input id="cruiseLevel" value={cruiseLevel} onChange={(e) => setCruiseLevel(e.target.value.toUpperCase())} placeholder="e.g., FL350" />
              </div>
              <div>
                <Label htmlFor="fuelGallons">Fuel (Gallons, Optional)</Label>
                <Input id="fuelGallons" type="number" value={fuelGallons} onChange={(e) => setFuelGallons(e.target.value)} placeholder="e.g., 10000" />
              </div>
              <div>
                <Label htmlFor="payloadLbs">Payload (Lbs, Optional)</Label>
                <Input id="payloadLbs" type="number" value={payloadLbs} onChange={(e) => setPayloadLbs(e.target.value)} placeholder="e.g., 20000" />
              </div>
            </div>
            <div className="col-span-full mb-4">
              <Label htmlFor="routeString">Route String (Free Text)</Label>
              <Textarea id="routeString" value={routeString} onChange={(e) => setRouteString(e.target.value)} placeholder="e.g., DCT VOR DCT" rows={3} />
              <p className="text-xs text-muted-foreground mt-1">
                Enter your route using ICAO codes for airports and navaids (e.g., LGAV ATH SKG LGTS).
                This tool does not validate airways, SIDs, or STARs.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={parseAndPlotRoute}>Plot Route on Map</Button>
              <Button onClick={generateSimBriefLink} variant="secondary">
                <ExternalLink className="mr-2 h-4 w-4" /> Export to SimBrief
              </Button>
              <Button onClick={clearAll} variant="outline">Clear All</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white overflow-hidden">
          <CardHeader>
            <CardTitle>Route Visualization</CardTitle>
            <CardDescription>Click on the map to add custom waypoints.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[500px]">
            <MapContainer
              key="flight-planning-map"
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
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p className="font-bold text-red-500">Disclaimer:</p>
          <p>This Flight Planning tool is for basic visualization and SimBrief export only.</p>
          <p>It does NOT use certified aviation data, real-time weather, or validate against actual AIRAC cycles, airways, SIDs, or STARs.</p>
          <p>Always use official, certified sources for actual flight planning and navigation.</p>
        </div>
      </div>
    </div>
  );
};

export default FlightPlanning;