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

// Define aircraft families for type ratings
export const AIRCRAFT_FAMILIES: { [key: string]: string } = {
  'C172': 'Cessna 172 Series',
  'DA40': 'Diamond DA40 Series',
  'DH8D': 'De Havilland Canada Dash 8 Series',
  'E190': 'Embraer E-Jet Family',
  'ATR42': 'ATR 42/72 Series',
  'ATR72': 'ATR 42/72 Series',
  'CRJ100': 'Bombardier CRJ Series',
  'CRJ200': 'Bombardier CRJ Series',
  'ERJ135': 'Embraer ERJ Family',
  'ERJ140': 'Embraer ERJ Family',
  'ERJ145': 'Embraer ERJ Family',
  'Saab340': 'Saab 340/2000 Series',
  'Saab2000': 'Saab 340/2000 Series',
  'Fokker50': 'Fokker 50/70/100 Series',
  'EMB120': 'Embraer EMB 120 Brasilia',
  'A220': 'Airbus A220 Family',
  'A220-100': 'Airbus A220 Family',
  'A220-300': 'Airbus A220 Family',
  'A318': 'Airbus A320 Family',
  'A319': 'Airbus A320 Family',
  'B717': 'Boeing 717',
  'B737': 'Boeing 737 Series',
  'B737MAX': 'Boeing 737 MAX Series',
  'E170': 'Embraer E-Jet Family',
  'E175': 'Embraer E-Jet Family',
  'E195': 'Embraer E-Jet Family',
  'SSJ100': 'Sukhoi Superjet 100',
  'A20N': 'Airbus A320neo Family',
  'A21N': 'Airbus A320neo Family',
  'A320': 'Airbus A320 Family',
  'A321': 'Airbus A320 Family',
  'B38M': 'Boeing 737 MAX Series',
  'B738': 'Boeing 737 Series',
  'B757': 'Boeing 757 Series',
  'B752': 'Boeing 757 Series',
  'CRJ700': 'Bombardier CRJ Series',
  'CRJ900': 'Bombardier CRJ Series',
  'CRJ1000': 'Bombardier CRJ Series',
  'M90': 'McDonnell Douglas MD-90',
  'A300': 'Airbus A300/A310 Series',
  'A310': 'Airbus A300/A310 Series',
  'A330': 'Airbus A330 Family',
  'A340': 'Airbus A340 Family',
  'A350': 'Airbus A350 Family',
  'A380': 'Airbus A380',
  'B707': 'Boeing 707',
  'B727': 'Boeing 727',
  'B747': 'Boeing 747 Series',
  'B767': 'Boeing 767 Series',
  'B777': 'Boeing 777 Series',
  'B787': 'Boeing 787 Dreamliner',
  'DC-10': 'McDonnell Douglas DC-10/MD-11 Series',
  'MD-11': 'McDonnell Douglas DC-10/MD-11 Series',
  'L-1011': 'Lockheed L-1011 TriStar',
  'C919': 'COMAC C919',
  'MC-21': 'Irkut MC-21',
  'A321neo': 'Airbus A320neo Family',
  'F100': 'Fokker 50/70/100 Series',
  'B737-300F': 'Boeing 737 Series',
  'B737-800BCF': 'Boeing 737 Series',
  'B747-400F': 'Boeing 747 Series',
  'B747-8F': 'Boeing 747 Series',
  'B767-300F': 'Boeing 767 Series',
  'B777F': 'Boeing 777 Series',
  'A300F': 'Airbus A300/A310 Series',
  'A310F': 'Airbus A300/A310 Series',
  'A330F': 'Airbus A330 Family',
  'DC-10F': 'McDonnell Douglas DC-10/MD-11 Series',
  'MD-11F': 'McDonnell Douglas DC-10/MD-11 Series',
  'An-124': 'Antonov An-124 Ruslan',
  'An-225': 'Antonov An-225 Mriya',
  'C-5': 'Lockheed C-5 Galaxy',
  'Il-76': 'Ilyushin Il-76',
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
  icao_code: string;
  bases: string[]; // ICAO codes of base airports
  fleet: Aircraft[];
}

