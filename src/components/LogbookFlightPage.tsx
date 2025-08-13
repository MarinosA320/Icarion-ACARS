import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  user_id: string;
  user_profile: {
    display_name: string | null;
    is_staff: boolean | null;
    vatsim_ivao_id: string | null;
  } | null;
}

interface LogbookFlightPageProps {
  flight: Flight;
  isStaff: boolean;
}

const LogbookFlightPage: React.FC<LogbookFlightPageProps> = ({ flight, isStaff }) => {
  return (
    <Card className="w-full h-full flex flex-col shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-icarion-blue-DEFAULT dark:text-icarion-gold-DEFAULT">
          Flight: {flight.departure_airport} to {flight.arrival_airport}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {flight.aircraft_type} - {flight.flight_time}
          {isStaff && flight.user_profile?.display_name && (
            <span className="block mt-1">Pilot: {flight.user_profile.display_name}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">Logged On:</span> {format(new Date(flight.created_at), 'PPP p')}</div>
          <div><span className="font-medium">Flight Number:</span> {flight.flight_number || 'N/A'}</div>
          <div><span className="font-medium">Pilot Role:</span> {flight.pilot_role}</div>
          <div><span className="font-medium">Flight Rules:</span> {flight.flight_rules || 'N/A'}</div>
          {flight.landing_rate !== null && (
            <div><span className="font-medium">Landing Rate:</span> {flight.landing_rate} fpm</div>
          )}
        </div>

        <h3 className="font-semibold text-lg mt-6 mb-2 text-gray-900 dark:text-white">Timestamps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">ETD:</span> {flight.etd ? format(new Date(flight.etd), 'PPP p') : 'N/A'}</div>
          <div><span className="font-medium">ATD:</span> {flight.atd ? format(new Date(flight.atd), 'PPP p') : 'N/A'}</div>
          <div><span className="font-medium">ETA:</span> {flight.eta ? format(new Date(flight.eta), 'PPP p') : 'N/A'}</div>
          <div><span className="font-medium">ATA:</span> {flight.ata ? format(new Date(flight.ata), 'PPP p') : 'N/A'}</div>
        </div>

        <h3 className="font-semibold text-lg mt-6 mb-2 text-gray-900 dark:text-white">Flight Plan & Remarks</h3>
        <div className="space-y-2 text-sm">
          <div><span className="font-medium">Flight Plan:</span> <p className="whitespace-pre-wrap">{flight.flight_plan || 'N/A'}</p></div>
          <div><span className="font-medium">Remarks:</span> <p className="whitespace-pre-wrap">{flight.remarks || 'N/A'}</p></div>
        </div>

        <h3 className="font-semibold text-lg mt-6 mb-2 text-gray-900 dark:text-white">Airport Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">Departure Runway:</span> {flight.departure_runway || 'N/A'}</div>
          <div><span className="font-medium">Arrival Runway:</span> {flight.arrival_runway || 'N/A'}</div>
          <div><span className="font-medium">Taxiways Used:</span> {flight.taxiways_used || 'N/A'}</div>
          <div><span className="font-medium">Departure Gate:</span> {flight.gates_used_dep || 'N/A'}</div>
          <div><span className="font-medium">Arrival Gate:</span> {flight.gates_used_arr || 'N/A'}</div>
          <div><span className="font-medium">Departure Type:</span> {flight.departure_type || 'N/A'}</div>
          <div><span className="font-medium">Arrival Type:</span> {flight.arrival_type || 'N/A'}</div>
        </div>

        {flight.flight_image_url && (
          <div className="mt-6">
            <span className="font-medium">Flight Image:</span>
            <img src={flight.flight_image_url} alt="Flight" className="mt-2 rounded-md object-cover w-full max-h-96" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogbookFlightPage;