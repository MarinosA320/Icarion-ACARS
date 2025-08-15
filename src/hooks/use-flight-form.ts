import { useState, useEffect, useCallback } from 'react';
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
  const initialFlightData = location.state?.initialFlightData as InitialFlightData | undefined;

  const [formState, setFormState] = useState<FlightFormState>(initialFormState);
  const [flightImage, setFlightImage] = useState<File | null>(null);

  // Load data from localStorage and initialFlightData on mount
  useEffect(() => {
    console.log('useFlightForm: useEffect triggered.');
    const savedFormData = localStorage.getItem('currentFlightForm');
    let loadedData: Partial<FlightFormState> = {};
    if (savedFormData) {
      try {
        loadedData = JSON.parse(savedFormData);
        console.log('useFlightForm: Loaded data from localStorage:', loadedData);
      } catch (e) {
        console.error("useFlightForm: Failed to parse saved form data from localStorage", e);
        localStorage.removeItem('currentFlightForm'); // Clear corrupted data
      }
    }

    console.log('useFlightForm: Initial flight data from location state:', initialFlightData);

    // Merge with initialFlightData if present, giving initialFlightData precedence
    // Ensure all values are explicitly strings to prevent issues with input components
    const dataToApply: FlightFormState = {
      departureAirport: initialFlightData?.departureAirport || loadedData.departureAirport || '',
      arrivalAirport: initialFlightData?.arrivalAirport || loadedData.arrivalAirport || '',
      selectedAircraftType: initialFlightData?.aircraftType || loadedData.selectedAircraftType || '',
      flightNumber: initialFlightData?.flightNumber || loadedData.flightNumber || '',
      selectedAirline: initialFlightData?.airlineName || loadedData.selectedAirline || 'Icarion Virtual',
      selectedAircraftRegistration: initialFlightData?.aircraftRegistration || loadedData.selectedAircraftRegistration || '',
      etd: initialFlightData?.etd || loadedData.etd || '',
      eta: initialFlightData?.eta || loadedData.eta || '',
      flightPlan: initialFlightData?.flightPlan || loadedData.flightPlan || '',
      flightTime: initialFlightData?.flightTime || loadedData.flightTime || '',
      
      // Ensure all other fields from initialFormState are also explicitly handled
      pilotRole: loadedData.pilotRole || initialFormState.pilotRole,
      atd: loadedData.atd || initialFormState.atd,
      ata: loadedData.ata || initialFormState.ata,
      flightRules: loadedData.flightRules || initialFormState.flightRules,
      departureRunway: loadedData.departureRunway || initialFormState.departureRunway,
      arrivalRunway: loadedData.arrivalRunway || initialFormState.arrivalRunway,
      taxiwaysUsed: loadedData.taxiwaysUsed || initialFormState.taxiwaysUsed,
      gatesUsedDep: loadedData.gatesUsedDep || initialFormState.gatesUsedDep,
      gatesUsedArr: loadedData.gatesUsedArr || initialFormState.gatesUsedArr,
      departureType: loadedData.departureType || initialFormState.departureType,
      arrivalType: loadedData.arrivalType || initialFormState.arrivalType,
      landingRate: loadedData.landingRate || initialFormState.landingRate,
      remarks: loadedData.remarks || initialFormState.remarks,
      volantaTrackingLink: loadedData.volantaTrackingLink || initialFormState.volantaTrackingLink,
    };

    console.log('useFlightForm: Final merged data to apply to formState:', dataToApply);

    setFormState(dataToApply);
    setFlightImage(null); // Image cannot be persisted via localStorage

    // Clear initialFlightData from location state after use to prevent re-applying on subsequent renders
    if (initialFlightData) {
      console.log('useFlightForm: Clearing initialFlightData from location state.');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [navigate, location.pathname, location.state, initialFlightData]);

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
  }, []);

  return {
    formState,
    flightImage,
    handleChange,
    handleImageChange,
    clearForm,
  };
};