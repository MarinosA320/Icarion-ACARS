import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';

interface StartFlightFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFlightSubmitted: () => void;
  bookingDetails: {
    departureAirport: string;
    arrivalAirport: string;
    airline: string;
    aircraftType: string;
    aircraftRegistration: string;
    flightNumber: string;
    etd: string | null; // Added
    eta: string | null; // Added
  };
  bookingId?: string; // Optional: if starting from a booked flight
}

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  vatsim_ivao_id: string | null;
}

const StartFlightForm: React.FC<StartFlightFormProps> = ({ isOpen, onClose, onFlightSubmitted, bookingDetails, bookingId }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pilotRole, setPilotRole] = useState('PIC');
  const [etd, setEtd] = useState(bookingDetails.etd || ''); // Pre-fill from bookingDetails
  const [atd, setAtd] = useState('');
  const [eta, setEta] = useState(bookingDetails.eta || ''); // Pre-fill from bookingDetails
  const [ata, setAta] = useState('');
  const [flightRules, setFlightRules] = useState('IFR');
  const [flightTime, setFlightTime] = useState('');
  const [flightPlan, setFlightPlan] = useState('');
  const [departureRunway, setDepartureRunway] = useState('');
  const [arrivalRunway, setArrivalRunway] = useState('');
  const [taxiwaysUsed, setTaxiwaysUsed] = useState('');
  const [gatesUsedDep, setGatesUsedDep] = useState('');
  const [gatesUsedArr, setGatesUsedArr] = useState('');
  const [departureType, setDepartureType] = useState('Normal');
  const [arrivalType, setArrivalType] = useState('Normal');
  const [landingRate, setLandingRate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [flightImage, setFlightImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, vatsim_ivao_id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile for form:', error);
        } else {
          setUserProfile(data);
        }
      }
    };
    if (isOpen) {
      fetchUserProfile();
      // Reset form fields or pre-fill from bookingDetails
      setPilotRole('PIC');
      setEtd(bookingDetails.etd || '');
      setAtd('');
      setEta(bookingDetails.eta || '');
      setAta('');
      setFlightRules('IFR');
      setFlightTime('');
      setFlightPlan('');
      setDepartureRunway('');
      setArrivalRunway('');
      setTaxiwaysUsed('');
      setGatesUsedDep('');
      setGatesUsedArr('');
      setDepartureType('Normal');
      setArrivalType('Normal');
      setLandingRate('');
      setRemarks('');
      setFlightImage(null);
    }
  }, [isOpen, bookingDetails]); // Depend on bookingDetails to re-fill when it changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('User not logged in.');
      setLoading(false);
      return;
    }

    let flightImageUrl: string | null = null;
    if (flightImage) {
      const fileExt = flightImage.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `flight_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('flight_images')
        .upload(filePath, flightImage);

      if (uploadError) {
        showError('Error uploading flight image: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('flight_images').getPublicUrl(filePath);
      flightImageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from('flights').insert({
      user_id: user.id,
      departure_airport: bookingDetails.departureAirport,
      arrival_airport: bookingDetails.arrivalAirport,
      aircraft_type: bookingDetails.aircraftType,
      flight_time: flightTime,
      landing_rate: landingRate ? parseInt(landingRate) : null,
      flight_image_url: flightImageUrl,
      flight_number: bookingDetails.flightNumber,
      pilot_role: pilotRole,
      etd: etd || null,
      atd: atd || null,
      eta: eta || null,
      ata: ata || null,
      flight_rules: flightRules,
      flight_plan: flightPlan || null,
      departure_runway: departureRunway || null,
      arrival_runway: arrivalRunway || null,
      taxiways_used: taxiwaysUsed || null,
      gates_used_dep: gatesUsedDep || null,
      gates_used_arr: gatesUsedArr || null,
      departure_type: departureType,
      arrival_type: arrivalType,
      remarks: remarks || null,
    });

    if (error) {
      showError('Error logging flight: ' + error.message);
      console.error('Error logging flight:', error);
    } else {
      // If this flight was started from a booking, update its status
      if (bookingId) {
        const { error: updateBookingError } = await supabase
          .from('flight_bookings')
          .update({ status: 'completed' })
          .eq('id', bookingId);

        if (updateBookingError) {
          console.error('Error updating booking status:', updateBookingError);
          showError('Flight logged, but failed to update booking status.');
        }
      }
      showSuccess('Flight logged successfully!');
      onFlightSubmitted();
      onClose();
    }
    setLoading(false);
  };

  const fullName = userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Your Flight</DialogTitle>
          <DialogDescription>
            Fill in the details for your flight from {bookingDetails.departureAirport} to {bookingDetails.arrivalAirport}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Auto-filled fields */}
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} disabled className="bg-gray-100 dark:bg-gray-700" />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="vatsimIvaoId">VATSIM/IVAO ID</Label>
            <Input id="vatsimIvaoId" value={userProfile?.vatsim_ivao_id || 'N/A'} disabled className="bg-gray-100 dark:bg-gray-700" />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="airlineName">Airline Name</Label>
            <Input id="airlineName" value={bookingDetails.airline} disabled className="bg-gray-100 dark:bg-gray-700" />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="aircraftRegistration">Aircraft Registration</Label>
            <Input id="aircraftRegistration" value={bookingDetails.aircraftRegistration} disabled className="bg-gray-100 dark:bg-gray-700" />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="flightNumber">Flight Number</Label>
            <Input id="flightNumber" value={bookingDetails.flightNumber} disabled className="bg-gray-100 dark:bg-gray-700" />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="aircraftType">Aircraft Type</Label>
            <Input id="aircraftType" value={bookingDetails.aircraftType} disabled className="bg-gray-100 dark:bg-gray-700" />
          </div>

          {/* User input fields */}
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="pilotRole">Pilot Role</Label>
            <Select value={pilotRole} onValueChange={setPilotRole}>
              <SelectTrigger id="pilotRole">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIC">PIC</SelectItem>
                <SelectItem value="FO">FO</SelectItem>
                <SelectItem value="Observer">Observer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="flightRules">Flight Rules</Label>
            <Select value={flightRules} onValueChange={setFlightRules}>
              <SelectTrigger id="flightRules">
                <SelectValue placeholder="Select rules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IFR">IFR</SelectItem>
                <SelectItem value="VFR">VFR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-full md:col-span-1">
            <Label htmlFor="etd">Estimated Time of Departure (ETD)</Label>
            <Input id="etd" type="datetime-local" value={etd} onChange={(e) => setEtd(e.target.value)} />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="atd">Actual Time of Departure (ATD)</Label>
            <Input id="atd" type="datetime-local" value={atd} onChange={(e) => setAtd(e.target.value)} />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="eta">Estimated Time of Arrival (ETA)</Label>
            <Input id="eta" type="datetime-local" value={eta} onChange={(e) => setEta(e.target.value)} />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="ata">Actual Time of Arrival (ATA)</Label>
            <Input id="ata" type="datetime-local" value={ata} onChange={(e) => setAta(e.target.value)} />
          </div>

          <div className="col-span-full md:col-span-1">
            <Label htmlFor="flightTime">Flight Time (HH:MM)</Label>
            <Input id="flightTime" value={flightTime} onChange={(e) => setFlightTime(e.target.value)} placeholder="e.g., 02:30" required />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="landingRate">Landing Rate (fpm)</Label>
            <Input id="landingRate" type="number" value={landingRate} onChange={(e) => setLandingRate(e.target.value)} placeholder="e.g., -250" />
          </div>

          <div className="col-span-full">
            <Label htmlFor="flightPlan">Flight Plan</Label>
            <Textarea id="flightPlan" value={flightPlan} onChange={(e) => setFlightPlan(e.target.value)} placeholder="Enter your flight plan details..." rows={4} />
          </div>

          <div className="col-span-full md:col-span-1">
            <Label htmlFor="departureRunway">Departure Runway</Label>
            <Input id="departureRunway" value={departureRunway} onChange={(e) => setDepartureRunway(e.target.value)} placeholder="e.g., 27L" />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="arrivalRunway">Arrival Runway</Label>
            <Input id="arrivalRunway" value={arrivalRunway} onChange={(e) => setArrivalRunway(e.target.value)} placeholder="e.g., 09R" />
          </div>

          <div className="col-span-full md:col-span-1">
            <Label htmlFor="taxiwaysUsed">Taxiways Used</Label>
            <Input id="taxiwaysUsed" value={taxiwaysUsed} onChange={(e) => setTaxiwaysUsed(e.target.value)} placeholder="e.g., A, B, C" />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="gatesUsedDep">Departure Gate(s)</Label>
            <Input id="gatesUsedDep" value={gatesUsedDep} onChange={(e) => setGatesUsedDep(e.target.value)} placeholder="e.g., A12" />
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="gatesUsedArr">Arrival Gate(s)</Label>
            <Input id="gatesUsedArr" value={gatesUsedArr} onChange={(e) => setGatesUsedArr(e.target.value)} placeholder="e.g., B05" />
          </div>

          <div className="col-span-full md:col-span-1">
            <Label htmlFor="departureType">Departure Type</Label>
            <Select value={departureType} onValueChange={setDepartureType}>
              <SelectTrigger id="departureType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-full md:col-span-1">
            <Label htmlFor="arrivalType">Arrival Type</Label>
            <Select value={arrivalType} onValueChange={setArrivalType}>
              <SelectTrigger id="arrivalType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Diverted">Diverted</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-full">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Any additional remarks about the flight..." rows={3} />
          </div>

          <div className="col-span-full">
            <Label htmlFor="flightImage">Upload Flight Image (Optional)</Label>
            <Input
              id="flightImage"
              type="file"
              accept="image/*"
              onChange={(e) => setFlightImage(e.target.files ? e.target.files[0] : null)}
              className="w-full"
            />
          </div>

          <DialogFooter className="col-span-full mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Log Flight'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StartFlightForm;