// Helper to create a fleet from a list of types
const createFleet = (types: string[]): Aircraft[] => types.map(type => ({ type, registrations: [] }));

// Define ICARION_FLEET as it's used in ALL_AIRLINES
export const ICARION_FLEET: Aircraft[] = [
  { type: 'A320', registrations: ['G-ICAR', 'G-IONA'] },
  { type: 'B737', registrations: ['G-ICB1', 'G-ICB2'] },
  { type: 'A330', registrations: ['G-ICN1', 'G-ICN2'] },
  { type: 'B787', registrations: ['G-ICD1', 'G-ICD2'] },
  { type: 'C172', registrations: ['G-CESS'] },
];

// Helper function to check if user has the required type rating
export const hasTypeRating = (userTypeRatings: string[] | null, aircraftType: string): boolean => {
  if (!userTypeRatings || userTypeRatings.length === 0) {
    // If user has no type ratings, they can only fly aircraft that don't require one (e.g., C172, DA40)
    // If aircraft has no family defined, assume no type rating needed
    return !AIRCRAFT_FAMILIES[aircraftType]; 
  }
  const requiredFamily = AIRCRAFT_FAMILIES[aircraftType];
  if (!requiredFamily) {
    return true; // No specific type rating required for this aircraft
  }
  return userTypeRatings.includes(requiredFamily);
};

