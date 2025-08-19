import { showError } from './toast';
import { supabase } from '@/integrations/supabase/client';

interface VatsimPilotData {
  cid: string;
  callsign: string;
  flight_plan?: {
    aircraft_icao: string;
    departure: string;
    arrival: string;
    route: string;
    planned_dep_time?: string; // YYYYMMDDHHMM
    planned_eta?: string;      // YYYYMMDDHHMM
    planned_tasc?: number;     // Total estimated enroute time in minutes
  };
}

interface SimbriefFlightData {
  departureAirport: string;
  arrivalAirport: string;
  aircraftType: string;
  flightNumber: string;
  flightPlan: string;
  etd: string;
  eta: string;
  aircraftRegistration: string;
  airlineIcao: string;
}

interface VolantaFlightData {
  departureAirport: string;
  arrivalAirport: string;
  aircraftType: string;
  flightNumber: string;
  flightPlan: string;
  etd: string;
  eta: string;
  flightTime: string;
  landingRate: string;
  remarks: string;
  volantaTrackingLink: string;
  flightPathGeoJSON: any | null;
  airlineIcao: string;
}

/**
 * Helper to extract specific error message from Supabase Edge Function error response.
 * Supabase `invoke` error.message often contains the raw JSON response from the Edge Function.
 */
export const getEdgeFunctionErrorMessage = (error: any, defaultMessage: string): string => {
  let errorMessage = defaultMessage;

  if (error) {
    // Prioritize error.details as it often contains the actual response body from the edge function
    if (error.details) {
      try {
        const parsedDetails = JSON.parse(error.details);
        if (parsedDetails && typeof parsedDetails === 'object' && 'error' in parsedDetails) {
          return parsedDetails.error; // Found specific error from Edge Function
        }
      } catch (parseError) {
        // If details is not JSON, or doesn't contain an 'error' field, fall through
        errorMessage = error.details; // Use raw details as message
      }
    }
    // Fallback to error.message if details didn't yield a specific error
    if (error.message && errorMessage === defaultMessage) { // Only use error.message if details didn't provide a better one
      try {
        const parsedMessage = JSON.parse(error.message);
        if (parsedMessage && typeof parsedMessage === 'object' && 'error' in parsedMessage) {
          return parsedMessage.error;
        }
      } catch (parseError) {
        // If message is not JSON, use it as is
        errorMessage = error.message;
      }
    }
  }
  return errorMessage;
};

/**
 * Fetches active VATSIM pilot data for a given CID using a Supabase Edge Function.
 * @param cid The VATSIM CID of the pilot.
 * @returns VatsimPilotData if an active flight is found, otherwise null.
 */
export async function fetchVatsimPilotData(cid: string): Promise<VatsimPilotData | null> {
  console.log(`Attempting to fetch VATSIM data for CID: ${cid} via Edge Function.`);
  try {
    const { data, error } = await supabase.functions.invoke('fetch-vatsim-data', {
      body: { cid },
    });

    if (error) {
      console.error('Error invoking fetch-vatsim-data Edge Function:', error);
      const userFacingMessage = getEdgeFunctionErrorMessage(error, 'Failed to fetch VATSIM data.');
      showError(userFacingMessage);
      return null;
    }

    if (data) {
      console.log('Successfully received VATSIM data from Edge Function:', data);
      return data as VatsimPilotData;
    }

    return null;
  } catch (error: any) {
    console.error('Network or unexpected error invoking Edge Function:', error);
    showError('Failed to fetch VATSIM flight data. Please check your internet connection or try again later.');
    return null;
  }
}

/**
 * Fetches SimBrief flight data by parsing a SimBrief URL using a Supabase Edge Function.
 * @param simbriefUrl The full SimBrief dispatch URL.
 * @returns SimbriefFlightData if data is successfully parsed, otherwise null.
 */
export async function fetchSimbriefData(simbriefUrl: string): Promise<SimbriefFlightData | null> {
  console.log(`Attempting to fetch SimBrief data from URL: ${simbriefUrl} via Edge Function.`);
  try {
    const { data, error } = await supabase.functions.invoke('fetch-simbrief-data', {
      body: { simbriefUrl },
    });

    if (error) {
      console.error('Error invoking fetch-simbrief-data Edge Function:', error);
      const userFacingMessage = getEdgeFunctionErrorMessage(error, 'Failed to parse SimBrief URL or fetch data.');
      showError(userFacingMessage);
      return null;
    }

    if (data) {
      console.log('Successfully received SimBrief data from Edge Function:', data);
      return data as SimbriefFlightData;
    }

    return null;
  } catch (error: any) {
    console.error('Network or unexpected error invoking SimBrief Edge Function:', error);
    showError('Failed to fetch SimBrief data. Please check your internet connection or try again later.');
    return null;
  }
}

/**
 * Fetches Volanta flight data by parsing a Volanta share URL using a Supabase Edge Function.
 * @param volantaUrl The full Volanta flight share URL.
 * @returns VolantaFlightData if data is successfully parsed, otherwise null.
 */
export async function fetchVolantaData(volantaUrl: string): Promise<VolantaFlightData | null> {
  console.log(`Attempting to fetch Volanta data from URL: ${volantaUrl} via Edge Function.`);
  try {
    const { data, error } = await supabase.functions.invoke('fetch-volanta-data', {
      body: { volantaUrl },
    });

    if (error) {
      console.error('Error invoking fetch-volanta-data Edge Function:', error);
      const userFacingMessage = getEdgeFunctionErrorMessage(error, 'Failed to fetch Volanta data.');
      showError(userFacingMessage);
      return null;
    }

    if (data) {
      console.log('Successfully received Volanta data from Edge Function:', data);
      return data as VolantaFlightData;
    }

    return null;
  } catch (error: any) {
    console.error('Network or unexpected error invoking Volanta Edge Function:', error);
    showError('Failed to fetch Volanta data. Please check your internet connection or try again later.');
    return null;
  }
}