import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface InitialFlightData {
  departureAirport?: string | null;
  arrivalAirport?: string | null;
  aircraftType?: string | null;
  flightNumber?: string | null;
  airlineName?: string | null;
  aircraftRegistration?: string | null;
  etd?: string | null;
  eta?: string | null;
  flightPlan?: string | null;
  flightTime?: string | null;
}

interface FlightFormState {
  departureAirport: string;
  arrivalAirport: string;
  selectedAircraftType: string;
  flightNumber: string;
  selectedAirline: string;
  selectedAircraftRegistration: string;
  pilotRole: string;
  etd: string;
  atd: string;
  eta: string;
  ata: string;
  flightRules: string;
  flightTime: string;
  flightPlan: string;
  departureRunway: string;
  arrivalRunway: string;
  taxiwaysUsed: string;
  gatesUsedDep: string;
  gatesUsedArr: string;
  departureType: string;
  arrivalType: string;
  landingRate: string;
  remarks: string;
  volantaTrackingLink: string;
}

const initialFormState: FlightFormState = {
  departureAirport: '',
  arrivalAirport: '',
  selectedAircraftType: '',
  flightNumber: '',
  selectedAirline: 'Icarion Virtual',
  selectedAircraftRegistration: '',
  pilotRole: 'PIC',
  etd: '',
  atd: '',
  eta: '',
  ata: '',
  flightRules: 'IFR',
  flightTime: '',
  flightPlan: '',
  departureRunway: '',
  arrivalRunway: '',
  taxiwaysUsed: '',
  gatesUsedDep: '',
  gatesUsedArr: '',
  departureType: 'Normal',
  arrivalType: 'Normal',
  landingRate: '',
  remarks: '',
  volantaTrackingLink: '',
};

export const useFlightForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialDataProcessedRef = useRef(false); // Ref to track if initial data has been processed

  const [formState, setFormState] = useState<FlightFormState>(initialFormState);
  const [flightImage, setFlightImage] = useState<File | null>(null);

  // Load data from localStorage and initialFlightData on mount
  useEffect(() => {
    console.log('useFlightForm: useEffect triggered.');
    console.log('useFlightForm: location.state at useEffect start:', location.state);
    const currentInitialFlightData = location.state?.initialFlightData as InitialFlightData | undefined;
    console.log('useFlightForm: currentInitialFlightData at useEffect start:', currentInitialFlightData);

    // Only apply initial data if it exists and hasn't been processed yet for this navigation
    if (currentInitialFlightData && !initialDataProcessedRef.current) {
      console.log('useFlightForm: Applying initialFlightData from location state.');
      const dataToApply: FlightFormState = {
        departureAirport: currentInitialFlightData.departureAirport || '',
        arrivalAirport: currentInitialFlightData.arrivalAirport || '',
        selectedAircraftType: currentInitialFlightData.aircraftType || '',
        flightNumber: currentInitialFlightData.flightNumber || '',
        selectedAirline: currentInitialFlightData.airlineName || 'Icarion Virtual',
        selectedAircraftRegistration: currentInitialFlightData.aircraftRegistration || '',
        etd: currentInitialFlightData.etd || '',
        eta: currentInitialFlightData.eta || '',
        flightPlan: currentInitialFlightData.flightPlan || '',
        flightTime: currentInitialFlightData.flightTime || '',
        
        // Ensure all other fields from initialFormState are also explicitly handled
        pilotRole: initialFormState.pilotRole,
        atd: initialFormState.atd,
        ata: initialFormState.ata,
        flightRules: initialFormState.flightRules,
        departureRunway: initialFormState.departureRunway,
        arrivalRunway: initialFormState.arrivalRunway,
        taxiwaysUsed: initialFormState.taxiwaysUsed,
        gatesUsedDep: initialFormState.gatesUsedDep,
        gatesUsedArr: initialFormState.gatesUsedArr,
        departureType: initialFormState.departureType,
        arrivalType: initialFormState.arrivalType,
        landingRate: initialFormState.landingRate,
        remarks: initialFormState.remarks,
        volantaTrackingLink: initialFormState.volantaTrackingLink,
      };
      setFormState(dataToApply);
      setFlightImage(null); // Image cannot be persisted via localStorage
      initialDataProcessedRef.current = true; // Mark as processed
    } else if (!currentInitialFlightData && !initialDataProcessedRef.current) { // If no initial data from navigation, load from localStorage
      const savedFormData = localStorage.getItem('currentFlightForm');
      if (savedFormData) {
        try {
          const loadedData = JSON.parse(savedFormData);
          console.log('useFlightForm: Loaded data from localStorage:', loadedData);
          // Merge loadedData with initialFormState to ensure all fields are present
          const mergedLoadedData: FlightFormState = { ...initialFormState, ...loadedData };
          setFormState(mergedLoadedData);
        } catch (e) {
          console.error("useFlightForm: Failed to parse saved form data from localStorage", e);
          localStorage.removeItem('currentFlightForm'); // Clear corrupted data
        }
      }
      initialDataProcessedRef.current = true; // Mark as processed even if no data
    }
    // Reset the ref if location.key changes, indicating a new navigation entry
    // This allows new initial data to be processed if the user navigates to /log-flight again with new state
    if (location.key !== initialDataProcessedRef.current) { // Using location.key as a simple way to detect new navigation
        initialDataProcessedRef.current = false;
    }

  }, [location.state, location.key]); // Dependencies: only location.state and location.key

  // Save data to localStorage whenever form fields change
  useEffect(() => {
    localStorage.setItem('currentFlightForm', JSON.stringify(formState));
  }, [formState]);

  const handleChange = useCallback((field: keyof FlightFormState, value: string) => {
    setFormState(prevState => ({ ...prevState, [field]: value }));
  }, []);

  const handleImageChange = useCallback((file: File | null) => {
    setFlightImage(file);
  }, []);

  const clearForm = useCallback(() => {
    setFormState(initialFormState);
    setFlightImage(null);
    localStorage.removeItem('currentFlightForm');
    // After clearing, also clear the navigation state to prevent re-populating if user navigates back
    navigate(location.pathname, { replace: true, state: {} });
  }, [navigate, location.pathname]);

  return {
    formState,
    flightImage,
    handleChange,
    handleImageChange,
    clearForm,
  };
};