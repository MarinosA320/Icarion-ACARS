import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { fetchProfilesData } from '@/utils/supabaseDataFetch'; // Import fetchProfilesData

interface FlightBooking {
  id: string;
  user_id: string;
  departure_airport: string;
  arrival_airport: string;
  aircraft_type: string;
  aircraft_registration: string;
  flight_number: string | null;
  airline_name: string;
  etd: string | null;
  eta: string | null;
  status: string;
  created_at: string;
  user_profile: {
    display_name: string | null;
    email: string | null;
  } | null;
}

export const useFlightBookingsManagement = () => {
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);

  const fetchAllFlightBookings = useCallback(async () => {
    // Fetch flight bookings without direct profile join
    const { data, error } = await supabase
      .from('flight_bookings')
      .select('id,user_id,departure_airport,arrival_airport,aircraft_type,aircraft_registration,flight_number,airline_name,etd,eta,status,created_at');

    if (error) {
      showError('Error fetching all flight bookings: ' + error.message);
      console.error('Error fetching all flight bookings:', error);
      return;
    }

    const allBookingUserIds = new Set<string>();
    data.forEach(booking => allBookingUserIds.add(booking.user_id));

    const profilesMap = await fetchProfilesData(Array.from(allBookingUserIds));

    const bookingsWithProfiles = data.map(booking => ({
      ...booking,
      user_profile: profilesMap[booking.user_id] || null,
    }));
    setFlightBookings(bookingsWithProfiles as FlightBooking[]);
  }, []);

  const handleBookingStatusUpdate = useCallback(async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('flight_bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (error) {
      showError('Error updating booking status: ' + error.message);
    } else {
      showSuccess('Flight booking status updated!');
      fetchAllFlightBookings();
    }
  }, [fetchAllFlightBookings]);

  const handleDeleteBooking = useCallback(async (bookingId: string) => {
    const { error } = await supabase
      .from('flight_bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      showError('Error deleting flight booking: ' + error.message);
    } else {
      showSuccess('Flight booking deleted successfully!');
      fetchAllFlightBookings();
    }
  }, [fetchAllFlightBookings]);

  return {
    flightBookings,
    fetchAllFlightBookings,
    handleBookingStatusUpdate,
    handleDeleteBooking,
  };
};