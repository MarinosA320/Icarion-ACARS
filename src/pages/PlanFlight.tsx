import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';

interface UserProfile {
  rank: string;
}

interface Aircraft {
  type: string;
  registrations: string[];
}

interface Airline {
  name: string;
  bases: string[]; // ICAO codes of base airports
  fleet: Aircraft[];
}

// Define rank hierarchy for comparison
const RANK_ORDER: { [key: string]: number } = {
  'Trainee': 1,
  'First Officer': 2,
  'Captain': 3,
};

// Define minimum rank required for each aircraft type
const AIRCRAFT_MIN_RANKS: { [key: string]: string } = {
  // Light Aircraft (Trainee+)
  'DH8D': 'Trainee', 'E190': 'Trainee', 'ATR42': 'Trainee', 'ATR72': 'Trainee',
  'CRJ100': 'Trainee', 'CRJ200': 'Trainee', 'ERJ135': 'Trainee', 'ERJ140': 'Trainee', 'ERJ145': 'Trainee',
  'Saab340': 'Trainee', 'Saab2000': 'Trainee', 'Fokker50': 'Trainee', 'EMB120': 'Trainee',
  'A220': 'Trainee', 'A220-100': 'Trainee', 'A220-300': 'Trainee',
  'A318': 'Trainee', 'A319': 'Trainee',
  'B717': 'Trainee', 'B737': 'Trainee', 'B737MAX': 'Trainee',
  'E170': 'Trainee', 'E175': 'Trainee', 'E195': 'Trainee',
  'SSJ100': 'Trainee',

  // Medium Aircraft (First Officer+)
  'A20N': 'First Officer', 'A21N': 'First Officer', 'A320': 'First Officer', 'A321': 'First Officer',
  'B38M': 'First Officer', 'B738': 'First Officer', 'B757': 'First Officer', 'B752': 'First Officer',
  'CRJ700': 'First Officer', 'CRJ900': 'First Officer', 'CRJ1000': 'First Officer',
  'M90': 'First Officer',

  // Heavy/Long-Haul Aircraft (Captain+)
  'A300': 'Captain', 'A310': 'Captain', 'A330': 'Captain', 'A340': 'Captain', 'A350': 'Captain', 'A380': 'Captain',
  'B707': 'Captain', 'B727': 'Captain', 'B747': 'Captain', 'B767': 'Captain', 'B777': 'Captain', 'B787': 'Captain',
  'DC-10': 'Captain', 'MD-11': 'Captain', 'L-1011': 'Captain',
  'C919': 'Captain', 'MC-21': 'Captain',
  'A321neo': 'Captain', // Specific for La Compagnie
  'F100': 'Captain', // Fokker 100 for Virgin Australia

  // Cargo Aircraft (Captain+)
  'B737-300F': 'Captain', 'B737-800BCF': 'Captain',
  'B747-400F': 'Captain', 'B747-8F': 'Captain',
  'B767-300F': 'Captain', 'B777F': 'Captain',
  'A300F': 'Captain', 'A310F': 'Captain', 'A330F': 'Captain',
  'DC-10F': 'Captain', 'MD-11F': 'Captain',
  'An-124': 'Captain', 'An-225': 'Captain', 'C-5': 'Captain', 'Il-76': 'Captain',
};

// Helper function to check if user's rank meets or exceeds required rank
const hasRequiredRank = (userRank: string, requiredRank: string): boolean => {
  return RANK_ORDER[userRank] >= RANK_ORDER[requiredRank];
};

