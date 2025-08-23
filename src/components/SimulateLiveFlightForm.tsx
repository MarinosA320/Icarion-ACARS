import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { AIRCRAFT_FAMILIES, ALL_AIRLINES } from '@/utils/aircraftData';

interface SimulateLiveFlightFormProps {
  currentUserId: string | null;
  userVatsimIvaoId: string | null;
}

const SimulateLiveFlightForm: React.FC<SimulateLiveFlightFormProps> = ({ currentUserId, userVatsimIvaoId }) => {
  const [callsign, setCallsign] = useState('');
  const [aircraftType, setAircraftType] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [latitude, setLatitude] = useState('0');
  const [longitude, setLongitude] = useState('0');
  const [altitude, setAltitude] = useState('0');
  const [speed, setSpeed] = useState('0');
  const [heading, setHeading] = useState('0');
  const [loading, setLoading] = useState(false);
  const [isFlightActive, setIsFlightActive] = useState(false);
  const [liveFlightId, setLiveFlightId] = useState<string | null>(null); // To store the ID of the active live flight

  // Populate initial callsign from VATSIM/IVAO ID if available
  useEffect(() => {
    if (userVatsimIvaoId && !callsign) {
      setCallsign(`ICN${userVatsimIvaoId}`); // Example: ICN + VATSIM ID
    }
  }, [userVatsimIvaoId, callsign]);

  // Check for existing active flight on component mount
  useEffect(() => {
    const checkActiveFlight = async () => {
      if (!currentUserId) return;
      const { data, error } = await supabase
        .from('live_flights')
        .select('id, callsign, aircraft_type, departure_airport, arrival_airport, current_latitude, current_longitude, current_altitude_ft, current_speed_kts, heading_deg, is_active')
        .eq('user_id', currentUserId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('Error checking active flight:', error);
      } else if (data) {
        setIsFlightActive(true);
        setLiveFlightId(data.id);
        setCallsign(data.callsign);
        setAircraftType(data.aircraft_type);
        setDepartureAirport(data.departure_airport || '');
        setArrivalAirport(data.arrival_airport || '');
        setLatitude(data.current_latitude.toString());
        setLongitude(data.current_longitude.toString());
        setAltitude(data.current_altitude_ft?.toString() || '0');
        setSpeed(data.current_speed_kts?.toString() || '0');
        setHeading(data.heading_deg?.toString() || '0');
        showSuccess('Resumed active live flight simulation.');
      }
    };
    checkActiveFlight();
  }, [currentUserId]);

  const sendLiveFlightUpdate = async (activeStatus: boolean) => {
    setLoading(true);
    if (!currentUserId) {
      showError('User not logged in.');
      setLoading(false);
      return;
    }

    if (!callsign || !aircraftType || latitude === '' || longitude === '') {
      showError('Callsign, Aircraft Type, Latitude, and Longitude are required.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('update-live-flight', {
        body: {
          user_id: currentUserId,
          callsign,
          aircraft_type: aircraftType,
          departure_airport: departureAirport || null,
          arrival_airport: arrivalAirport || null,
          current_latitude: parseFloat(latitude),
          current_longitude: parseFloat(longitude),
          current_altitude_ft: parseInt(altitude, 10) || null,
          current_speed_kts: parseInt(speed, 10) || null,
          heading_deg: parseInt(heading, 10) || null,
          is_active: activeStatus,
        },
      });

      if (error) {
        showError('Error updating live flight: ' + error.message);
        console.error('Error invoking update-live-flight Edge Function:', error);
      } else {
        if (activeStatus) {
          showSuccess('Live flight started/updated successfully!');
          setIsFlightActive(true);
          setLiveFlightId(data.data[0].id); // Store the ID of the upserted flight
        } else {
          showSuccess('Live flight ended successfully!');
          setIsFlightActive(false);
          setLiveFlightId(null);
          // Optionally clear form fields after ending flight
          setCallsign('');
          setAircraftType('');
          setDepartureAirport('');
          setArrivalAirport('');
          setLatitude('0');
          setLongitude('0');
          setAltitude('0');
          setSpeed('0');
          setHeading('0');
        }
      }
    } catch (err: any) {
      showError('Network or unexpected error: ' + err.message);
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartFlight = (e: React.FormEvent) => {
    e.preventDefault();
    sendLiveFlightUpdate(true);
  };

  const handleEndFlight = () => {
    sendLiveFlightUpdate(false);
  };

  const allAircraftTypes = Object.keys(AIRCRAFT_FAMILIES).filter((value, index, self) => self.indexOf(value) === index);

  return (
    <Card className="mb-8 p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Simulate Live Flight Tracking
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Manually send flight data to see it on the Live Tracking map.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={handleStartFlight} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="col-span-full">
            <Label htmlFor="callsign">Callsign</Label>
            <Input
              id="callsign"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value.toUpperCase())}
              placeholder="e.g., ICN123"
              required
              disabled={loading}
            />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="aircraftType">Aircraft Type (ICAO)</Label>
            <Select value={aircraftType} onValueChange={setAircraftType} disabled={loading}>
              <SelectTrigger id="aircraftType">
                <SelectValue placeholder="Select aircraft type" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {allAircraftTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="departureAirport">Departure Airport (ICAO)</Label>
            <Input
              id="departureAirport"
              value={departureAirport}
              onChange={(e) => setDepartureAirport(e.target.value.toUpperCase())}
              placeholder="e.g., KLAX"
              maxLength={4}
              disabled={loading}
            />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="arrivalAirport">Arrival Airport (ICAO)</Label>
            <Input
              id="arrivalAirport"
              value={arrivalAirport}
              onChange={(e) => setArrivalAirport(e.target.value.toUpperCase())}
              placeholder="e.g., KJFK"
              maxLength={4}
              disabled={loading}
            />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="latitude">Current Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g., 34.0522"
              required
              disabled={loading}
            />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="longitude">Current Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g., -118.2437"
              required
              disabled={loading}
            />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="altitude">Altitude (ft)</Label>
            <Input
              id="altitude"
              type="number"
              value={altitude}
              onChange={(e) => setAltitude(e.target.value)}
              placeholder="e.g., 35000"
              disabled={loading}
            />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="speed">Speed (kts)</Label>
            <Input
              id="speed"
              type="number"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              placeholder="e.g., 450"
              disabled={loading}
            />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="heading">Heading (deg)</Label>
            <Input
              id="heading"
              type="number"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g., 270"
              min="0"
              max="359"
              disabled={loading}
            />
          </div>

          <div className="col-span-full flex justify-end mt-6 space-x-2">
            {!isFlightActive ? (
              <Button type="submit" disabled={loading}>
                {loading ? 'Starting...' : 'Start Live Flight'}
              </Button>
            ) : (
              <>
                <Button type="submit" disabled={loading} variant="secondary">
                  {loading ? 'Updating...' : 'Update Live Flight'}
                </Button>
                <Button type="button" onClick={handleEndFlight} disabled={loading} variant="destructive">
                  {loading ? 'Ending...' : 'End Live Flight'}
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimulateLiveFlightForm;