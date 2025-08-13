import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

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

interface FlightBookingManagementTabProps {
  flightBookings: FlightBooking[];
  handleBookingStatusUpdate: (bookingId: string, newStatus: string) => Promise<void>;
  handleDeleteBooking: (bookingId: string) => Promise<void>;
}

const FlightBookingManagementTab: React.FC<FlightBookingManagementTabProps> = ({
  flightBookings,
  handleBookingStatusUpdate,
  handleDeleteBooking,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Flight Bookings</CardTitle>
        <CardDescription>View and manage all planned flight bookings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pilot</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Flight</TableHead>
              <TableHead>Aircraft</TableHead>
              <TableHead>Flight No.</TableHead>
              <TableHead>ETD</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flightBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.user_profile?.display_name || 'N/A'}</TableCell>
                <TableCell>{booking.user_profile?.email || 'N/A'}</TableCell>
                <TableCell>{booking.departure_airport} - {booking.arrival_airport}</TableCell>
                <TableCell>{booking.aircraft_type} ({booking.aircraft_registration})</TableCell>
                <TableCell>{booking.flight_number || 'N/A'}</TableCell>
                <TableCell>{booking.etd ? format(new Date(booking.etd), 'PPP') : 'N/A'}</TableCell>
                <TableCell>
                  <Select value={booking.status} onValueChange={(value) => handleBookingStatusUpdate(booking.id, value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">View</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Flight Booking Details: {booking.flight_number || 'N/A'}</DialogTitle>
                        <DialogDescription>
                          Detailed information about booking from {booking.departure_airport} to {booking.arrival_airport}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                        <div><span className="font-medium">Pilot:</span> {booking.user_profile?.display_name || 'N/A'}</div>
                        <div><span className="font-medium">Pilot Email:</span> {booking.user_profile?.email || 'N/A'}</div>
                        <div><span className="font-medium">Airline:</span> {booking.airline_name}</div>
                        <div><span className="font-medium">Aircraft Type:</span> {booking.aircraft_type}</div>
                        <div><span className="font-medium">Registration:</span> {booking.aircraft_registration}</div>
                        <div><span className="font-medium">Departure:</span> {booking.departure_airport}</div>
                        <div><span className="font-medium">Arrival:</span> {booking.arrival_airport}</div>
                        <div><span className="font-medium">ETD:</span> {booking.etd ? format(new Date(booking.etd), 'PPP p') : 'N/A'}</div>
                        <div><span className="font-medium">ETA:</span> {booking.eta ? format(new Date(booking.eta), 'PPP p') : 'N/A'}</div>
                        <div><span className="font-medium">Status:</span> {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</div>
                        <div><span className="font-medium">Booked On:</span> {format(new Date(booking.created_at), 'PPP p')}</div>
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
                          This action cannot be undone. This will permanently delete this flight booking.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteBooking(booking.id)}>
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

export default FlightBookingManagementTab;