const ICARION_FLEET: Aircraft[] = [
  { type: 'A20N', registrations: ['D-AIQN', 'D-IRCN', 'SX-ACI', 'SX-IKR'] },
  { type: 'A21N', registrations: ['9H-XLR', 'SX-LBA', 'SX-LGT'] },
  { type: 'A320', registrations: ['SX-ARI', 'SX-CRA', 'SX-ICA', 'SX-ICM', 'SX-IRA', 'D-ACIQ', 'D-AQIR', 'SX-QRN'] },
  { type: 'A321', registrations: ['SX-CCA', 'SX-AIR'] },
  { type: 'B38M', registrations: ['9H-VAA', '9H-VAB', '9H-VAC', '9H-VAD'] },
  { type: 'B738', registrations: ['9H-IBC', '9H-VRA', '9H-MTD', '9H-BLU'] },
  { type: 'B752', registrations: ['9H-VAE', '9H-VAF', '9H-VAG', '9H-VAH'] }, // VAG, VAH are freighters
  { type: 'DH8D', registrations: ['SX-QIA', 'SX-ICQ'] },
  { type: 'E190', registrations: ['9H-EMB', '9H-EMA'] },
];

// Helper to create a fleet from a list of types
const createFleet = (types: string[]): Aircraft[] => types.map(type => ({ type, registrations: [] }));

