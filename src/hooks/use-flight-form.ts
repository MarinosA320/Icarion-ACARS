import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface InitialFlightData {
  departureAirport?: string;
  arrivalAirport?: string;
  aircraftType?: string;
  flightNumber?: string;
  airlineName?: string;
  aircraftRegistration?: string;
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
  volantaTrackingLink: string; // New field
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
  volantaTrackingLink: '', // Initialize new field
};

export const useFlightForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialFlightData = location.state?.initialFlightData as InitialFlightData | undefined;
  const bookingId = location.state?.bookingId as string | undefined;

  const [formState, setFormState] = useState<FlightFormState>(initialFormState);
  const [flightImage, setFlightImage] = useState<File | null>(null);

  // Load data from localStorage and initialFlightData on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('currentFlightForm');
    let loadedData: Partial<FlightFormState> = {};
    if (savedFormData) {
      try {
        loadedData = JSON.parse(savedFormData);
      } catch (e) {
        console.error("Failed to parse saved form data from localStorage", e);
        localStorage.removeItem('currentFlightForm'); // Clear corrupted data
      }
    }

    // Merge with initialFlightData if present, giving initialFlightData precedence
    const dataToApply = { ...loadedData, ...initialFlightData };

    setFormState(prevState => ({
      ...prevState,
      departureAirport: dataToApply.departureAirport || prevState.departureAirport,
      arrivalAirport: dataToApply.arrivalAirport || prevState.arrivalAirport,
      selectedAircraftType: dataToApply.aircraftType || prevState.selectedAircraftType,
      flightNumber: dataToApply.flightNumber || prevState.flightNumber,
      selectedAirline: dataToApply.airlineName || prevState.selectedAirline,
      selectedAircraftRegistration: dataToApply.aircraftRegistration || prevState.selectedAircraftRegistration,
      etd: dataToApply.etd || prevState.etd,
      eta: dataToApply.eta || prevState.eta,
      flightPlan: dataToApply.flightPlan || prevState.flightPlan,
      flightTime: dataToApply.flightTime || prevState.flightTime,
      // Other fields from loadedData if they exist
      pilotRole: loadedData.pilotRole || prevState.pilotRole,
      atd: loadedData.atd || prevState.atd,
      ata: loadedData.ata || prevState.ata,
      flightRules: loadedData.flightRules || prevState.flightRules,
      departureRunway: loadedData.departureRunway || prevState.departureRunway,
      arrivalRunway: loadedData.arrivalRunway || prevState.arrivalRunway,
      taxiwaysUsed: loadedData.taxiwaysUsed || prevState.taxiwaysUsed,
      gatesUsedDep: loadedData.gatesUsedDep || prevState.gatesUsedDep,
      gatesUsedArr: loadedData.gatesUsedArr || prevState.gatesUsedArr,
      departureType: loadedData.departureType || prevState.departureType,
      arrivalType: loadedData.arrivalType || prevState.arrivalType,
      landingRate: loadedData.landingRate || prevState.landingRate,
      remarks: loadedData.remarks || prevState.remarks,
      volantaTrackingLink: loadedData.volantaTrackingLink || prevState.volantaTrackingLink, // Load new field
    }));
    setFlightImage(null); // Image cannot be persisted via localStorage

    // Clear initialFlightData from location state after use to prevent re-applying on subsequent renders
    if (initialFlightData || bookingId) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [navigate, location.pathname, location.state, initialFlightData, bookingId]);

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
    bookingId,
    handleChange,
    handleImageChange,
    clearForm,
  };
};