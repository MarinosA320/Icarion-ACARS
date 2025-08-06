import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { fetchEmailsForUserIds } from '@/utils/supabaseDataFetch';

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
    display_name: string;
    is_staff: boolean;
    email: string | null;
    vatsim_ivao_id: string | null;
  } | null;
}

export const useFlightsManagement = () => {
  const [flights, setFlights] = useState<Flight[]>([]);

  const fetchAllFlights = useCallback(async () => {
    const { data, error } = await supabase
      .from('flights')
      .select("*,user_profile:profiles(display_name,is_staff,vatsim_ivao_id)");

    if (error) {
      showError('Error fetching all flights: ' + error.message);
      console.error('Error fetching all flights:', error);
      return;
    }

    const allFlightUserIds = new Set<string>();
    data.forEach(flight => allFlightUserIds.add(flight.user_id));

    const userEmails = await fetchEmailsForUserIds(Array.from(allFlightUserIds));

    const flightsWithProfiles = data.map(flight => ({
      ...flight,
      user_profile: flight.user_profile ? {
        ...flight.user_profile,
        email: userEmails[flight.user_id] || null,
      } : null,
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