const ALL_AIRLINES: Airline[] = [
  { name: 'Icarion Virtual', bases: ['LGIR'], fleet: ICARION_FLEET },
  { name: 'Aegean Airlines', bases: ['LGAV', 'LGTS'], fleet: createFleet(['A320', 'A321', 'ATR72']) },
  { name: 'Aer Lingus', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'A350', 'B757']) },
  { name: 'Aeroflot', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'A350', 'B737', 'B777', 'SSJ100']) },
  { name: 'Aerolíneas Argentinas', bases: [], fleet: createFleet(['B737', 'B737MAX', 'B787']) },
  { name: 'Aeroméxico', bases: [], fleet: createFleet(['B737', '787', 'E190']) },
  { name: 'Air Arabia', bases: [], fleet: createFleet(['A320', 'A321']) },
  { name: 'Air Astana', bases: [], fleet: createFleet(['A320', 'A321', 'B767', 'B787', 'E190']) },
  { name: 'Air Austral', bases: [], fleet: createFleet(['B777', 'B787']) },
  { name: 'Air Baltic', bases: [], fleet: createFleet(['A220']) },
  { name: 'Air Belgium', bases: [], fleet: createFleet(['A330', 'A340']) },
  { name: 'Air Canada', bases: [], fleet: createFleet(['A220', 'A320', 'A321', 'A330', 'B737MAX', 'B777', 'B787', 'E190']) },
  { name: 'Air Caraïbes', bases: [], fleet: createFleet(['A330', 'A350']) },
  { name: 'Air China', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A350', 'B737', 'B747', 'B777', 'B787']) },
  { name: 'Air Corsica', bases: [], fleet: createFleet(['A320', 'ATR72']) },
  { name: 'Air Dolomiti', bases: [], fleet: createFleet(['E195']) },
  { name: 'Air Europa', bases: [], fleet: createFleet(['B737', 'B787', 'E190', 'E195']) },
  { name: 'Air France', bases: [], fleet: createFleet(['A318', 'A319', 'A320', 'A321', 'A330', 'A350', 'B777', 'B787']) },
  { name: 'Air India', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'B747', 'B777', 'B787']) },
  { name: 'Air India Express', bases: [], fleet: createFleet(['B737']) },
  { name: 'Air Macau', bases: [], fleet: createFleet(['A320', 'A321']) },
  { name: 'Air Malta', bases: [], fleet: createFleet(['A320']) },
  { name: 'Air Mauritius', bases: [], fleet: createFleet(['A330', 'A350', 'ATR72']) },
  { name: 'Air Namibia', bases: [], fleet: createFleet(['A319', 'A330']) },
  { name: 'Air New Zealand', bases: [], fleet: createFleet(['A320', 'A321', 'B777', 'B787', 'ATR72']) },
  { name: 'Air North', bases: [], fleet: createFleet(['B737', 'ATR42', 'ATR72']) },
  { name: 'Air Seoul', bases: [], fleet: createFleet(['A321']) },
  { name: 'Air Serbia', bases: [], fleet: createFleet(['A319', 'A320', 'A330', 'ATR72']) },
  { name: 'Air Tahiti Nui', bases: [], fleet: createFleet(['B787']) },
  { name: 'Air Transat', bases: [], fleet: createFleet(['A321', 'A330']) },
  { name: 'Air Vanuatu', bases: [], fleet: createFleet(['B737', 'ATR72']) },
  { name: 'AirAsia', bases: [], fleet: createFleet(['A320', 'A321']) },
  { name: 'AirAsia X', bases: [], fleet: createFleet(['A330', 'A321']) }, // XLR on order not included as it's not a current type
  { name: 'Aircalin', bases: [], fleet: createFleet(['A320', 'A330']) },
  { name: 'Alaska Airlines', bases: [], fleet: createFleet(['B737', 'B737MAX', 'E175']) },
  { name: 'Alitalia', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330']) },
  { name: 'Allegiant', bases: [], fleet: createFleet(['A319', 'A320']) },
  { name: 'American Airlines', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'B737', 'B777', 'B787', 'E175']) },
  { name: 'ANA (All Nippon Airways)', bases: [], fleet: createFleet(['B737', 'B767', 'B777', 'B787', 'A320', 'A321', 'A380']) },
  { name: 'Asiana Airlines', bases: [], fleet: createFleet(['A320', 'A321', 'A350', 'B747', 'B767', 'B777']) },
  { name: 'Austrian Airlines', bases: [], fleet: createFleet(['A320', 'A321', 'B777', 'E195']) },
  { name: 'Azerbaijan Airlines', bases: [], fleet: createFleet(['A319', 'A320', 'A340', 'B767', 'B787']) },
  { name: 'Azores Airlines', bases: [], fleet: createFleet(['A320', 'A321', 'B737']) },
  { name: 'Azul', bases: [], fleet: createFleet(['A320', 'A330', 'E190', 'E195']) },
  { name: 'Bamboo Airways', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'B787']) },
  { name: 'Bangkok Airways', bases: [], fleet: createFleet(['A319', 'A320', 'ATR72']) },
  { name: 'British Airways', bases: [], fleet: createFleet(['A318', 'A319', 'A320', 'A321', 'A350', 'A380', 'B747', 'B777', 'B787']) },
  { name: 'Brussels Airlines', bases: [], fleet: createFleet(['A319', 'A320', 'A330']) },
  { name: 'Caribbean Airlines', bases: [], fleet: createFleet(['B737', 'ATR72']) },
  { name: 'Cathay Pacific', bases: [], fleet: createFleet(['A321', 'A330', 'A350', 'B777']) },
  { name: 'Cayman Airways', bases: [], fleet: createFleet(['B737', 'B737MAX']) },
  { name: 'CEBU Pacific Air', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'ATR72']) },
  { name: 'China Airlines', bases: [], fleet: createFleet(['A321', 'A330', 'A350', 'B737', 'B747', 'B777']) },
  { name: 'China Eastern', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A350', 'B737', 'B777', 'B787']) },
  { name: 'China Southern', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A350', 'A380', 'B737', 'B777', 'B787']) },
  { name: 'Condor', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'B767']) },
  { name: 'Copa Airlines', bases: [], fleet: createFleet(['B737', 'B737MAX', 'E190']) },
  { name: 'Croatia Airlines', bases: [], fleet: createFleet(['A319', 'A320', 'DH8D']) },
  { name: 'Czech Airlines', bases: [], fleet: createFleet(['A319', 'A320', 'A330']) },
  { name: 'Delta Air Lines', bases: [], fleet: createFleet(['A220', 'A319', 'A320', 'A321', 'A330', 'A350', 'B717', 'B737', 'B757', 'B767', 'B777']) },
  { name: 'easyJet', bases: [], fleet: createFleet(['A319', 'A320', 'A321']) },
  { name: 'Edelweiss Air', bases: [], fleet: createFleet(['A320', 'A340']) },
  { name: 'EgyptAir', bases: [], fleet: createFleet(['A220', 'A320', 'A321', 'A330', 'B737', 'B777', 'B787']) },
  { name: 'EL AL', bases: [], fleet: createFleet(['B737', 'B777', 'B787']) },
  { name: 'Emirates', bases: [], fleet: createFleet(['A380', 'B777']) },
  { name: 'Ethiopian Airlines', bases: [], fleet: createFleet(['B737', 'B777', 'B787', 'A350']) },
  { name: 'Etihad Airways', bases: [], fleet: createFleet(['A320', 'A321', 'A350', 'A380', 'B777', 'B787']) },
  { name: 'Eurowings', bases: [], fleet: createFleet(['A319', 'A320', 'A330', 'B777']) },
  { name: 'EVA Air', bases: [], fleet: createFleet(['A321', 'A330', 'B777', 'B787']) },
  { name: 'Fiji Airways', bases: [], fleet: createFleet(['A330', 'A350', 'B737', 'B737MAX']) },
  { name: 'Finnair', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A350', 'E190']) },
  { name: 'flydubai', bases: [], fleet: createFleet(['B737', 'B737MAX']) },
  { name: 'FlyOne', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'E190']) },
  { name: 'French bee', bases: [], fleet: createFleet(['A350']) },
  { name: 'Frontier Airlines', bases: [], fleet: createFleet(['A319', 'A320', 'A321']) },
  { name: 'Garuda Indonesia', bases: [], fleet: createFleet(['A330', 'B737', 'B777', 'B787']) },
  { name: 'Gol Linhas Aéreas', bases: [], fleet: createFleet(['B737', 'B737MAX']) },
  { name: 'Gulf Air', bases: [], fleet: createFleet(['A320', 'A321', 'B787']) },
  { name: 'Hainan Airlines', bases: [], fleet: createFleet(['A330', 'A350', 'B737', 'B787']) },
  { name: 'Hawaiian Airlines', bases: [], fleet: createFleet(['A321', 'A330', 'B717', 'B787']) },
  { name: 'Helvetic Airways', bases: [], fleet: createFleet(['E190', 'E195']) },
  { name: 'HK Express', bases: [], fleet: createFleet(['A320', 'A321']) },
  { name: 'Hong Kong Airlines', bases: [], fleet: createFleet(['A320', 'A330', 'A350']) },
  { name: 'Iberia', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A350']) },
  { name: 'Icelandair', bases: [], fleet: createFleet(['B737', 'B757', 'B767', 'B787']) },
  { name: 'IndiGo', bases: [], fleet: createFleet(['A320', 'A321', 'ATR72']) },
  { name: 'InterJet (defunct)', bases: [], fleet: createFleet(['A320', 'SSJ100']) },
  { name: 'Japan Airlines', bases: [], fleet: createFleet(['B737', 'B767', 'B777', 'B787', 'A350']) },
  { name: 'Jeju Air', bases: [], fleet: createFleet(['B737']) },
  { name: 'Jet2', bases: [], fleet: createFleet(['A321', 'B737', 'B757']) },
  { name: 'JetBlue', bases: [], fleet: createFleet(['A220', 'A320', 'A321', 'E190']) },
  { name: 'Jetstar (Australia)', bases: [], fleet: createFleet(['A320', 'A321', 'B787']) },
  { name: 'Jin Air', bases: [], fleet: createFleet(['B737', 'B777']) },
  { name: 'Kenya Airways', bases: [], fleet: createFleet(['B737', 'B787', 'E190']) },
  { name: 'KLM', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'B737', 'B777', 'B787', 'E175', 'E190']) },
  { name: 'Korean Air', bases: [], fleet: createFleet(['A220', 'A320', 'A321', 'A330', 'A380', 'B737', 'B747', 'B777', 'B787']) },
  { name: 'Kulula', bases: [], fleet: createFleet(['B737']) },
  { name: 'La Compagnie', bases: [], fleet: createFleet(['A321neo']) },
  { name: 'LATAM', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A350', 'B767', 'B777', 'B787']) },
  { name: 'Lion Air', bases: [], fleet: createFleet(['B737', 'B737MAX', 'ATR72']) },
  { name: 'LOT Polish Airlines', bases: [], fleet: createFleet(['B737', 'B787', 'E170', 'E175', 'E190', 'E195']) },
  { name: 'Lufthansa', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A340', 'A350', 'A380', 'B747', 'B787']) },
  { name: 'Luxair', bases: [], fleet: createFleet(['B737', 'DH8D', 'E190']) },
  { name: 'Malaysia Airlines', bases: [], fleet: createFleet(['A330', 'A350', 'B737']) },
  { name: 'Mango (defunct)', bases: [], fleet: createFleet(['B737']) },
  { name: 'Middle East Airlines', bases: [], fleet: createFleet(['A320', 'A321', 'A330']) },
  { name: 'Nok Air', bases: [], fleet: createFleet(['B737', 'ATR72']) },
  { name: 'Nordwind Airlines', bases: [], fleet: createFleet(['A321', 'A330', 'B737', 'B777']) },
  { name: 'Norwegian Air International', bases: [], fleet: createFleet(['B737', 'B787']) },
  { name: 'Norwegian Air Shuttle', bases: [], fleet: createFleet(['B737', 'B787']) },
  { name: 'Norwegian Air Sweden', bases: [], fleet: createFleet(['B737', 'B787']) },
  { name: 'Norwegian Air UK', bases: [], fleet: createFleet(['B737', 'B787']) },
  { name: 'Oman Air', bases: [], fleet: createFleet(['B737', 'B787', 'A330']) },
  { name: 'Pakistan International Airlines', bases: [], fleet: createFleet(['A320', 'A330', 'B777']) },
  { name: 'Peach Aviation', bases: [], fleet: createFleet(['A320']) },
  { name: 'Pegasus Airlines', bases: [], fleet: createFleet(['A320', 'A321', 'B737']) },
  { name: 'Philippine Airlines', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'A350', 'B777']) },
  { name: 'Porter Airlines', bases: [], fleet: createFleet(['E195']) },
  { name: 'Qantas', bases: [], fleet: createFleet(['A330', 'A380', 'B737', 'B787']) },
  { name: 'Qatar Airways', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'A350', 'A380', 'B777', 'B787']) },
  { name: 'Regional Express (Rex)', bases: [], fleet: createFleet(['B737', 'Saab340']) },
  { name: 'Rossiya Airlines', bases: [], fleet: createFleet(['A319', 'A320', 'B737', 'B747', 'B777']) },
  { name: 'Royal Air Maroc', bases: [], fleet: createFleet(['B737', 'B787', 'E190']) },
  { name: 'Royal Brunei Airlines', bases: [], fleet: createFleet(['A320', 'B787']) },
  { name: 'Royal Jordanian', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'E195']) },
  { name: 'RwandAir', bases: [], fleet: createFleet(['B737', 'B787', 'CRJ900']) },
  { name: 'Ryanair', bases: ['EIDW', 'EGSS'], fleet: createFleet(['B737']) },
  { name: 'S7 Airlines', bases: [], fleet: createFleet(['A320', 'A321', 'B737', 'B787']) },
  { name: 'SAS (Scandinavian Airlines)', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'A350', 'B737']) },
  { name: 'Saudia (Saudi Arabian Airlines)', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'B777', 'B787']) },
  { name: 'Scoot Airlines', bases: [], fleet: createFleet(['A320', 'B787']) },
  { name: 'Shanghai Airlines', bases: [], fleet: createFleet(['B737', 'B787']) },
  { name: 'SilkAir (merged into Singapore Airlines)', bases: [], fleet: createFleet(['A320', 'B737']) },
  { name: 'Singapore Airlines', bases: [], fleet: createFleet(['A350', 'A380', 'B777', 'B787']) },
  { name: 'South African Airways', bases: [], fleet: createFleet(['A320', 'A330', 'A340', 'A350']) },
  { name: 'Southwest Airlines', bases: [], fleet: createFleet(['B737']) },
  { name: 'SpiceJet', bases: [], fleet: createFleet(['B737', 'DH8D']) },
  { name: 'Spirit Airlines', bases: [], fleet: createFleet(['A319', 'A320', 'A321']) },
  { name: 'Spring Airlines', bases: [], fleet: createFleet(['A320']) },
  { name: 'SriLankan Airlines', bases: [], fleet: createFleet(['A320', 'A321', 'A330']) },
  { name: 'Sun Country Airlines', bases: [], fleet: createFleet(['B737']) },
  { name: 'Sunwing Airlines', bases: [], fleet: createFleet(['B737']) },
  { name: 'SWISS (Swiss International Air Lines)', bases: [], fleet: createFleet(['A220', 'A320', 'A330', 'A340', 'B777']) },
  { name: 'Swoop (merged into WestJet)', bases: [], fleet: createFleet(['B737']) },
  { name: 'TAAG Angola Airlines', bases: [], fleet: createFleet(['B737', 'B777']) },
  { name: 'TAP Portugal', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A321neo']) },
  { name: 'Thai Airways', bases: [], fleet: createFleet(['A320', 'A350', 'B777', 'B787']) },
  { name: 'Tigerair Australia (defunct)', bases: [], fleet: createFleet(['A320']) },
  { name: 'Transavia', bases: [], fleet: createFleet(['B737']) },
  { name: 'TUI Airways', bases: [], fleet: createFleet(['B737', 'B787']) },
  { name: 'Tunisair', bases: [], fleet: createFleet(['A319', 'A320', 'A330']) },
  { name: 'Turkish Airlines', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A350', 'B737', 'B777', 'B787']) },
  { name: 'Ukraine International Airlines', bases: [], fleet: createFleet(['B737', 'B767', 'B777']) },
  { name: 'United Airlines', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A350', 'B737', 'B757', 'B767', 'B777', 'B787']) },
  { name: 'Ural Airlines', bases: [], fleet: createFleet(['A319', 'A320', 'A321']) },
  { name: 'UTair Aviation', bases: [], fleet: createFleet(['B737', 'B767']) },
  { name: 'Uzbekistan Airways', bases: [], fleet: createFleet(['A320', 'B767', 'B787']) },
  { name: 'Vietnam Airlines', bases: [], fleet: createFleet(['A320', 'A321', 'A350', 'B787']) },
  { name: 'Virgin Atlantic', bases: [], fleet: createFleet(['A330', 'A350', 'B787']) },
  { name: 'Virgin Australia', bases: [], fleet: createFleet(['B737', 'B777', 'F100']) },
  { name: 'Vistara (merged into Air India)', bases: [], fleet: createFleet(['A320', 'A321', 'B787']) },
  { name: 'Viva Aerobus', bases: [], fleet: createFleet(['A320', 'A321']) },
  { name: 'Volaris', bases: [], fleet: createFleet(['A319', 'A320', 'A321']) },
  { name: 'Volotea', bases: [], fleet: createFleet(['A319', 'A320']) },
  { name: 'Vueling', bases: [], fleet: createFleet(['A319', 'A320', 'A321']) },
  { name: 'WestJet', bases: [], fleet: createFleet(['B737', 'B787', 'A220']) },
  { name: 'Wizz Air', bases: [], fleet: createFleet(['A320', 'A321']) },
  { name: 'Xiamen Airlines', bases: [], fleet: createFleet(['B737', 'B787']) },
];

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
      // Clear form
      setDepartureAirport('');
      setArrivalAirport('');
      setSelectedAirline('Icarion Virtual'); // Reset to default
      setAircraftType('');
      setAircraftRegistration('');
      setFlightNumber('');
      setEtd('');
      setEta('');
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