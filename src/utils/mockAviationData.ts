// src/utils/mockAviationData.ts

interface Airport {
  icao: string;
  name: string;
  lat: number;
  lng: number;
}

interface Navaid {
  id: string;
  name: string;
  type: 'VOR' | 'NDB';
  lat: number;
  lng: number;
}

export const mockAirports: Airport[] = [
  { icao: 'LGAV', name: 'Athens Intl', lat: 37.9364, lng: 23.9493 },
  { icao: 'LGTS', name: 'Thessaloniki Makedonia', lat: 40.5197, lng: 22.9709 },
  { icao: 'LGIR', name: 'Heraklion Nikos Kazantzakis', lat: 35.3393, lng: 25.1801 },
  { icao: 'EDDM', name: 'Munich Intl', lat: 48.3538, lng: 11.7861 },
  { icao: 'EGLL', name: 'London Heathrow', lat: 51.4700, lng: -0.4543 },
  { icao: 'KJFK', name: 'New York JFK', lat: 40.6413, lng: -73.7781 },
  { icao: 'KLAX', name: 'Los Angeles Intl', lat: 33.9416, lng: -118.4085 },
];

export const mockNavaids: Navaid[] = [
  { id: 'ATH', name: 'Athens VOR', type: 'VOR', lat: 37.9364, lng: 23.9493 }, // Co-located with LGAV for simplicity
  { id: 'SKG', name: 'Thessaloniki VOR', type: 'VOR', lat: 40.5197, lng: 22.9709 }, // Co-located with LGTS
  { id: 'HER', name: 'Heraklion VOR', type: 'VOR', lat: 35.3393, lng: 25.1801 }, // Co-located with LGIR
  { id: 'MUC', name: 'Munich VOR', type: 'VOR', lat: 48.3538, lng: 11.7861 }, // Co-located with EDDM
  { id: 'LON', name: 'London VOR', type: 'VOR', lat: 51.4700, lng: -0.4543 }, // Co-located with EGLL
  { id: 'JFK', name: 'JFK VOR', type: 'VOR', lat: 40.6413, lng: -73.7781 }, // Co-located with KJFK
  { id: 'LAX', name: 'LAX VOR', type: 'VOR', lat: 33.9416, lng: -118.4085 }, // Co-located with KLAX
  { id: 'ABC', name: 'Alpha NDB', type: 'NDB', lat: 38.5, lng: 23.0 },
  { id: 'DEF', name: 'Delta NDB', type: 'NDB', lat: 41.0, lng: 22.0 },
];