import { showError } from './toast';

// Placeholder for NOTAMs - real NOTAM APIs often require authentication or are region-specific.
export async function fetchNotams(icao: string): Promise<string[]> {
  // In a real application, you would integrate with a NOTAM API here.
  // Example: FAA NOTAM API, Eurocontrol API, etc.
  // These often require API keys and have specific query parameters.
  console.warn(`NOTAM fetching is a placeholder. No real NOTAMs fetched for ${icao}.`);
  return [
    `[Placeholder NOTAM for ${icao}] RWY 27L/09R CLOSED DUE TO WIP.`,
    `[Placeholder NOTAM for ${icao}] NAVAID VOR 'ABC' U/S.`,
    `[Placeholder NOTAM for ${icao}] ATC FREQ 123.45 CHANGED TO 123.65.`,
  ];
}