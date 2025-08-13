import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

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
  // Removed user_profile as it's not fetched by this component
}

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<FlightBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('User not logged in.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('flight_bookings')
      .select('*') // No need to join profiles here, as it's the current user's bookings
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching bookings: ' + error.message);
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data as FlightBooking[]);
    }
    setLoading(false);
  };

  const handleFlyNow = (booking: FlightBooking) => {
    const initialFlightData = {
      departureAirport: booking.departure_airport,
      arrivalAirport: booking.arrival_airport,
      airlineName: booking.airline_name,
      aircraftType: booking.aircraft_type,
      aircraftRegistration: booking.aircraft_registration,
      flightNumber: booking.flight_number || '',
      etd: booking.etd,
      eta: booking.eta,
    };
    navigate('/log-flight', { state: { initialFlightData, bookingId: booking.id } });
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const { error } = await supabase
        .from('flight_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) {
        showError('Error cancelling booking: ' + error.message);
      } else {
        showSuccess('Booking cancelled successfully!');
        fetchBookings(); // Refresh bookings
      }
    }
  };

  const renderSkeletons = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <Card key={index} className="flex flex-col shadow-md rounded-lg">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="flex-grow space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
        <div className="p-6 pt-0 flex gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    ))
  );

  return (
    <div className="container mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">My Bookings</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSkeletons()}
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">You have no active flight bookings. Go to "Plan Flight" to create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="flex flex-col shadow-md rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg">
                  {booking.departure_airport} to {booking.arrival_airport}
                </CardTitle>
                <CardDescription className="text-sm">
                  {booking.airline_name} - {booking.aircraft_type} ({booking.aircraft_registration})
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Flight Number: {booking.flight_number || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  ETD: {booking.etd ? format(new Date(booking.etd), 'PPP p') : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  ETA: {booking.eta ? format(new Date(booking.eta), 'PPP p') : 'N/A'}
                </p>
                <p className={`text-sm font-semibold ${booking.status === 'booked' ? 'text-blue-500' : booking.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>
                  Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </p>
              </CardContent>
              <div className="p-6 pt-0 flex gap-2">
                {booking.status === 'booked' && (
                  <>
                    <Button onClick={() => handleFlyNow(booking)} className="flex-1">Fly Now</Button>
                    <Button variant="outline" onClick={() => handleCancelBooking(booking.id)} className="flex-1">Cancel Booking</Button>
                  </>
                )}
                {booking.status === 'completed' && (
                  <Button variant="secondary" disabled className="w-full">Flight Completed</Button>
                )}
                {booking.status === 'cancelled' && (
                  <Button variant="destructive" disabled className="w-full">Booking Cancelled</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;