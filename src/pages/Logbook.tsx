import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { fetchVatsimPilotData, fetchSimbriefData } from '@/utils/flightDataFetch'; // Updated import
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Input } from '@/components/ui/input'; // Import Input component
import { ALL_AIRLINES } from '@/utils/aircraftData'; // Import ALL_AIRLINES

interface Flight {
  id: string;
  departure_airport: string;
  arrival_airport: string;
  aircraft_type: string;
  flight_time: string;
  landing_rate: number | null;
  flight_image_url: string | null;
  flight_number: string | null;
  pilot_role: string;
  etd: string | null;
  atd: string | null;
  eta: string | null;
  ata: string | null;
  flight_rules: string | null;
  flight_plan: string | null;
  departure_runway: string | null;
  arrival_runway: string | null;
  taxiways_used: string | null;
  gates_used_dep: string | null;
  gates_used_arr: string | null;
  departure_type: string | null;
  arrival_type: string | null;
  remarks: string | null;
  created_at: string;
  user_profile: {
    display_name: string;
    is_staff: boolean;
    vatsim_ivao_id: string | null;
  } | null;
}

// Helper to convert YYYYMMDDHHMM to YYYY-MM-DDTHH:MM for datetime-local input
const formatVatsimDateTime = (vatsimDateTime: string | undefined): string => {
  if (!vatsimDateTime || vatsimDateTime.length !== 12) return '';
  const year = vatsimDateTime.substring(0, 4);
  const month = vatsimDateTime.substring(4, 6);
  const day = vatsimDateTime.substring(6, 8);
  const hour = vatsimDateTime.substring(8, 10);
  const minute = vatsimDateTime.substring(10, 12);
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

// Helper to convert total minutes to HH:MM format
const formatMinutesToHHMM = (totalMinutes: number | undefined): string => {
  if (totalMinutes === undefined || totalMinutes < 0) return '';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const Logbook = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isStaff, setIsStaff] = useState(false);
  const [isLoggingVatsimFlight, setIsLoggingVatsimFlight] = useState(false);
  const [isLoggingSimbriefFlight, setIsLoggingSimbriefFlight] = useState(false); // New state
  const [simbriefUrl, setSimbriefUrl] = useState(''); // New state for SimBrief URL
  const [hasSavedFlight, setHasSavedFlight] = useState(false); // New state for saved flight

  useEffect(() => {
    fetchFlights();
    // Check for saved flight data in localStorage
    const savedFormData = localStorage.getItem('currentFlightForm');
    setHasSavedFlight(!!savedFormData);
  }, []);

  const fetchFlights = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('User not logged in.');
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_staff, vatsim_ivao_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching staff status:', profileError);
      showError('Error fetching user profile.');
      return;
    }

    setIsStaff(profileData?.is_staff || false);

    const selectString = "*,user_profile:profiles!flights_user_id_fkey(display_name,is_staff,vatsim_ivao_id)";
    console.log("Logbook - Select String:", selectString);
    let query = supabase
      .from('flights')
      .select(selectString)
      .order('created_at', { ascending: false });

    if (!profileData?.is_staff) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      showError('Error fetching flights: ' + error.message);
      console.error('Error fetching flights:', error);
    } else {
      setFlights(data as Flight[]);
    }
  };

  const handleLogVatsimFlight = async () => {
    setIsLoggingVatsimFlight(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('User not logged in.');
      setIsLoggingVatsimFlight(false);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('vatsim_ivao_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile for VATSIM check:', profileError);
      showError('Error fetching your VATSIM/IVAO ID. Please try again.');
      setIsLoggingVatsimFlight(false);
      return;
    }

    const currentVatsimId = profileData?.vatsim_ivao_id;
    console.log('Logbook.tsx: Current VATSIM/IVAO ID from fresh fetch:', currentVatsimId);

    if (!currentVatsimId) {
      showError('Please add your VATSIM/IVAO ID in Profile Settings to use this feature.');
      setIsLoggingVatsimFlight(false);
      return;
    }

    console.log('Logbook.tsx: Calling fetchVatsimPilotData with ID:', currentVatsimId);
    const vatsimData = await fetchVatsimPilotData(currentVatsimId);

    if (vatsimData && vatsimData.flight_plan) {
      console.log('VATSIM data successfully retrieved:', vatsimData);
      console.log('Raw Flight Plan details from VATSIM:', vatsimData.flight_plan);

      const formattedEtd = formatVatsimDateTime(vatsimData.flight_plan.planned_dep_time);
      const formattedEta = formatVatsimDateTime(vatsimData.flight_plan.planned_eta);
      const formattedFlightTime = formatMinutesToHHMM(vatsimData.flight_plan.planned_tasc);

      const dataToPass = {
        departureAirport: vatsimData.flight_plan.departure,
        arrivalAirport: vatsimData.flight_plan.arrival,
        aircraftType: vatsimData.flight_plan.aircraft_icao,
        flightNumber: vatsimData.callsign,
        flightPlan: vatsimData.flight_plan.route,
        etd: formattedEtd,
        eta: formattedEta,
        flightTime: formattedFlightTime,
      };
      console.log('Data prepared for LogFlight page:', dataToPass);
      navigate('/log-flight', { state: { initialFlightData: dataToPass } });
    } else {
      console.log('VATSIM data retrieval failed or no flight plan found. Specific error handled by fetchVatsimPilotData.');
    }
    setIsLoggingVatsimFlight(false);
  };

  const handleLogSimbriefFlight = async () => {
    setIsLoggingSimbriefFlight(true);
    if (!simbriefUrl) {
      showError('Please enter a SimBrief URL.');
      setIsLoggingSimbriefFlight(false);
      return;
    }

    console.log('Logbook.tsx: Calling fetchSimbriefData with URL:', simbriefUrl); // Added log
    const simbriefData = await fetchSimbriefData(simbriefUrl);

    if (simbriefData) {
      console.log('SimBrief data successfully retrieved:', simbriefData);
      // Find the full airline name from ALL_AIRLINES based on ICAO
      const airline = ALL_AIRLINES.find(a => a.name.toUpperCase().includes(simbriefData.airlineIcao))?.name || 'Icarion Virtual';

      const dataToPass = {
        departureAirport: simbriefData.departureAirport,
        arrivalAirport: simbriefData.arrivalAirport,
        aircraftType: simbriefData.aircraftType,
        flightNumber: simbriefData.flightNumber,
        flightPlan: simbriefData.flightPlan,
        etd: simbriefData.etd,
        eta: simbriefData.eta,
        aircraftRegistration: simbriefData.aircraftRegistration,
        airlineName: airline, // Pass the full airline name
      };
      console.log('Data prepared for LogFlight page from SimBrief:', dataToPass);
      navigate('/log-flight', { state: { initialFlightData: dataToPass } });
    } else {
      console.log('SimBrief data retrieval failed. Specific error handled by fetchSimbriefData.');
    }
    setIsLoggingSimbriefFlight(false);
  };

  const handleResumeFlight = () => {
    navigate('/log-flight');
  };

  return (
    <div className="container mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Flight Logbook</h1>

      <div className="mb-8 text-center space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Button onClick={handleLogVatsimFlight} className="px-6 py-3 text-lg w-full md:w-auto" disabled={isLoggingVatsimFlight}>
            {isLoggingVatsimFlight ? 'Checking VATSIM...' : 'Log Active VATSIM Flight'}
          </Button>
          {hasSavedFlight && (
            <Button onClick={handleResumeFlight} className="px-6 py-3 text-lg w-full md:w-auto" variant="secondary">
              Resume Saved Flight
            </Button>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-2 items-center mt-4">
          <Input
            type="url"
            placeholder="Paste SimBrief Dispatch URL here..."
            value={simbriefUrl}
            onChange={(e) => setSimbriefUrl(e.target.value)}
            className="flex-grow"
            disabled={isLoggingSimbriefFlight}
          />
          <Button onClick={handleLogSimbriefFlight} className="px-6 py-3 text-lg w-full md:w-auto" disabled={isLoggingSimbriefFlight}>
            {isLoggingSimbriefFlight ? 'Parsing SimBrief...' : 'Log SimBrief Flight'}
          </Button>
        </div>
      </div>

      {flights.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">No flights logged yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flights.map((flight) => (
            <Card key={flight.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">
                  {flight.departure_airport} to {flight.arrival_airport}
                </CardTitle>
                <CardDescription className="text-sm">
                  {flight.aircraft_type} - {flight.flight_time}
                </CardDescription>
                {isStaff && flight.user_profile?.display_name && (
                  <p className="text-xs text-muted-foreground">Pilot: {flight.user_profile.display_name}</p>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Logged on: {format(new Date(flight.created_at), 'PPP p')}
                </p>
                {flight.landing_rate !== null && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Landing Rate: {flight.landing_rate} fpm
                  </p>
                )}
                {flight.flight_image_url && (
                  <img src={flight.flight_image_url} alt="Flight" className="mt-4 rounded-md object-cover w-full h-48" />
                )}
              </CardContent>
              <div className="p-6 pt-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">View Details</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Flight Details: {flight.flight_number || 'N/A'}</DialogTitle>
                      <DialogDescription>
                        Detailed information about your flight from {flight.departure_airport} to {flight.arrival_airport}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                      <div className="col-span-2 font-semibold text-lg">Basic Info</div>
                      <div><span className="font-medium">Aircraft Type:</span> {flight.aircraft_type}</div>
                      <div><span className="font-medium">Flight Time:</span> {flight.flight_time}</div>
                      <div><span className="font-medium">Landing Rate:</span> {flight.landing_rate || 'N/A'} fpm</div>
                      <div><span className="font-medium">Pilot Role:</span> {flight.pilot_role}</div>
                      <div><span className="font-medium">Flight Rules:</span> {flight.flight_rules || 'N/A'}</div>
                      <div><span className="font-medium">Flight Number:</span> {flight.flight_number || 'N/A'}</div>

                      <div className="col-span-2 font-semibold text-lg mt-4">Timestamps</div>
                      <div><span className="font-medium">ETD:</span> {flight.etd ? format(new Date(flight.etd), 'PPP p') : 'N/A'}</div>
                      <div><span className="font-medium">ATD:</span> {flight.atd ? format(new Date(flight.atd), 'PPP p') : 'N/A'}</div>
                      <div><span className="font-medium">ETA:</span> {flight.eta ? format(new Date(flight.eta), 'PPP p') : 'N/A'}</div>
                      <div><span className="font-medium">ATA:</span> {flight.ata ? format(new Date(flight.ata), 'PPP p') : 'N/A'}</div>

                      <div className="col-span-2 font-semibold text-lg mt-4">Flight Plan & Remarks</div>
                      <div className="col-span-2"><span className="font-medium">Flight Plan:</span> <p className="whitespace-pre-wrap">{flight.flight_plan || 'N/A'}</p></div>
                      <div className="col-span-2"><span className="font-medium">Remarks:</span> <p className="whitespace-pre-wrap">{flight.remarks || 'N/A'}</p></div>

                      <div className="col-span-2 font-semibold text-lg mt-4">Airport Details</div>
                      <div><span className="font-medium">Departure Runway:</span> {flight.departure_runway || 'N/A'}</div>
                      <div><span className="font-medium">Arrival Runway:</span> {flight.arrival_runway || 'N/A'}</div>
                      <div><span className="font-medium">Taxiways Used:</span> {flight.taxiways_used || 'N/A'}</div>
                      <div><span className="font-medium">Departure Gate:</span> {flight.gates_used_dep || 'N/A'}</div>
                      <div><span className="font-medium">Arrival Gate:</span> {flight.gates_used_arr || 'N/A'}</div>
                      <div><span className="font-medium">Departure Type:</span> {flight.departure_type || 'N/A'}</div>
                      <div><span className="font-medium">Arrival Type:</span> {flight.arrival_type || 'N/A'}</div>

                      {flight.flight_image_url && (
                        <div className="col-span-2 mt-4">
                          <span className="font-medium">Flight Image:</span>
                          <img src={flight.flight_image_url} alt="Flight" className="mt-2 rounded-md object-cover w-full max-h-96" />
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Logbook;