import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import {
  RANK_ORDER,
  AIRCRAFT_MIN_RANKS,
  ICARION_FLEET,
  ALL_AIRLINES,
  hasRequiredRank,
  Aircraft,
  Airline,
} from '@/utils/aircraftData'; // Import from new utility file

interface UserProfile {
  rank: string;
}

// Helper function to convert "HH:MM" to total minutes
const convertFlightTimeToMinutes = (flightTime: string): number => {
  const [hours, minutes] = flightTime.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert total minutes back to "HHh MMm" format for display
const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const PlanFlight = () => {
  const [userRank, setUserRank] = useState<string>('Trainee');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('Icarion Virtual'); // Set default to Icarion Virtual
  const [aircraftType, setAircraftType] = useState('');
  const [aircraftRegistration, setAircraftRegistration] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [etd, setEtd] = useState('');
  const [eta, setEta] = useState('');
  const [loading, setLoading] = useState(false);

  // Effect to load data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('planFlightForm');
    if (savedFormData) {
      try {
        const data = JSON.parse(savedFormData);
        setDepartureAirport(data.departureAirport || '');
        setArrivalAirport(data.arrivalAirport || '');
        setSelectedAirline(data.selectedAirline || 'Icarion Virtual');
        setAircraftType(data.aircraftType || '');
        setAircraftRegistration(data.aircraftRegistration || '');
        setFlightNumber(data.flightNumber || '');
        setEtd(data.etd || '');
        setEta(data.eta || '');
      } catch (e) {
        console.error("Failed to parse saved form data from localStorage", e);
        localStorage.removeItem('planFlightForm'); // Clear corrupted data
      }
    }
  }, []);

  // Effect to save data to localStorage whenever form fields change
  useEffect(() => {
    const formData = {
      departureAirport,
      arrivalAirport,
      selectedAirline,
      aircraftType,
      aircraftRegistration,
      flightNumber,
      etd,
      eta,
    };
    localStorage.setItem('planFlightForm', JSON.stringify(formData));
  }, [departureAirport, arrivalAirport, selectedAirline, aircraftType, aircraftRegistration, flightNumber, etd, eta]);


  useEffect(() => {
    const fetchUserRank = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('rank')
          .eq('id', user.id)
          .single();
        if (error) {
          console.error('Error fetching user rank:', error);
          showError('Error fetching user rank.');
        } else if (data) {
          setUserRank(data.rank);
        }
      }
    };
    fetchUserRank();
  }, []);

  // Effect to set initial aircraft type and registration based on default airline
  useEffect(() => {
    const currentAirline = ALL_AIRLINES.find(a => a.name === selectedAirline);
    if (currentAirline) {
      const initialAircraftTypes = getFilteredAircraftTypes(currentAirline);
      if (initialAircraftTypes.length > 0) {
        setAircraftType(initialAircraftTypes[0]);
        // Only set initial registration if it's Icarion Virtual and registrations exist
        if (selectedAirline === 'Icarion Virtual') {
          const initialRegistrations = getAircraftRegistrationsForType(currentAirline, initialAircraftTypes[0]);
          if (initialRegistrations.length > 0) {
            setAircraftRegistration(initialRegistrations[0]);
          } else {
            setAircraftRegistration('');
          }
        } else {
          setAircraftRegistration(''); // Clear registration for other airlines
        }
      } else {
        setAircraftType('');
        setAircraftRegistration('');
      }
    } else {
      setAircraftType('');
      setAircraftRegistration('');
    }
  }, [selectedAirline, userRank]); // Re-run when airline or userRank changes

  const getFilteredAircraftTypes = (airline: Airline) => {
    const availableAircraftTypes = airline.fleet.map(ac => ac.type);
    
    const filteredByRank = availableAircraftTypes.filter(type => {
      const requiredRank = AIRCRAFT_MIN_RANKS[type];
      return requiredRank ? hasRequiredRank(userRank, requiredRank) : true; // If no rank defined, assume allowed
    });

    return filteredByRank;
  };

  const getAircraftRegistrationsForType = (airline: Airline, type: string) => {
    const selectedAircraft = airline.fleet.find(ac => ac.type === type);
    return selectedAircraft ? selectedAircraft.registrations : [];
  };

  const handleAirlineChange = (value: string) => {
    setSelectedAirline(value);
    setAircraftType(''); // Reset aircraft type when airline changes
    setAircraftRegistration(''); // Reset registration
  };

  const handleAircraftTypeChange = (value: string) => {
    setAircraftType(value);
    setAircraftRegistration(''); // Reset registration when aircraft type changes
  };

  const handleBookFlight = async () => {
    if (!departureAirport || !arrivalAirport || !selectedAirline || !aircraftType || !aircraftRegistration || !flightNumber || !etd || !eta) {
      showError('Please fill all required booking details.');
      return;
    }

    // Validation Rule: Either departure or arrival must be an airport where the selected airline has a base.
    // This rule is skipped for Aegean Airlines and Ryanair.
    const currentAirline = ALL_AIRLINES.find(a => a.name === selectedAirline);
    if (currentAirline && currentAirline.bases.length > 0 && selectedAirline !== 'Aegean Airlines' && selectedAirline !== 'Ryanair') {
      const isDepartureAtBase = currentAirline.bases.includes(departureAirport.toUpperCase()); // Convert to uppercase for comparison
      const isArrivalAtBase = currentAirline.bases.includes(arrivalAirport.toUpperCase()); // Convert to uppercase for comparison

      if (!isDepartureAtBase && !isArrivalAtBase) {
        showError(`For ${selectedAirline}, either the departure or arrival airport must be one of its bases: ${currentAirline.bases.join(', ')}.`);
        return;
      }
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('User not logged in.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('flight_bookings').insert({
      user_id: user.id,
      departure_airport: departureAirport.toUpperCase(), // Store as uppercase
      arrival_airport: arrivalAirport.toUpperCase(),     // Store as uppercase
      aircraft_type: aircraftType,
      aircraft_registration: aircraftRegistration,
      flight_number: flightNumber,
      airline_name: selectedAirline,
      etd: etd,
      eta: eta,
      status: 'booked',
    });

    if (error) {
      showError('Error booking flight: ' + error.message);
      console.error('Error booking flight:', error);
    } else {
      showSuccess('Flight booked successfully! You can view it in My Bookings.');
      // Clear form and localStorage
      setDepartureAirport('');
      setArrivalAirport('');
      setSelectedAirline('Icarion Virtual'); // Reset to default
      setAircraftType('');
      setAircraftRegistration('');
      setFlightNumber('');
      setEtd('');
      setEta('');
      localStorage.removeItem('planFlightForm'); // Clear saved data
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Plan Your Flight</h1>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Flight Booking</CardTitle>
          <CardDescription>Plan your next flight by filling in the details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="departureAirport">Departure Airport (ICAO)</Label>
              <Input
                id="departureAirport"
                value={departureAirport}
                onChange={(e) => setDepartureAirport(e.target.value)}
                placeholder="e.g., LGAV"
                maxLength={4}
                className="uppercase" // Visually indicate uppercase
              />
            </div>
            <div>
              <Label htmlFor="arrivalAirport">Arrival Airport (ICAO)</Label>
              <Input
                id="arrivalAirport"
                value={arrivalAirport}
                onChange={(e) => setArrivalAirport(e.target.value)}
                placeholder="e.g., LGTS"
                maxLength={4}
                className="uppercase" // Visually indicate uppercase
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="airline">Airline</Label>
              <Select value={selectedAirline} onValueChange={handleAirlineChange}>
                <SelectTrigger id="airline">
                  <SelectValue placeholder="Select airline" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {ALL_AIRLINES.map(airline => (
                    <SelectItem key={airline.name} value={airline.name}>{airline.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="aircraftType">Aircraft Type (Your Rank: {userRank})</Label>
              <Select value={aircraftType} onValueChange={handleAircraftTypeChange} disabled={!selectedAirline}>
                <SelectTrigger id="aircraftType">
                  <SelectValue placeholder="Select aircraft type" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {getFilteredAircraftTypes(ALL_AIRLINES.find(a => a.name === selectedAirline) || ALL_AIRLINES[0]).length > 0 ? (
                    getFilteredAircraftTypes(ALL_AIRLINES.find(a => a.name === selectedAirline) || ALL_AIRLINES[0]).map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-aircraft-available" disabled>No aircraft available for selected airline/rank</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="aircraftRegistration">Aircraft Registration</Label>
              {selectedAirline === 'Icarion Virtual' ? (
                <Select value={aircraftRegistration} onValueChange={setAircraftRegistration} disabled={!aircraftType}>
                  <SelectTrigger id="aircraftRegistration">
                    <SelectValue placeholder="Select registration" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {getAircraftRegistrationsForType(ALL_AIRLINES.find(a => a.name === selectedAirline) || ALL_AIRLINES[0], aircraftType).length > 0 ? (
                      getAircraftRegistrationsForType(ALL_AIRLINES.find(a => a.name === selectedAirline) || ALL_AIRLINES[0], aircraftType).map(reg => (
                        <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-registrations-available" disabled>No registrations available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="aircraftRegistration"
                  value={aircraftRegistration}
                  onChange={(e) => setAircraftRegistration(e.target.value)}
                  placeholder="e.g., N123AB"
                  required
                  disabled={!aircraftType}
                />
              )}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="flightNumber">Flight Number</Label>
              <Input
                id="flightNumber"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="e.g., ICN123"
              />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="etd">Estimated Time of Departure (ETD)</Label>
              <Input id="etd" type="datetime-local" value={etd} onChange={(e) => setEtd(e.target.value)} />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="eta">Estimated Time of Arrival (ETA)</Label>
              <Input id="eta" type="datetime-local" value={eta} onChange={(e) => setEta(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleBookFlight} className="w-full mt-6" disabled={loading}>
            {loading ? 'Booking Flight...' : 'Book Flight'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanFlight;