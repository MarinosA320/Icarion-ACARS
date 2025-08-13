// Define rank hierarchy for comparison
export const RANK_ORDER: { [key: string]: number } = {
  'Visitor': 0, // New lowest rank
  'Trainee': 1,
  'First Officer': 2,
  'Captain': 3,
};

// Define minimum rank required for each aircraft type
export const AIRCRAFT_MIN_RANKS: { [key: string]: string } = {
  // General Aviation (Visitor+)
  'C172': 'Visitor', // Cessna 172
  'DA40': 'Visitor', // Diamond DA40

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
  'CRJ700': 'First Officer', 'CRJ900': 'CRJ900', 'CRJ1000': 'First Officer',
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
export const hasRequiredRank = (userRank: string, requiredRank: string): boolean => {
  return RANK_ORDER[userRank] >= RANK_ORDER[requiredRank];
};

export interface Aircraft {
  type: string;
  registrations: string[];
}

export interface Airline {
  name: string;
  bases: string[]; // ICAO codes of base airports
  fleet: Aircraft[];
}

// Define aircraft families for type ratings
export const AIRCRAFT_FAMILIES: { [icaoType: string]: string } = {
  'A318': 'A320_FAMILY', 'A319': 'A320_FAMILY', 'A320': 'A320_FAMILY', 'A321': 'A320_FAMILY', 'A20N': 'A320_FAMILY', 'A21N': 'A320_FAMILY', 'A321neo': 'A320_FAMILY',
  'A220': 'A220_FAMILY', 'A220-100': 'A220_FAMILY', 'A220-300': 'A220_FAMILY',
  'A330': 'A330_FAMILY', 'A330F': 'A330_FAMILY',
  'A340': 'A340_FAMILY',
  'A350': 'A350_FAMILY',
  'A380': 'A380_FAMILY',
  'B737': 'B737_FAMILY', 'B737MAX': 'B737_FAMILY', 'B38M': 'B737_FAMILY', 'B738': 'B737_FAMILY', 'B737-300F': 'B737_FAMILY', 'B737-800BCF': 'B737_FAMILY',
  'B747': 'B747_FAMILY', 'B747-400F': 'B747_FAMILY', 'B747-8F': 'B747_FAMILY',
  'B757': 'B757_FAMILY', 'B752': 'B757_FAMILY',
  'B767': 'B767_FAMILY', 'B767-300F': 'B767_FAMILY',
  'B777': 'B777_FAMILY', 'B777F': 'B777_FAMILY',
  'B787': 'B787_FAMILY',
  'CRJ100': 'CRJ_FAMILY', 'CRJ200': 'CRJ_FAMILY', 'CRJ700': 'CRJ_FAMILY', 'CRJ900': 'CRJ_FAMILY', 'CRJ1000': 'CRJ_FAMILY',
  'E170': 'EMBRAER_EJET_FAMILY', 'E175': 'EMBRAER_EJET_FAMILY', 'E190': 'EMBRAER_EJET_FAMILY', 'E195': 'EMBRAER_EJET_FAMILY',
  'ERJ135': 'EMBRAER_ERJ_FAMILY', 'ERJ140': 'EMBRAER_ERJ_FAMILY', 'ERJ145': 'EMBRAER_ERJ_FAMILY', 'EMB120': 'EMBRAER_ERJ_FAMILY',
  'ATR42': 'ATR_FAMILY', 'ATR72': 'ATR_FAMILY',
  'DH8D': 'DASH8_FAMILY',
  'SSJ100': 'SSJ100_FAMILY',
  'M90': 'MD90_FAMILY',
  'DC-10': 'DC10_FAMILY', 'MD-11': 'DC10_FAMILY', 'DC-10F': 'DC10_FAMILY', 'MD-11F': 'DC10_FAMILY',
  'L-1011': 'L1011_FAMILY',
  'C919': 'C919_FAMILY',
  'MC-21': 'MC21_FAMILY',
  'F100': 'FOKKER_FAMILY', 'Fokker50': 'FOKKER_FAMILY',
  'Saab340': 'SAAB_FAMILY', 'Saab2000': 'SAAB_FAMILY',
  'An-124': 'ANTONOV_FAMILY', 'An-225': 'ANTONOV_FAMILY',
  'C-5': 'C5_FAMILY',
  'Il-76': 'IL76_FAMILY',
  'MEP_IR_RATING': 'MEP_IR_RATING', // Added MEP IR Rating as a distinct family
};

export const hasTypeRating = (userTypeRatings: string[] | null, aircraftType: string): boolean => {
  if (!userTypeRatings || userTypeRatings.length === 0) {
    // If an aircraft type is not explicitly listed in AIRCRAFT_FAMILIES,
    // it means it doesn't require a specific type rating.
    // This is for generic or very small aircraft not part of the VA's core fleet.
    if (!AIRCRAFT_FAMILIES[aircraftType]) {
      return true;
    }
    return false;
  }
  const requiredFamily = AIRCRAFT_FAMILIES[aircraftType];
  if (!requiredFamily) {
    return true; // No specific type rating required for this aircraft
  }
  return userTypeRatings.includes(requiredFamily);
};

export const ICARION_FLEET: Aircraft[] = [
  { type: 'C172', registrations: ['N172SP', 'N172VA'] }, // Cessna 172 for Visitors
  { type: 'DA40', registrations: ['N40VA', 'N40SP'] }, // Diamond DA40 for Visitors
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

export const ALL_AIRLINES: Airline[] = [
  { name: 'Icarion Virtual', bases: ['LGIR', 'LGAV', 'LGTS', 'EDLW', 'LMML', 'EDDL', 'EDDH', 'LIPZ'], fleet: ICARION_FLEET },
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
  { name: 'British Airways', bases: [], fleet: createFleet(['A318', 'A319', 'A320', 'A321', 'A350', 'A380', 'B747', 'B757', 'B777', 'B787']) },
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
  { name: 'Nok Air', bases: [], fleet: createFleet(['B737', 'DH8D']) },
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
  { name: 'TUI Airways', bases: [], fleet: createFleet(['B737', 'B757', 'B787']) },
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