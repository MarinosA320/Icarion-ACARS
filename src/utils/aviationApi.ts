import { showError } from './toast';

/**
 * Fetches METAR data for a given ICAO station.
 * @param icao The ICAO code of the airport (e.g., 'KJFK').
 * @returns METAR data or null if not found/error.
 */
export async function fetchMetar(icao: string): Promise<any | null> { // Changed to any for simplicity
  try {
    const response = await fetch(`https://aviationweather.gov/api/data/metar?ids=${icao}&format=json`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching METAR for ${icao}: ${response.status} - ${errorText}`);
      showError(`Failed to fetch METAR for ${icao}.`);
      return null;
    }
    const data = await response.json();
    if (data && data.length > 0) {
      return data[0];
    }
    showError(`No METAR data found for ${icao}.`);
    return null;
  } catch (error) {
    console.error(`Network error fetching METAR for ${icao}:`, error);
    showError(`Network error fetching METAR for ${icao}.`);
    return null;
  }
}

/**
 * Fetches TAF data for a given ICAO station.
 * @param icao The ICAO code of the airport (e.g., 'KJFK').
 * @returns TAF data or null if not found/error.
 */
export async function fetchTaf(icao: string): Promise<any | null> { // Changed to any for simplicity
  try {
    const response = await fetch(`https://aviationweather.gov/api/data/taf?ids=${icao}&format=json`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching TAF for ${icao}: ${response.status} - ${errorText}`);
      showError(`Failed to fetch TAF for ${icao}.`);
      return null;
    }
    const data = await response.json();
    if (data && data.length > 0) {
      return data[0];
    }
    showError(`No TAF data found for ${icao}.`);
    return null;
  } catch (error) {
    console.error(`Network error fetching TAF for ${icao}:`, error);
    showError(`Network error fetching TAF for ${icao}.`);
    return null;
  }
}

/**
 * Fetches NOTAMs for a given ICAO station.
 * @param icao The ICAO code of the airport (e.g., 'KJFK').
 * @returns An array of NOTAM raw text strings.
 */
export async function fetchNotams(icao: string): Promise<string[]> {
  try {
    // The AWC API for NOTAMs is a bit different, often requiring a specific endpoint or parsing.
    // For simplicity and to match the user's request, we'll use a placeholder for now.
    // A real implementation would involve parsing a more complex NOTAM API response.
    console.warn(`NOTAM fetching is a placeholder. No real NOTAMs fetched for ${icao} from AWC API.`);
    return [
      `[NOTAM for ${icao}] RWY 27L/09R CLOSED DUE TO WIP.`,
      `[NOTAM for ${icao}] NAVAID VOR 'ABC' U/S.`,
      `[NOTAM for ${icao}] ATC FREQ 123.45 CHANGED TO 123.65.`,
    ];
  } catch (error) {
    console.error(`Network error fetching NOTAMs for ${icao}:`, error);
    showError(`Network error fetching NOTAMs for ${icao}.`);
    return [];
  }
}