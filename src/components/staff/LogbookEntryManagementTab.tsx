import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import FlightPathMap from '@/components/FlightPathMap'; // Import the new map component

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
    display_name: string | null; // Changed to allow null
    is_staff: boolean | null; // Changed to allow null
    email: string | null;
  } | null;
  volanta_tracking_link: string | null;
  flight_path_geojson: any | null; // Added for GeoJSON
}

interface LogbookEntryManagementTabProps {
  flights: Flight[];
  handleDeleteFlight: (flightId: string, flightImageUrl: string | null) => Promise<void>;
}

const LogbookEntryManagementTab: React.FC<LogbookEntryManagementTabProps> = ({
  flights,
  handleDeleteFlight,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Logbook Entries</CardTitle>
        <CardDescription>View all submitted flight logbook entries across all pilots.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pilot</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Flight</TableHead>
              <TableHead>Aircraft</TableHead>
              <TableHead>Flight Time</TableHead>
              <TableHead>Landing Rate</TableHead>
              <TableHead>Logged On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flights.map((flight) => (
              <TableRow key={flight.id}>
                <TableCell>{flight.user_profile?.display_name || 'N/A'}</TableCell>
                <TableCell>{flight.user_profile?.email || 'N/A'}</TableCell>
                <TableCell>{flight.departure_airport} - {flight.arrival_airport}</TableCell>
                <TableCell>{flight.aircraft_type}</TableCell>
                <TableCell>{flight.flight_time}</TableCell>
                <TableCell>{flight.landing_rate || 'N/A'}</TableCell>
                <TableCell>{format(new Date(flight.created_at), 'PPP')}</TableCell>
                <TableCell className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">View</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Flight Details: {flight.flight_number || 'N/A'}</DialogTitle>
                        <DialogDescription>
                          Detailed information about flight from {flight.departure_airport} to {flight.arrival_airport}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                        <div><span className="font-medium">Pilot Email:</span> {flight.user_profile?.email || 'N/A'}</div>
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

                        {flight.volanta_tracking_link && (
                          <div className="col-span-2 mt-4">
                            <span className="font-medium">Volanta Tracking:</span>
                            <a href={flight.volanta_tracking_link} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-500 hover:underline truncate">
                              {flight.volanta_tracking_link}
                            </a>
                          </div>
                        )}

                        {flight.flight_path_geojson && (
                          <div className="col-span-2 mt-6">
                            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Flight Path</h3>
                            <FlightPathMap geoJsonData={flight.flight_path_geojson} />
                          </div>
                        )}

                        {flight.flight_image_url && (
                          <div className="col-span-2 mt-4">
                            <span className="font-medium">Flight Image:</span>
                            <img src={flight.flight_image_url} alt="Flight" className="mt-2 rounded-md object-cover w-full max-h-96" />
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this flight record and its associated image.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteFlight(flight.id, flight.flight_image_url)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LogbookEntryManagementTab;