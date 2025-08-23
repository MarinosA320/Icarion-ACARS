import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { formatDistanceToNow } from 'date-fns';
import { Plane } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import DynamicBackground from '@/components/DynamicBackground';
import { fetchProfilesData } from '@/utils/supabaseDataFetch';

// Fix for default marker icon not showing up
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icon for aircraft
const planeIcon = new L.DivIcon({
  html: `<div class="relative"><svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1 .4-1.2.9L1 18l3.8-2.5 7.4 1.8 2.2 2.2 2.5 3.8 1.2-2.7c.2-.5-.2-1.2-.7-1.4Z"/></svg></div>`,
  className: 'leaflet-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12], // Center the icon
  popupAnchor: [0, -12], // Adjust popup position
});

interface LiveFlight {
  id: string;
  user_id: string;
  flight_id: string | null;
  callsign: string;
  aircraft_type: string;
  departure_airport: string | null;
  arrival_airport: string | null;
  current_latitude: number;
  current_longitude: number;
  current_altitude_ft: number | null;
  current_speed_kts: number | null;
  heading_deg: number | null;
  last_updated_at: string;
  is_active: boolean;
  user_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

// Helper component to force map invalidation
const MapInvalidator: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      console.log("Leaflet map invalidateSize() called.");
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const liveTrackingBackgroundImages = [
  '/images/backgrounds/live-tracking-bg.jpg', // You might want to add a specific background image here
];

const LiveFlightTracking: React.FC = () => {
  const [liveFlights, setLiveFlights] = useState<LiveFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  const fetchLiveFlights = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('live_flights')
      .select('id,user_id,flight_id,callsign,aircraft_type,departure_airport,arrival_airport,current_latitude,current_longitude,current_altitude_ft,current_speed_kts,heading_deg,last_updated_at,is_active')
      .eq('is_active', true);

    if (error) {
      showError('Error fetching live flights: ' + error.message);
      console.error('Error fetching live flights:', error);
      setLoading(false);
      return;
    }

    const userIds = new Set<string>();
    data.forEach(flight => userIds.add(flight.user_id));

    const profilesMap = await fetchProfilesData(Array.from(userIds));

    const flightsWithProfiles = data.map(flight => ({
      ...flight,
      user_profile: profilesMap[flight.user_id] || null,
    }));

    setLiveFlights(flightsWithProfiles as LiveFlight[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchLiveFlights();

    const channel = supabase
      .channel('live_flights_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_flights' },
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchLiveFlights(); // Re-fetch all flights to ensure data consistency
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col">
      <DynamicBackground images={liveTrackingBackgroundImages} interval={10000} />
      <div className="fixed inset-0 bg-black opacity-50 z-0"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto text-white flex-grow flex flex-col items-center justify-start p-4 pt-24 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Live Flight Tracking</h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
          See all active Icarion Virtual Airline flights in real-time!
        </p>

        <Card className="w-full bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white shadow-md rounded-lg overflow-hidden">
          <CardHeader>
            <CardTitle>Active Flights ({liveFlights.length})</CardTitle>
            <CardDescription>
              Flights are updated in real-time as pilots transmit their position.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ) : liveFlights.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No active flights currently being tracked.
              </div>
            ) : (
              <MapContainer
                center={[liveFlights[0].current_latitude, liveFlights[0].current_longitude]}
                zoom={4}
                scrollWheelZoom={true}
                className="h-[600px] w-full"
                whenCreated={(map) => { mapRef.current = map; }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {liveFlights.map(flight => (
                  <Marker
                    key={flight.id}
                    position={[flight.current_latitude, flight.current_longitude]}
                    icon={L.divIcon({
                      html: `<div style="transform: rotate(${flight.heading_deg || 0}deg);">${planeIcon.options.html}</div>`,
                      className: 'leaflet-div-icon',
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                      popupAnchor: [0, -12],
                    })}
                  >
                    <Popup>
                      <div className="font-semibold text-gray-900 dark:text-white">{flight.callsign}</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">
                        Pilot: {flight.user_profile?.display_name || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {flight.aircraft_type} from {flight.departure_airport || 'N/A'} to {flight.arrival_airport || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Alt: {flight.current_altitude_ft ? `${flight.current_altitude_ft} ft` : 'N/A'} | Spd: {flight.current_speed_kts ? `${flight.current_speed_kts} kts` : 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Last Updated: {formatDistanceToNow(new Date(flight.last_updated_at), { addSuffix: true })}
                      </div>
                    </Popup>
                  </Marker>
                ))}
                <MapInvalidator />
              </MapContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveFlightTracking;