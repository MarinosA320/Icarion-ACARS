import { showError } from './toast';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

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
  // Other fields from VATSIM data.json
}

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
      showError(`Failed to fetch VATSIM data: ${error.message}`);
      return null;
    }

    if (data) {
      console.log('Successfully received VATSIM data from Edge Function:', data);
      return data as VatsimPilotData;
    }

    return null; // Should not happen if data is not null and no error
  } catch (error: any) {
    console.error('Network or unexpected error invoking Edge Function:', error);
    showError('Failed to fetch VATSIM flight data. Please check your internet connection or try again later.');
    return null;
  }
}