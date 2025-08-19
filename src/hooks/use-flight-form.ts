import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast'; // Import toast utilities

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
  flightPathGeoJSON?: any | null; // Added for GeoJSON
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
  flightPathGeoJSON: any | null; // Added for GeoJSON
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
  flightPathGeoJSON: null, // Initialize as null
};

export const useFlightForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Use a ref to track if initial data has been processed for the current location.key
  // This ref will store the location.key that was last processed.
  const lastProcessedLocationKeyRef = useRef<string | null>(null); 

  const [formState, setFormState] = useState<FlightFormState>(initialFormState);
  const [flightImage, setFlightImage] = useState<File | null>(null);

  // Effect to load initial data from location.state or localStorage
  useEffect(() => {
    console.log('useFlightForm: useEffect triggered for location.state changes.');
    console.log('useFlightForm: Current location.key:', location.key);
    console.log('useFlightForm: Last processed location.key:', lastProcessedLocationKeyRef.current);

    // Only process if the location.key has changed since last time,
    // or if it's the very first render (lastProcessedLocationKeyRef.current is null)
    if (location.key !== lastProcessedLocationKeyRef.current) {
      const currentInitialFlightData = location.state?.initialFlightData as InitialFlightData | undefined;
      console.log('useFlightForm: currentInitialFlightData from location state:', currentInitialFlightData);

      if (currentInitialFlightData) {
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
          flightPathGeoJSON: currentInitialFlightData.flightPathGeoJSON || null, // Apply GeoJSON

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
        lastProcessedLocationKeyRef.current = location.key; // Mark this key as processed
      } else { // No initial data from navigation, try localStorage
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
        lastProcessedLocationKeyRef.current = location.key; // Mark this key as processed even if no data was loaded
      }
    }
  }, [location.state, location.key]); // Dependencies: location.state and location.key

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

  const handleGeoJsonFileChange = useCallback((file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          // Validate if it's valid JSON before setting
          JSON.parse(content); // This will throw if invalid
          setFormState(prevState => ({ ...prevState, flightPathGeoJSON: content }));
          showSuccess('GeoJSON file loaded successfully!');
        } catch (error) {
          showError('Invalid GeoJSON file. Please upload a valid JSON file.');
          setFormState(prevState => ({ ...prevState, flightPathGeoJSON: null })); // Clear invalid data
          console.error('Error reading or parsing GeoJSON file:', error);
        }
      };
      reader.readAsText(file);
    } else {
      setFormState(prevState => ({ ...prevState, flightPathGeoJSON: null }));
    }
  }, []);

  const clearForm = useCallback(() => {
    setFormState(initialFormState);
    setFlightImage(null);
    localStorage.removeItem('currentFlightForm');
    // When clearing the form, also reset the lastProcessedLocationKeyRef
    // so that if the user navigates back to /log-flight, it can re-process initial data if any.
    lastProcessedLocationKeyRef.current = null; 
    navigate(location.pathname, { replace: true, state: {} });
  }, [navigate, location.pathname]);

  return {
    formState,
    flightImage,
    handleChange,
    handleImageChange,
    handleGeoJsonFileChange,
    clearForm,
  };
};