export const ALL_AIRLINES: Airline[] = [
  { name: 'Icarion Virtual', icao_code: 'ICN', bases: ['LGIR', 'LGAV', 'LGTS', 'EDLW', 'LMML', 'EDDL', 'EDDH', 'LIPZ'], fleet: ICARION_FLEET },
  { name: 'Aegean Airlines', icao_code: 'AEE', bases: ['LGAV', 'LGTS'], fleet: createFleet(['A320', 'A321', 'ATR72']) },
  { name: 'Aer Lingus', icao_code: 'EIN', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'A350', 'B757']) },
  { name: 'Aeroflot', icao_code: 'AFL', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'A350', 'B737', 'B777', 'SSJ100']) },
  { name: 'Aerolíneas Argentinas', icao_code: 'ARG', bases: [], fleet: createFleet(['B737', 'B737MAX', 'B787']) },
  { name: 'Aeroméxico', icao_code: 'AMX', bases: [], fleet: createFleet(['B737', '787', 'E190']) },
  { name: 'Air Arabia', icao_code: 'ABY', bases: [], fleet: createFleet(['A320', 'A321']) },
  { name: 'Air Astana', icao_code: 'KZR', bases: [], fleet: createFleet(['A320', 'A321', 'B767', 'B787', 'E190']) },
  { name: 'Air Austral', icao_code: 'REU', bases: [], fleet: createFleet(['B777', 'B787']) },
  { name: 'Air Baltic', icao_code: 'BTI', bases: [], fleet: createFleet(['A220']) },
  { name: 'Air Belgium', icao_code: 'ABB', bases: [], fleet: createFleet(['A330', 'A340']) },
  { name: 'Air Canada', icao_code: 'ACA', bases: [], fleet: createFleet(['A220', 'A319', 'A320', 'A321', 'A330', 'B737MAX', 'B777', 'B787', 'E190']) },
  { name: 'Air Caraïbes', icao_code: 'FWI', bases: [], fleet: createFleet(['A330', 'A350']) },
  { name: 'Air China', icao_code: 'CCA', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A350', 'B737', 'B747', 'B777', 'B787']) },
  { name: 'Air Corsica', icao_code: 'CCM', bases: [], fleet: createFleet(['A320', 'ATR72']) },
  { name: 'Air Dolomiti', icao_code: 'DLA', bases: [], fleet: createFleet(['E195']) },
  { name: 'Air Europa', icao_code: 'AEA', bases: [], fleet: createFleet(['B737', 'B787', 'E190', 'E195']) },
  { name: 'Air France', icao_code: 'AFR', bases: [], fleet: createFleet(['A318', 'A319', 'A320', 'A321', 'A330', 'A350', 'B777', 'B787']) },
  { name: 'Air India', icao_code: 'AIC', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'B747', 'B777', 'B787']) },
  { name: 'Air India Express', icao_code: 'AXB', bases: [], fleet: createFleet(['B737']) },
  { name: 'Air Macau', icao_code: 'AMU', bases: [], fleet: createFleet(['A320', 'A321']) },
  { name: 'Air Malta', icao_code: 'AMC', bases: [], fleet: createFleet(['A320']) },
  { name: 'Air Mauritius', icao_code: 'MAU', bases: [], fleet: createFleet(['A330', 'A350', 'ATR72']) },
  { name: 'Air Namibia', icao_code: 'NMB', bases: [], fleet: createFleet(['A319', 'A330']) },
  { name: 'Air New Zealand', icao_code: 'ANZ', bases: [], fleet: createFleet(['A320', 'A321', 'B777', 'B787', 'ATR72']) },
  { name: 'Air North', icao_code: 'ANT', bases: [], fleet: createFleet(['B737', 'ATR42', 'ATR72']) },
  { name: 'Air Seoul', icao_code: 'ASV', bases: [], fleet: createFleet(['A321']) },
  { name: 'Air Serbia', icao_code: 'ASL', bases: [], fleet: createFleet(['A319', 'A320', 'A330', 'ATR72']) },
  { name: 'Air Tahiti Nui', icao_code: 'THT', bases: [], fleet: createFleet(['B787']) },
  { name: 'Air Transat', icao_code: 'TSC', bases: [], fleet: createFleet(['A321', 'A330']) },
  { name: 'Air Vanuatu', icao_code: 'AVN', bases: [], fleet: createFleet(['B737', 'ATR72']) },
  { name: 'AirAsia', icao_code: 'AXM', bases: [], fleet: createFleet(['A320', 'A321']) },
  { name: 'AirAsia X', icao_code: 'XAX', bases: [], fleet: createFleet(['A330', 'A321']) }, // XLR on order not included as it's not a current type
  { name: 'Aircalin', icao_code: 'ACI', bases: [], fleet: createFleet(['A320', 'A330']) },
  { name: 'Alaska Airlines', icao_code: 'ASA', bases: [], fleet: createFleet(['B737', 'B737MAX', 'E175']) },
  { name: 'Alitalia', icao_code: 'AZA', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330']) },
  { name: 'Allegiant', icao_code: 'AAY', bases: [], fleet: createFleet(['A319', 'A320']) },
  { name: 'American Airlines', icao_code: 'AAL', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'B737', 'B777', 'B787', 'E175']) },
  { name: 'ANA (All Nippon Airways)', icao_code: 'ANA', bases: [], fleet: createFleet(['B737', 'B767', 'B777', 'B787', 'A320', 'A321', 'A380']) },
  { name: 'Asiana Airlines', icao_code: 'AAR', bases: [], fleet: createFleet(['A320', 'A321', 'A350', 'B747', 'B767', 'B777']) },
  { name: 'Austrian Airlines', icao_code: 'AUA', bases: [], fleet: createFleet(['A320', 'A321', 'B777', 'E195']) },
  { name: 'Azerbaijan Airlines', icao_code: 'AHY', bases: [], fleet: createFleet(['A319', 'A320', 'A340', 'B767', 'B787']) },
  { name: 'Azores Airlines', icao_code: 'RZO', bases: [], fleet: createFleet(['A320', 'A321', 'B737']) },
  { name: 'Azul', icao_code: 'AZU', bases: [], fleet: createFleet(['A320', 'A330', 'E190', 'E195']) },
  { name: 'Bamboo Airways', icao_code: 'BAV', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'B787']) },
  { name: 'Bangkok Airways', icao_code: 'BKP', bases: [], fleet: createFleet(['A319', 'A320', 'ATR72']) },
  { name: 'British Airways', icao_code: 'BAW', bases: [], fleet: createFleet(['A318', 'A319', 'A320', 'A321', 'A350', 'A380', 'B747', 'B757', 'B777', 'B787']) },
  { name: 'Brussels Airlines', icao_code: 'BEL', bases: [], fleet: createFleet(['A319', 'A320', 'A330']) },
  { name: 'Caribbean Airlines', icao_code: 'BWA', bases: [], fleet: createFleet(['B737', 'ATR72']) },
  { name: 'Cathay Pacific', icao_code: 'CPA', bases: [], fleet: createFleet(['A321', 'A330', 'A350', 'B777']) },
  { name: 'Cayman Airways', icao_code: 'CAY', bases: [], fleet: createFleet(['B737', 'B737MAX']) },
  { name: 'CEBU Pacific Air', icao_code: 'CEB', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'ATR72']) },
  { name: 'China Airlines', icao_code: 'CAL', bases: [], fleet: createFleet(['A321', 'A330', 'A350', 'B737', 'B747', 'B777']) },
  { name: 'China Eastern', icao_code: 'CES', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A350', 'B737', 'B777', 'B787']) },
  { name: 'China Southern', icao_code: 'CSN', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A350', 'A380', 'B737', 'B777', 'B787']) },
  { name: 'Condor', icao_code: 'CFG', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'B767']) },
  { name: 'Copa Airlines', icao_code: 'CMP', bases: [], fleet: createFleet(['B737', 'B737MAX', 'E190']) },
  { name: 'Croatia Airlines', icao_code: 'CTN', bases: [], fleet: createFleet(['A319', 'A320', 'DH8D']) },
  { name: 'Czech Airlines', icao_code: 'CSA', bases: [], fleet: createFleet(['A319', 'A320', 'A330']) },
  { name: 'Delta Air Lines', icao_code: 'DAL', bases: [], fleet: createFleet(['A220', 'A319', 'A320', 'A321', 'A330', 'A350', 'B717', 'B737', 'B757', 'B767', 'B777']) },
  { name: 'easyJet', icao_code: 'EZY', bases: [], fleet: createFleet(['A319', 'A320', 'A321']) },
  { name: 'Edelweiss Air', icao_code: 'EDW', bases: [], fleet: createFleet(['A320', 'A340']) },
  { name: 'EgyptAir', icao_code: 'MSR', bases: [], fleet: createFleet(['A220', 'A320', 'A321', 'A330', 'B737', 'B777', 'B787']) },
  { name: 'EL AL', icao_code: 'ELY', bases: [], fleet: createFleet(['B737', 'B777', 'B787']) },
  { name: 'Emirates', icao_code: 'UAE', bases: [], fleet: createFleet(['A380', 'B777']) },
  { name: 'Ethiopian Airlines', icao_code: 'ETH', bases: [], fleet: createFleet(['B737', 'B777', 'B787', 'A350']) },
  { name: 'Etihad Airways', icao_code: 'ETD', bases: [], fleet: createFleet(['A320', 'A321', 'A350', 'A380', 'B777', 'B787']) },
  { name: 'Eurowings', icao_code: 'EWG', bases: [], fleet: createFleet(['A319', 'A320', 'A330', 'B777']) },
  { name: 'EVA Air', icao_code: 'EVA', bases: [], fleet: createFleet(['A321', 'A330', 'B777', 'B787']) },
  { name: 'Fiji Airways', icao_code: 'FJI', bases: [], fleet: createFleet(['A330', 'A350', 'B737', 'B737MAX']) },
  { name: 'Finnair', icao_code: 'FIN', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A350', 'E190']) },
  { name: 'flydubai', icao_code: 'FDB', bases: [], fleet: createFleet(['B737', 'B737MAX']) },
  { name: 'FlyOne', icao_code: 'FOP', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'E190']) },
  { name: 'French bee', icao_code: 'FBU', bases: [], fleet: createFleet(['A350']) },
  { name: 'Frontier Airlines', icao_code: 'FFT', bases: [], fleet: createFleet(['A319', 'A320', 'A321']) },
  { name: 'Garuda Indonesia', icao_code: 'GIA', bases: [], fleet: createFleet(['A330', 'B737', 'B777', 'B787']) },
  { name: 'Gol Linhas Aéreas', icao_code: 'GLO', bases: [], fleet: createFleet(['B737', 'B737MAX']) },
  { name: 'Gulf Air', icao_code: 'GFA', bases: [], fleet: createFleet(['A320', 'A321', 'B787']) },
  { name: 'Hainan Airlines', icao_code: 'CHH', bases: [], fleet: createFleet(['A330', 'A350', 'B737', 'B787']) },
  { name: 'Hawaiian Airlines', icao_code: 'HAL', bases: [], fleet: createFleet(['A321', 'A330', 'B717', 'B787']) },
  { name: 'Helvetic Airways', icao_code: 'OAW', bases: [], fleet: createFleet(['E190', 'E195']) },
  { name: 'HK Express', icao_code: 'HKE', bases: [], fleet: createFleet(['A320', 'A321']) },
  { name: 'Hong Kong Airlines', icao_code: 'CRK', bases: [], fleet: createFleet(['A320', 'A330', 'A350']) },
  { name: 'Iberia', icao_code: 'IBE', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A350']) },
  { name: 'Icelandair', icao_code: 'ICE', bases: [], fleet: createFleet(['B737', 'B757', 'B767', 'B787']) },
  { name: 'IndiGo', icao_code: 'IGO', bases: [], fleet: createFleet(['A320', 'A321', 'ATR72']) },
  { name: 'InterJet (defunct)', icao_code: 'AIJ', bases: [], fleet: createFleet(['A320', 'SSJ100']) },
  { name: 'Japan Airlines', icao_code: 'JAL', bases: [], fleet: createFleet(['B737', 'B767', 'B777', 'B787', 'A350']) },
  { name: 'Jeju Air', icao_code: 'JJA', bases: [], fleet: createFleet(['B737']) },
  { name: 'Jet2', icao_code: 'EXS', bases: [], fleet: createFleet(['A321', 'B737', 'B757']) },
  { name: 'JetBlue', icao_code: 'JBU', bases: [], fleet: createFleet(['A220', 'A320', 'A321', 'E190']) },
  { name: 'Jetstar (Australia)', icao_code: 'JST', bases: [], fleet: createFleet(['A320', 'A321', 'B787']) },
  { name: 'Jin Air', icao_code: 'JNA', bases: [], fleet: createFleet(['B737', 'B777']) },
  { name: 'Kenya Airways', icao_code: 'KQA', bases: [], fleet: createFleet(['B737', 'B787', 'E190']) },
  { name: 'KLM', icao_code: 'KLM', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'B737', 'B777', 'B787', 'E175', 'E190']) },
  { name: 'Korean Air', icao_code: 'KAL', bases: [], fleet: createFleet(['A220', 'A320', 'A321', 'A330', 'A380', 'B737', 'B747', 'B777', 'B787']) },
  { name: 'Kulula', icao_code: 'CAW', bases: [], fleet: createFleet(['B737']) },
  { name: 'La Compagnie', icao_code: 'BCL', bases: [], fleet: createFleet(['A321neo']) },
  { name: 'LATAM', icao_code: 'LAN', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A350', 'B767', 'B777', 'B787']) },
  { name: 'Lion Air', icao_code: 'LNI', bases: [], fleet: createFleet(['B737', 'B737MAX', 'ATR72']) },
  { name: 'LOT Polish Airlines', icao_code: 'LOT', bases: [], fleet: createFleet(['B737', 'B787', 'E170', 'E175', 'E190', 'E195']) },
  { name: 'Lufthansa', icao_code: 'DLH', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A340', 'A350', 'A380', 'B747', 'B787']) },
  { name: 'Luxair', icao_code: 'LGL', bases: [], fleet: createFleet(['B737', 'DH8D', 'E190']) },
  { name: 'Malaysia Airlines', icao_code: 'MAS', bases: [], fleet: createFleet(['A330', 'A350', 'B737']) },
  { name: 'Mango (defunct)', icao_code: 'MNO', bases: [], fleet: createFleet(['B737']) },
  { name: 'Middle East Airlines', icao_code: 'MEA', bases: [], fleet: createFleet(['A320', 'A321', 'A330']) },
  { name: 'Nok Air', icao_code: 'NOK', bases: [], fleet: createFleet(['B737', 'DH8D']) },
  { name: 'Nordwind Airlines', icao_code: 'NWS', bases: [], fleet: createFleet(['A321', 'A330', 'B737', 'B777']) },
  { name: 'Norwegian Air International', icao_code: 'IBK', bases: [], fleet: createFleet(['B737', 'B787']) },
  { name: 'Norwegian Air Shuttle', icao_code: 'NAX', bases: [], fleet: createFleet(['B737', 'B787']) },
  { name: 'Norwegian Air Sweden', icao_code: 'NSW', bases: [], fleet: createFleet(['B737', 'B787']) },
  { name: 'Norwegian Air UK', icao_code: 'NUK', bases: [], fleet: createFleet(['B737', 'B787']) },
  { name: 'Oman Air', icao_code: 'OAS', bases: [], fleet: createFleet(['B737', 'B787', 'A330']) },
  { name: 'Pakistan International Airlines', icao_code: 'PIA', bases: [], fleet: createFleet(['A320', 'A330', 'B777']) },
  { name: 'Peach Aviation', icao_code: 'APJ', bases: [], fleet: createFleet(['A320']) },
  { name: 'Pegasus Airlines', icao_code: 'PGT', bases: [], fleet: createFleet(['A320', 'A321', 'B737']) },
  { name: 'Philippine Airlines', icao_code: 'PAL', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'A350', 'B777']) },
  { name: 'Porter Airlines', icao_code: 'POE', bases: [], fleet: createFleet(['E195']) },
  { name: 'Qantas', icao_code: 'QFA', bases: [], fleet: createFleet(['A330', 'A380', 'B737', 'B787']) },
  { name: 'Qatar Airways', icao_code: 'QTR', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'A350', 'A380', 'B777', 'B787']) },
  { name: 'Regional Express (Rex)', icao_code: 'RXA', bases: [], fleet: createFleet(['B737', 'Saab340']) },
  { name: 'Rossiya Airlines', icao_code: 'SDM', bases: [], fleet: createFleet(['A319', 'A320', 'B737', 'B747', 'B777']) },
  { name: 'Royal Air Maroc', icao_code: 'RAM', bases: [], fleet: createFleet(['B737', 'B787', 'E190']) },
  { name: 'Royal Brunei Airlines', icao_code: 'RBA', bases: [], fleet: createFleet(['A320', 'B787']) },
  { name: 'Royal Jordanian', icao_code: 'RJA', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'E195']) },
  { name: 'RwandAir', icao_code: 'RWD', bases: [], fleet: createFleet(['B737', 'B787', 'CRJ900']) },
  { name: 'Ryanair', icao_code: 'RYR', bases: ['EIDW', 'EGSS'], fleet: createFleet(['B737']) },
  { name: 'S7 Airlines', icao_code: 'SBI', bases: [], fleet: createFleet(['A320', 'A321', 'B737', 'B787']) },
  { name: 'SAS (Scandinavian Airlines)', icao_code: 'SAS', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'A350', 'B737']) },
  { name: 'Saudia (Saudi Arabian Airlines)', icao_code: 'SVA', bases: [], fleet: createFleet(['A320', 'A321', 'A330', 'B777', 'B787']) },
  { name: 'Scoot Airlines', icao_code: 'SCO', bases: [], fleet: createFleet(['A320', 'B787']) },
  { name: 'Shanghai Airlines', icao_code: 'CSH', bases: [], fleet: createFleet(['B737', 'B787']) },
  { name: 'SilkAir (merged into Singapore Airlines)', icao_code: 'SLK', bases: [], fleet: createFleet(['A320', 'B737']) },
  { name: 'Singapore Airlines', icao_code: 'SIA', bases: [], fleet: createFleet(['A350', 'A380', 'B777', 'B787']) },
  { name: 'South African Airways', icao_code: 'SAA', bases: [], fleet: createFleet(['A320', 'A330', 'A340', 'A350']) },
  { name: 'Southwest Airlines', icao_code: 'SWA', bases: [], fleet: createFleet(['B737']) },
  { name: 'SpiceJet', icao_code: 'SEJ', bases: [], fleet: createFleet(['B737', 'DH8D']) },
  { name: 'Spirit Airlines', icao_code: 'NKS', bases: [], fleet: createFleet(['A319', 'A320', 'A321']) },
  { name: 'Spring Airlines', icao_code: 'CSH', bases: [], fleet: createFleet(['A320']) }, // Note: CSH is also Shanghai Airlines, check if this is correct
  { name: 'SriLankan Airlines', icao_code: 'ALK', bases: [], fleet: createFleet(['A320', 'A321', 'A330']) },
  { name: 'Sun Country Airlines', icao_code: 'SCX', bases: [], fleet: createFleet(['B737']) },
  { name: 'Sunwing Airlines', icao_code: 'SWG', bases: [], fleet: createFleet(['B737']) },
  { name: 'SWISS (Swiss International Air Lines)', icao_code: 'SWR', bases: [], fleet: createFleet(['A220', 'A320', 'A330', 'A340', 'B777']) },
  { name: 'Swoop (merged into WestJet)', icao_code: 'WSW', bases: [], fleet: createFleet(['B737']) },
  { name: 'TAAG Angola Airlines', icao_code: 'DTA', bases: [], fleet: createFleet(['B737', 'B777']) },
  { name: 'TAP Portugal', icao_code: 'TAP', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A321neo']) },
  { name: 'Thai Airways', icao_code: 'THA', bases: [], fleet: createFleet(['A320', 'A350', 'B777', 'B787']) },
  { name: 'Tigerair Australia (defunct)', icao_code: 'TGW', bases: [], fleet: createFleet(['A320']) },
  { name: 'Transavia', icao_code: 'TRA', bases: [], fleet: createFleet(['B737']) },
  { name: 'TUI Airways', icao_code: 'TOM', bases: [], fleet: createFleet(['B737', 'B757', 'B787']) },
  { name: 'Tunisair', icao_code: 'TAS', bases: [], fleet: createFleet(['A319', 'A320', 'A330']) },
  { name: 'Turkish Airlines', icao_code: 'THY', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A330', 'A350', 'B737', 'B777', 'B787']) },
  { name: 'Ukraine International Airlines', icao_code: 'AUI', bases: [], fleet: createFleet(['B737', 'B767', 'B777']) },
  { name: 'United Airlines', icao_code: 'UAL', bases: [], fleet: createFleet(['A319', 'A320', 'A321', 'A350', 'B737', 'B757', 'B767', 'B777', 'B787']) },
  { name: 'Ural Airlines', icao_code: 'SVR', bases: [], fleet: createFleet(['A319', 'A320', 'A321']) },
  { name: 'UTair Aviation', icao_code: 'UTA', bases: [], fleet: createFleet(['B737', 'B767']) },
  { name: 'Uzbekistan Airways', icao_code: 'UZB', bases: [], fleet: createFleet(['A320', 'B767', 'B787']) },
  { name: 'Vietnam Airlines', icao_code: 'HVN', bases: [], fleet: createFleet(['A320', 'A321', 'A350', 'B787']) },
  { name: 'Virgin Atlantic', icao_code: 'VIR', bases: [], fleet: createFleet(['A330', 'A350', 'B787']) },
  { name: 'Virgin Australia', icao_code: 'VOZ', bases: [], fleet: createFleet(['B737', 'B777', 'F100']) },
  { name: 'Vistara (merged into Air India)', icao_code: 'VTI', bases: [], fleet: createFleet(['A320', 'A321', 'B787']) },
  { name: 'Viva Aerobus', icao_code: 'VIV', bases: [], fleet: createFleet(['A320', 'A321']) },
  { name: 'Volaris', icao_code: 'VOI', bases: [], fleet: createFleet(['A319', 'A320', 'A321']) },
  { name: 'Volotea', icao_code: 'VOE', bases: [], fleet: createFleet(['A319', 'A320']) },
  { name: 'Vueling', icao_code: 'VLG', bases: [], fleet: createFleet(['A319', 'A320', 'A321']) },
  { name: 'WestJet', icao_code: 'WJA', bases: [], fleet: createFleet(['B737', 'B787', 'A220']) },
  { name: 'Wizz Air', icao_code: 'WZZ', bases: [], fleet: createFleet(['A320', 'A321']) },
  { name: 'Xiamen Airlines', icao_code: 'CXA', bases: [], fleet: createFleet(['B737', 'B787']) },
];