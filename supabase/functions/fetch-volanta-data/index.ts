import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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

  console.log('DYAD_LOG: Edge Function: fetch-volanta-data invoked.');

  try {
    const { volantaUrl } = await req.json();

    if (!volantaUrl) {
      console.error('DYAD_LOG: Invalid input: volantaUrl is required.');
      return new Response(JSON.stringify({ error: 'Invalid input: Volanta URL is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    let url: URL;
    try {
      url = new URL(volantaUrl);
      if (!url.hostname.includes('volanta.app')) {
        console.error('DYAD_LOG: Invalid Volanta URL hostname.');
        return new Response(JSON.stringify({ error: 'Invalid Volanta URL. Please provide a URL from fly.volanta.app.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    } catch (e) {
      console.error('DYAD_LOG: Invalid Volanta URL format caught:', e);
      return new Response(JSON.stringify({ error: 'Invalid Volanta URL format.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`DYAD_LOG: Fetching Volanta page from: ${volantaUrl}`);
    const response = await fetch(volantaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DYAD_LOG: Volanta page fetch failed with status: ${response.status}, response: ${errorText}`);
      return new Response(JSON.stringify({ error: `Failed to fetch Volanta data from external API: ${response.status}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }

    const html = await response.text();
    console.log(`DYAD_LOG: Fetched HTML length: ${html.length}`);
    
    // Extract the __NEXT_DATA__ JSON
    const scriptTagRegex = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/;
    const match = html.match(scriptTagRegex);
    console.log(`DYAD_LOG: Regex match result: ${match ? 'Found' : 'Not Found'}`);

    if (!match || !match[1]) {
      console.error('DYAD_LOG: Could not find __NEXT_DATA__ script tag in Volanta page or content empty.');
      return new Response(JSON.stringify({ error: 'Could not parse Volanta flight data: Missing NEXT_DATA.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let nextData;
    try {
      nextData = JSON.parse(match[1]);
      console.log('DYAD_LOG: Successfully parsed __NEXT_DATA__ JSON.');
    } catch (parseError) {
      console.error('DYAD_LOG: Error parsing __NEXT_DATA__ JSON:', parseError);
      return new Response(JSON.stringify({ error: 'Could not parse Volanta flight data: Invalid JSON in NEXT_DATA.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const flightData = nextData?.props?.pageProps?.flight;
    console.log(`DYAD_LOG: Flight data found: ${flightData ? 'Yes' : 'No'}`);

    if (!flightData) {
      console.error('DYAD_LOG: Flight data not found in __NEXT_DATA__ props.');
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

    console.log('DYAD_LOG: Successfully extracted Volanta data.');
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('DYAD_LOG: Edge Function: Unhandled error during Volanta data processing:', error);
    return new Response(JSON.stringify({ error: `An unexpected error occurred in the Volanta data function: ${error.message || 'Unknown error'}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});