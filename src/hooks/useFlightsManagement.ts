import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { fetchProfilesData } from '@/utils/supabaseDataFetch'; // Import fetchProfilesData

interface Flight {
  id: string;
  user_id: string;
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
    display_name: string | null;
    is_staff: boolean | null;
    email: string | null;
    vatsim_ivao_id: string | null;
  } | null;
}

export const useFlightsManagement = () => {
  const [flights, setFlights] = useState<Flight[]>([]);

  const fetchAllFlights = useCallback(async () => {
    // Fetch flights without direct profile join
    const { data, error } = await supabase
      .from('flights')
      .select('id,user_id,departure_airport,arrival_airport,aircraft_type,flight_time,landing_rate,flight_image_url,flight_number,pilot_role,etd,atd,eta,ata,flight_rules,flight_plan,departure_runway,arrival_runway,taxiways_used,gates_used_dep,gates_used_arr,departure_type,arrival_type,remarks,created_at');

    if (error) {
      showError('Error fetching all flights: ' + error.message);
      console.error('Error fetching all flights:', error);
      return;
    }

    const allFlightUserIds = new Set<string>();
    data.forEach(flight => allFlightUserIds.add(flight.user_id));

    const profilesMap = await fetchProfilesData(Array.from(allFlightUserIds));

    const flightsWithProfiles = data.map(flight => ({
      ...flight,
      user_profile: profilesMap[flight.user_id] || null,
    }));
    setFlights(flightsWithProfiles as Flight[]);
  }, []);

  const handleDeleteFlight = useCallback(async (flightId: string, flightImageUrl: string | null) => {
    if (flightImageUrl) {
      const url = new URL(flightImageUrl);
      const pathSegments = url.pathname.split('/');
      const publicIndex = pathSegments.indexOf('public');
      const bucketName = pathSegments[publicIndex + 1];
      const filePathInStorage = pathSegments.slice(publicIndex + 2).join('/');

      const { error: storageError } = await supabase.storage
        .from('flight-images')
        .remove([filePathInStorage]);

      if (storageError) {
        showError('Error deleting flight image from storage: ' + storageError.message);
        return;
      }
    }

    const { error: dbError } = await supabase
      .from('flights')
      .delete()
      .eq('id', flightId);

    if (dbError) {
      showError('Error deleting flight record: ' + dbError.message);
    } else {
      showSuccess('Flight record deleted successfully!');
      fetchAllFlights();
    }
  }, [fetchAllFlights]);

  return {
    flights,
    fetchAllFlights,
    handleDeleteFlight,
  };
};