import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { fetchVatsimPilotData, fetchSimbriefData, fetchVolantaData } from '@/utils/flightDataFetch';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { ALL_AIRLINES } from '@/utils/aircraftData';
import { fetchProfilesData } from '@/utils/supabaseDataFetch';
import { Skeleton } from '@/components/ui/skeleton';
import LogbookFlightPage from '@/components/LogbookFlightPage';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import DynamicBackground from '@/components/DynamicBackground';

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
  user_id: string;
  user_profile: {
    display_name: string | null;
    is_staff: boolean | null;
    vatsim_ivao_id: string | null;
    rank: string | null;
  } | null;
  volanta_tracking_link: string | null;
  flight_path_geojson: any | null;
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

const logbookBackgroundImages = [
  '/images/backgrounds/1.png',
  '/images/backgrounds/2.png',
  '/images/backgrounds/3.png',
];

const Logbook = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isStaff, setIsStaff] = useState(false);
  const [isLoggingVatsimFlight, setIsLoggingVatsimFlight] = useState(false);
  const [isLoggingSimbriefFlight, setIsLoggingSimbriefFlight] = useState(false);
  const [isLoggingVolantaFlight, setIsLoggingVolantaFlight] = useState(false);
  const [simbriefUrl, setSimbriefUrl] = useState('');
  const [volantaUrl, setVolantaUrl] = useState('');
  const [hasSavedFlight, setHasSavedFlight] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showImportUrlSection, setShowImportUrlSection] = useState(false); // New state for combined import section

  useEffect(() => {
    fetchFlights();
    const savedFormData = localStorage.getItem('currentFlightForm');
    setHasSavedFlight(!!savedFormData);
  }, []);

  const fetchFlights = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('Logbook: User not logged in, cannot fetch flights.');
      showError('User not logged in.');
      setLoading(false);
      return;
    }

    console.log('Logbook: Fetching flights for user ID:', user.id);

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_staff, vatsim_ivao_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Logbook: Error fetching user profile for VATSIM check:', profileError);
      showError('Error fetching user profile.');
      setIsStaff(false);
    } else {
      setIsStaff(profileData?.is_staff || false);
      console.log('Logbook: User staff status:', profileData?.is_staff);
    }

    const { data, error } = await supabase
      .from('flights')
      .select('id,user_id,departure_airport,arrival_airport,aircraft_type,flight_time,landing_rate,flight_image_url,flight_number,pilot_role,etd,atd,eta,ata,flight_rules,flight_plan,departure_runway,arrival_runway,taxiways_used,gates_used_dep,gates_used_arr,departure_type,arrival_type,remarks,created_at,volanta_tracking_link,flight_path_geojson')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching flights: ' + error.message);
      console.error('Logbook: Error fetching flights:', error);
    } else {
      console.log('Logbook: Successfully fetched raw flight data:', data);
      const allUserIds = new Set<string>();
      data.forEach(flight => allUserIds.add(flight.user_id));

      const profilesMap = await fetchProfilesData(Array.from(allUserIds));

      const flightsWithProfiles = data.map(flight => ({
        ...flight,
        user_profile: profilesMap[flight.user_id] || null,
      }));

      setFlights(flightsWithProfiles as Flight[]);
      setCurrentPage(0);
      console.log('Logbook: Flights set in state:', flightsWithProfiles);
    }
    setLoading(false);
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
      console.log('Logbook.tsx: Data prepared for LogFlight page (VATSIM):', dataToPass);
      try {
        navigate('/log-flight', { state: { initialFlightData: dataToPass } });
      } catch (navError) {
        console.error('Logbook.tsx: Error during navigation after VATSIM data:', navError);
        showError('An error occurred while preparing the flight form. Please try again.');
      }
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

    console.log('Logbook.tsx: Attempting to fetch SimBrief data for URL:', simbriefUrl);
    try {
      const simbriefData = await fetchSimbriefData(simbriefUrl);
      console.log('Logbook.tsx: SimBrief data received:', simbriefData);

      if (simbriefData) {
        console.log('Logbook.tsx: SimBrief data successfully retrieved:', simbriefData);
        const airline = ALL_AIRLINES.find(a => a.icao_code === simbriefData.airlineIcao.toUpperCase())?.name || 'Icarion Virtual';

        const dataToPass = {
          departureAirport: simbriefData.departureAirport,
          arrivalAirport: simbriefData.arrivalAirport,
          aircraftType: simbriefData.aircraftType,
          flightNumber: simbriefData.flightNumber,
          flightPlan: simbriefData.flightPlan,
          etd: simbriefData.etd,
          eta: simbriefData.eta,
          aircraftRegistration: simbriefData.aircraftRegistration,
          airlineName: airline,
        };
        console.log('Logbook.tsx: Data prepared for LogFlight page (SimBrief):', dataToPass);
        try {
          navigate('/log-flight', { state: { initialFlightData: dataToPass } });
        } catch (navError) {
          console.error('Logbook.tsx: Error during navigation after SimBrief data:', navError);
          showError('An error occurred while preparing the flight form. Please try again.');
        }
      } else {
        console.log('Logbook.tsx: SimBrief data retrieval failed or was empty. Error handled by fetchSimbriefData.');
      }
    } catch (error) {
      console.error('Logbook.tsx: Error during SimBrief data fetching or processing:', error);
      showError('An unexpected error occurred while processing SimBrief data.');
    } finally {
      setIsLoggingSimbriefFlight(false);
    }
  };

  const handleLogVolantaFlight = async () => {
    setIsLoggingVolantaFlight(true);
    if (!volantaUrl) {
      showError('Please enter a Volanta URL.');
      setIsLoggingVolantaFlight(false);
      return;
    }

    console.log('Logbook.tsx: Attempting to fetch Volanta data for URL:', volantaUrl);
    try {
      const volantaData = await fetchVolantaData(volantaUrl);
      console.log('Logbook.tsx: Volanta data received:', volantaData);

      if (volantaData) {
        console.log('Logbook.tsx: Volanta data successfully retrieved:', volantaData);
        const airline = ALL_AIRLINES.find(a => a.icao_code === volantaData.airlineIcao.toUpperCase())?.name || 'Icarion Virtual';

        const dataToPass = {
          departureAirport: volantaData.departureAirport,
          arrivalAirport: volantaData.arrivalAirport,
          aircraftType: volantaData.aircraftType,
          flightNumber: volantaData.flightNumber,
          flightPlan: volantaData.flightPlan,
          etd: volantaData.etd,
          eta: volantaData.eta,
          flightTime: volantaData.flightTime,
          landingRate: volantaData.landingRate,
          remarks: volantaData.remarks,
          volantaTrackingLink: volantaData.volantaTrackingLink,
          flightPathGeoJSON: volantaData.flightPathGeoJSON,
          airlineName: airline,
        };
        console.log('Logbook.tsx: Data prepared for LogFlight page (Volanta):', dataToPass);
        try {
          navigate('/log-flight', { state: { initialFlightData: dataToPass } });
        } catch (navError) {
          console.error('Logbook.tsx: Error during navigation after Volanta data:', navError);
          showError('An error occurred while preparing the flight form. Please try again.');
        }
      } else {
        console.log('Logbook.tsx: Volanta data retrieval failed or was empty. Error handled by fetchVolantaData.');
      }
    } catch (error) {
      console.error('Logbook.tsx: Error during Volanta data fetching or processing:', error);
      showError('An unexpected error occurred while processing Volanta data.');
    } finally {
      setIsLoggingVolantaFlight(false);
    }
  };

  const handleResumeFlight = () => {
    navigate('/log-flight');
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(flights.length - 1, prev + 1));
  };

  const renderSkeletons = () => (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto h-[700px] bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
      <Skeleton className="h-10 w-3/4 mb-6" />
      <Skeleton className="h-6 w-1/2 mb-4" />
      <Skeleton className="h-48 w-full rounded-md mb-6" />
      <div className="grid grid-cols-2 gap-4 w-full">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-20 w-full mt-6" />
      <div className="flex justify-between w-full mt-8">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );

  console.log('Logbook component rendering. Loading state:', loading);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Dynamic Background fixed to viewport */}
      <DynamicBackground images={logbookBackgroundImages} interval={10000} />
      {/* Darker overlay on top of the image for better text contrast and depth */}
      <div className="fixed inset-0 bg-black opacity-30 z-0"></div>
      
      {/* Content container, scrollable */}
      <div className="relative z-10 w-full max-w-5xl mx-auto text-white flex-grow flex flex-col items-center justify-start p-4 pt-24 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Flight Logbook</h1>

        <div className="mb-8 text-center space-y-4 w-full">
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button onClick={handleLogVatsimFlight} className="px-6 py-3 text-lg w-full md:w-auto" disabled={isLoggingVatsimFlight}>
              {isLoggingVatsimFlight ? 'Checking VATSIM...' : 'Log Active VATSIM Flight'}
            </Button>
            <Button onClick={() => setShowImportUrlSection(true)} className="px-6 py-3 text-lg w-full md:w-auto" disabled={showImportUrlSection}>
              Import Flight from URL
            </Button>
            {hasSavedFlight && (
              <Button onClick={handleResumeFlight} className="px-6 py-3 text-lg w-full md:w-auto" variant="secondary">
                Resume Saved Flight
              </Button>
            )}
          </div>
          {showImportUrlSection && (
            <div className="flex flex-col gap-4 items-center mt-4 p-4 border rounded-md bg-white/10 dark:bg-gray-700/50">
              <div className="w-full space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import from SimBrief</h3>
                <div className="flex flex-col md:flex-row gap-2 items-center">
                  <Input
                    type="url"
                    placeholder="Paste SimBrief Dispatch URL here..."
                    value={simbriefUrl}
                    onChange={(e) => setSimbriefUrl(e.target.value)}
                    className="flex-grow"
                    disabled={isLoggingSimbriefFlight}
                  />
                  <Button onClick={handleLogSimbriefFlight} className="px-6 py-3 text-lg w-full md:w-auto" disabled={isLoggingSimbriefFlight}>
                    {isLoggingSimbriefFlight ? 'Parsing SimBrief...' : 'Import SimBrief'}
                  </Button>
                </div>
              </div>
              <div className="w-full space-y-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import from Volanta</h3>
                <div className="flex flex-col md:flex-row gap-2 items-center">
                  <Input
                    type="url"
                    placeholder="Paste Volanta Flight Share URL here..."
                    value={volantaUrl}
                    onChange={(e) => setVolantaUrl(e.target.value)}
                    className="flex-grow"
                    disabled={isLoggingVolantaFlight}
                  />
                  <Button onClick={handleLogVolantaFlight} className="px-6 py-3 text-lg w-full md:w-auto" disabled={isLoggingVolantaFlight}>
                    {isLoggingVolantaFlight ? 'Fetching Volanta...' : 'Import Volanta'}
                  </Button>
                </div>
              </div>
              <Button onClick={() => { setShowImportUrlSection(false); setSimbriefUrl(''); setVolantaUrl(''); }} variant="outline" className="px-6 py-3 text-lg w-full md:w-auto mt-4">
                Cancel
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          renderSkeletons()
        ) : flights.length === 0 ? (
          <div className="relative w-full max-w-3xl mx-auto bg-white/50 dark:bg-gray-800/50 border-l-8 border-icarion-blue-dark shadow-2xl rounded-lg p-8 min-h-[600px] flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold text-icarion-blue-DEFAULT dark:text-icarion-gold-DEFAULT mb-4">Your Pilot Logbook</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">No flights logged yet. Start your aviation journey!</p>
            <p className="text-sm text-muted-foreground mt-2">Use the buttons above to log your first flight.</p>
          </div>
        ) : (
          <div className="relative w-full max-w-3xl mx-auto bg-white/50 dark:bg-gray-800/50 border-l-8 border-icarion-blue-dark shadow-2xl rounded-lg p-8 min-h-[600px] flex flex-col">
            <TransitionGroup className="relative flex-grow overflow-hidden">
              <CSSTransition
                key={currentPage}
                timeout={300}
                classNames="page-slide"
              >
                <div className="absolute inset-0">
                  {flights[currentPage] && (
                    <LogbookFlightPage flight={flights[currentPage]} isStaff={isStaff} />
                  )}
                </div>
              </CSSTransition>
            </TransitionGroup>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={handlePreviousPage} disabled={currentPage === 0}>
                Previous Flight
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Flight {currentPage + 1} of {flights.length}
              </span>
              <Button onClick={handleNextPage} disabled={currentPage === flights.length - 1}>
                Next Flight
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logbook;