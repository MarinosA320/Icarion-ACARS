import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ALL_AIRLINES, Airline } from '@/utils/aircraftData'; // Import Airline interface

interface FlightDetailsFormProps {
  formState: {
    departureAirport: string;
    arrivalAirport: string;
    selectedAircraftType: string;
    flightNumber: string;
    selectedAirline: string;
    selectedAircraftRegistration: string;
    pilotRole: string;
    etd: string;
    atd: string;
    eta: string;
    ata: string;
    flightRules: string;
    flightTime: string;
    landingRate: string;
    departureRunway: string;
    arrivalRunway: string;
    taxiwaysUsed: string;
    gatesUsedDep: string;
    gatesUsedArr: string;
    departureType: string;
    arrivalType: string;
    volantaTrackingLink: string;
  };
  userRank: string;
  filteredAircraftTypes: string[];
  aircraftRegistrations: string[];
  availableAirlines: Airline[]; // New prop
  handleChange: (field: string, value: string) => void;
  handleAircraftTypeChange: (value: string) => void;
  handleAirlineChange: (value: string) => void;
}

const FlightDetailsForm: React.FC<FlightDetailsFormProps> = ({
  formState,
  userRank,
  filteredAircraftTypes,
  aircraftRegistrations,
  availableAirlines, // Use this prop
  handleChange,
  handleAircraftTypeChange,
  handleAirlineChange,
}) => {
  // Use availableAirlines directly for rendering options
  const currentAirline = availableAirlines.find(a => a.name === formState.selectedAirline);

  return (
    <>
      <div className="col-span-full md:col-span-1">
        <Label htmlFor="airlineName">Airline Name</Label>
        <Select value={formState.selectedAirline || ''} onValueChange={handleAirlineChange}>
          <SelectTrigger id="airlineName">
            <SelectValue placeholder="Select airline" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {availableAirlines.length > 0 ? (
              availableAirlines.map(airline => (
                <SelectItem key={airline.name} value={airline.name}>{airline.name}</SelectItem>
              ))
            ) : (
              <SelectItem value="no-airlines-available" disabled>No authorized airlines available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-full md:col-span-1">
        <Label htmlFor="flightNumber">Flight Number / Callsign</Label>
        <Input id="flightNumber" value={formState.flightNumber || ''} onChange={(e) => handleChange('flightNumber', e.target.value)} />
      </div>
      
      <div className="col-span-full md:col-span-1">
        <Label htmlFor="departureAirport">Departure Airport</Label>
        <Input id="departureAirport" value={formState.departureAirport || ''} onChange={(e) => handleChange('departureAirport', e.target.value)} />
      </div>
      <div className="col-span-full md:col-span-1">
        <Label htmlFor="arrivalAirport">Arrival Airport</Label>
        <Input id="arrivalAirport" value={formState.arrivalAirport || ''} onChange={(e) => handleChange('arrivalAirport', e.target.value)} />
      </div>

      <div className="col-span-full md:col-span-1">
        <Label htmlFor="aircraftType">Aircraft Type (Your Rank: {userRank || 'Loading...'})</Label>
        <Select value={formState.selectedAircraftType || ''} onValueChange={handleAircraftTypeChange} disabled={!formState.selectedAirline || !userRank}>
          <SelectTrigger id="aircraftType">
            <SelectValue placeholder="Select aircraft type" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {filteredAircraftTypes.length > 0 ? (
              filteredAircraftTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))
            ) : (
              <SelectItem value="no-aircraft-available" disabled>No aircraft available for selected airline/rank</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-full md:col-span-1">
        <Label htmlFor="aircraftRegistration">Aircraft Registration</Label>
        {formState.selectedAirline === 'Icarion Virtual' ? (
          <Select value={formState.selectedAircraftRegistration || ''} onValueChange={(value) => handleChange('selectedAircraftRegistration', value)} disabled={!formState.selectedAircraftType}>
            <SelectTrigger id="aircraftRegistration">
              <SelectValue placeholder="Select registration" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {aircraftRegistrations.length > 0 ? (
                aircraftRegistrations.map(reg => (
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
            value={formState.selectedAircraftRegistration || ''}
            onChange={(e) => handleChange('selectedAircraftRegistration', e.target.value)}
            placeholder="e.g., N123AB"
            required
            disabled={!formState.selectedAircraftType}
          />
        )}
      </div>

      <div className="col-span-full md:col-span-1">
        <Label htmlFor="pilotRole">Pilot Role</Label>
        <Select value={formState.pilotRole || ''} onValueChange={(value) => handleChange('pilotRole', value)}>
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
        <Select value={formState.flightRules || ''} onValueChange={(value) => handleChange('flightRules', value)}>
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
        <Input id="etd" type="datetime-local" value={formState.etd || ''} onChange={(e) => handleChange('etd', e.target.value)} />
      </div>
      <div className="col-span-full md:col-span-1">
        <Label htmlFor="atd">Actual Time of Departure (ATD)</Label>
        <Input id="atd" type="datetime-local" value={formState.atd || ''} onChange={(e) => handleChange('atd', e.target.value)} />
      </div>
      <div className="col-span-full md:col-span-1">
        <Label htmlFor="eta">Estimated Time of Arrival (ETA)</Label>
        <Input id="eta" type="datetime-local" value={formState.eta || ''} onChange={(e) => handleChange('eta', e.target.value)} />
      </div>
      <div className="col-span-full md:col-span-1">
        <Label htmlFor="ata">Actual Time of Arrival (ATA)</Label>
        <Input id="ata" type="datetime-local" value={formState.ata || ''} onChange={(e) => handleChange('ata', e.target.value)} />
      </div>

      <div className="col-span-full md:col-span-1">
        <Label htmlFor="flightTime">Flight Time (HH:MM)</Label>
        <Input id="flightTime" value={formState.flightTime || ''} onChange={(e) => handleChange('flightTime', e.target.value)} placeholder="e.g., 02:30" required />
      </div>
      <div className="col-span-full md:col-span-1">
        <Label htmlFor="landingRate">Landing Rate (fpm)</Label>
        <Input id="landingRate" type="number" value={formState.landingRate || ''} onChange={(e) => handleChange('landingRate', e.target.value)} placeholder="e.g., -250" />
      </div>

      <div className="col-span-full md:col-span-1">
        <Label htmlFor="departureRunway">Departure Runway</Label>
        <Input id="departureRunway" value={formState.departureRunway || ''} onChange={(e) => handleChange('departureRunway', e.target.value)} placeholder="e.g., 27L" />
      </div>
      <div className="col-span-full md:col-span-1">
        <Label htmlFor="arrivalRunway">Arrival Runway</Label>
        <Input id="arrivalRunway" value={formState.arrivalRunway || ''} onChange={(e) => handleChange('arrivalRunway', e.target.value)} placeholder="e.g., 09R" />
      </div>

      <div className="col-span-full md:col-span-1">
        <Label htmlFor="taxiwaysUsed">Taxiways Used</Label>
        <Input id="taxiwaysUsed" value={formState.taxiwaysUsed || ''} onChange={(e) => handleChange('taxiwaysUsed', e.target.value)} placeholder="e.g., A, B, C" />
      </div>
      <div className="col-span-full md:col-span-1">
        <Label htmlFor="gatesUsedDep">Departure Gate(s)</Label>
        <Input id="gatesUsedDep" value={formState.gatesUsedDep || ''} onChange={(e) => handleChange('gatesUsedDep', e.target.value)} placeholder="e.g., A12" />
      </div>
      <div className="col-span-full md:col-span-1">
        <Label htmlFor="gatesUsedArr">Arrival Gate(s)</Label>
        <Input id="gatesUsedArr" value={formState.gatesUsedArr || ''} onChange={(e) => handleChange('gatesUsedArr', e.target.value)} placeholder="e.g., B05" />
      </div>

      <div className="col-span-full md:col-span-1">
        <Label htmlFor="departureType">Departure Type</Label>
        <Select value={formState.departureType || ''} onValueChange={(value) => handleChange('departureType', value)}>
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
        <Select value={formState.arrivalType || ''} onValueChange={(value) => handleChange('arrivalType', value)}>
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
        <Label htmlFor="volantaTrackingLink">Volanta Tracking Link (Optional)</Label>
        <Input id="volantaTrackingLink" type="url" value={formState.volantaTrackingLink || ''} onChange={(e) => handleChange('volantaTrackingLink', e.target.value)} placeholder="e.g., https://volanta.app/flights/..." />
      </div>
    </>
  );
};

export default FlightDetailsForm;