import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to format seconds to HH:MM
const formatSecondsToHHMM = (totalSeconds: number | undefined): string => {
  if (totalSeconds === undefined || totalSeconds < 0) return '';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Helper to format ISO string to YYYY-MM-DDTHH:MM for datetime-local input
const formatIsoToDateTimeLocal = (isoString: string | undefined): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    console.error("Error formatting ISO date:", e);
    return '';
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Edge Function: fetch-volanta-data invoked.');

  try {
    const { volantaUrl } = await req.json();

    if (!volantaUrl) {
      console.error('Invalid input: volantaUrl is required.');
      return new Response(JSON.stringify({ error: 'Invalid input: Volanta URL is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    let url: URL;
    try {
      url = new URL(volantaUrl);
      if (!url.hostname.includes('volanta.app')) {
        return new Response(JSON.stringify({ error: 'Invalid Volanta URL. Please provide a URL from fly.volanta.app.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    } catch (e) {
      console.error('Invalid Volanta URL format:', e);
      return new Response(JSON.stringify({ error: 'Invalid Volanta URL format.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`Edge Function: Fetching Volanta page from: ${volantaUrl}`);
    const response = await fetch(volantaUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edge Function: Volanta page fetch failed with status: ${response.status}, response: ${errorText}`);
      return new Response(JSON.stringify({ error: `Failed to fetch Volanta flight data: ${response.status}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }

    const html = await response.text();
    
    // Extract the __NEXT_DATA__ JSON
    const scriptTagRegex = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/;
    const match = html.match(scriptTagRegex);

    if (!match || !match[1]) {
      console.error('Could not find __NEXT_DATA__ script tag in Volanta page.');
      return new Response(JSON.stringify({ error: 'Could not parse Volanta flight data: Missing NEXT_DATA.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let nextData;
    try {
      nextData = JSON.parse(match[1]);
    } catch (parseError) {
      console.error('Error parsing __NEXT_DATA__ JSON:', parseError);
      return new Response(JSON.stringify({ error: 'Could not parse Volanta flight data: Invalid JSON in NEXT_DATA.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const flightData = nextData?.props?.pageProps?.flight;

    if (!flightData) {
      console.error('Flight data not found in __NEXT_DATA__:', nextData);
      return new Response(JSON.stringify({ error: 'Flight data not found on the Volanta page. Ensure it is a valid flight share URL.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const {
      departureIcao,
      arrivalIcao,
      aircraftIcao,
      callsign,
      flightTime, // in seconds
      landingRate,
      route,
      remarks,
      departureTime, // ISO string
      arrivalTime,   // ISO string
      airlineIcao,
      geojson,
    } = flightData;

    const responseData = {
      departureAirport: departureIcao || '',
      arrivalAirport: arrivalIcao || '',
      aircraftType: aircraftIcao || '',
      flightNumber: callsign || '',
      flightPlan: route || '',
      etd: formatIsoToDateTimeLocal(departureTime),
      eta: formatIsoToDateTimeLocal(arrivalTime),
      flightTime: formatSecondsToHHMM(flightTime),
      landingRate: landingRate !== undefined ? String(landingRate) : '',
      remarks: remarks || '',
      volantaTrackingLink: volantaUrl,
      flightPathGeoJSON: geojson || null,
      airlineIcao: airlineIcao || '', // Pass ICAO to map to full name on client
    };

    console.log('Edge Function: Parsed Volanta data:', responseData);
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function: Unhandled error during Volanta data processing:', error);
    return new Response(JSON.stringify({ error: `An unexpected error occurred in the Volanta data function: ${error.message || 'Unknown error'}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});