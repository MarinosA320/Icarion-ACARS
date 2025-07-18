import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';

interface Flight {
  id: string;
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
  } | null;
}

const Logbook = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const fetchFlights = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('User not logged in.');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_staff')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching staff status:', profileError);
        showError('Error fetching staff status.');
        return;
      }

      setIsStaff(profileData?.is_staff || false);

      const selectString = "*,profiles(display_name,is_staff)";
      console.log("Logbook - Select String:", selectString);
      let query = supabase
        .from('flights')
        .select(selectString)
        .order('created_at', { ascending: false });

      if (!profileData?.is_staff) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        showError('Error fetching flights: ' + error.message);
        console.error('Error fetching flights:', error);
      } else {
        setFlights(data as Flight[]);
      }
    };

    fetchFlights();
  }, []);

  return (
    <div className="container mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Flight Logbook</h1>

      {flights.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">No flights logged yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flights.map((flight) => (
            <Card key={flight.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">
                  {flight.departure_airport} to {flight.arrival_airport}
                </CardTitle>
                <CardDescription className="text-sm">
                  {flight.aircraft_type} - {flight.flight_time}
                </CardDescription>
                {isStaff && flight.user_profile?.display_name && (
                  <p className="text-xs text-muted-foreground">Pilot: {flight.user_profile.display_name}</p>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Logged on: {format(new Date(flight.created_at), 'PPP p')}
                </p>
                {flight.landing_rate !== null && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Landing Rate: {flight.landing_rate} fpm
                  </p>
                )}
                {flight.flight_image_url && (
                  <img src={flight.flight_image_url} alt="Flight" className="mt-4 rounded-md object-cover w-full h-48" />
                )}
              </CardContent>
              <div className="p-6 pt-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">View Details</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Flight Details: {flight.flight_number || 'N/A'}</DialogTitle>
                      <DialogDescription>
                        Detailed information about your flight from {flight.departure_airport} to {flight.arrival_airport}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                      <div className="col-span-2 font-semibold text-lg">Basic Info</div>
                      <div><span className="font-medium">Aircraft Type:</span> {flight.aircraft_type}</div>
                      <div><span className="font-medium">Flight Time:</span> {flight.flight_time}</div>
                      <div><span className="font-medium">Landing Rate:</span> {flight.landing_rate || 'N/A'} fpm</div>
                      <div><span className="font-medium">Pilot Role:</span> {flight.pilot_role}</div>
                      <div><span className="font-medium">Flight Rules:</span> {flight.flight_rules || 'N/A'}</div>
                      <div><span className="font-medium">Flight Number:</span> {flight.flight_number || 'N/A'}</div>

                      <div className="col-span-2 font-semibold text-lg mt-4">Timestamps</div>
                      <div><span className="font-medium">ETD:</span> {flight.etd ? format(new Date(flight.etd), 'PPP p') : 'N/A'}</div>
                      <div><span className="font-medium">ATD:</span> {flight.atd ? format(new Date(flight.atd), 'PPP p') : 'N/A'}</div>
                      <div><span className="font-medium">ETA:</span> {flight.eta ? format(new Date(flight.eta), 'PPP p') : 'N/A'}</div>
                      <div><span className="font-medium">ATA:</span> {flight.ata ? format(new Date(flight.ata), 'PPP p') : 'N/A'}</div>

                      <div className="col-span-2 font-semibold text-lg mt-4">Flight Plan & Remarks</div>
                      <div className="col-span-2"><span className="font-medium">Flight Plan:</span> <p className="whitespace-pre-wrap">{flight.flight_plan || 'N/A'}</p></div>
                      <div className="col-span-2"><span className="font-medium">Remarks:</span> <p className="whitespace-pre-wrap">{flight.remarks || 'N/A'}</p></div>

                      <div className="col-span-2 font-semibold text-lg mt-4">Airport Details</div>
                      <div><span className="font-medium">Departure Runway:</span> {flight.departure_runway || 'N/A'}</div>
                      <div><span className="font-medium">Arrival Runway:</span> {flight.arrival_runway || 'N/A'}</div>
                      <div><span className="font-medium">Taxiways Used:</span> {flight.taxiways_used || 'N/A'}</div>
                      <div><span className="font-medium">Departure Gate:</span> {flight.gates_used_dep || 'N/A'}</div>
                      <div><span className="font-medium">Arrival Gate:</span> {flight.gates_used_arr || 'N/A'}</div>
                      <div><span className="font-medium">Departure Type:</span> {flight.departure_type || 'N/A'}</div>
                      <div><span className="font-medium">Arrival Type:</span> {flight.arrival_type || 'N/A'}</div>

                      {flight.flight_image_url && (
                        <div className="col-span-2 mt-4">
                          <span className="font-medium">Flight Image:</span>
                          <img src={flight.flight_image_url} alt="Flight" className="mt-2 rounded-md object-cover w-full max-h-96" />
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Logbook;