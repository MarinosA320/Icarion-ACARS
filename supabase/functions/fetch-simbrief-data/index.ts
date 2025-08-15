import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to convert SimBrief date format (e.g., "06 Aug 2025 - 14:50") to YYYY-MM-DDTHH:MM
const formatSimbriefDateTime = (simbriefDate: string | undefined): string => {
  if (!simbriefDate) return '';
  try {
    // Example: "06 Aug 2025 - 14:50"
    const parts = simbriefDate.split(' - ');
    if (parts.length !== 2) {
      console.warn("formatSimbriefDateTime: Invalid date format received:", simbriefDate);
      return '';
    }

    const datePart = parts[0]; // "06 Aug 2025"
    const timePart = parts[1]; // "14:50"

    const [day, monthStr, year] = datePart.split(' ');
    const monthMap: { [key: string]: string } = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
    };
    const month = monthMap[monthStr];

    if (!month) {
      console.warn("formatSimbriefDateTime: Unrecognized month string:", monthStr);
      return '';
    }

    return `${year}-${month}-${day.padStart(2, '0')}T${timePart}`;
  } catch (e) {
    console.error("Error parsing SimBrief date:", e);
    return '';
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Edge Function: fetch-simbrief-data invoked.');

  try {
    const { simbriefUrl } = await req.json();

    if (!simbriefUrl) {
      console.error('Invalid input: simbriefUrl is required.');
      return new Response(JSON.stringify({ error: 'Invalid input: simbriefUrl is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    let url: URL;
    try {
      url = new URL(simbriefUrl);
    } catch (e) {
      console.error('Invalid SimBrief URL format:', e);
      return new Response(JSON.stringify({ error: 'Invalid SimBrief URL format.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    const params = new URLSearchParams(url.search);

    // Use defensive access with default empty strings
    const departure = params.get('orig')?.toUpperCase() || '';
    const arrival = params.get('dest')?.toUpperCase() || '';
    const aircraftType = params.get('basetype')?.toUpperCase() || '';
    const flightNumber = params.get('fltnum')?.toUpperCase() || '';
    const route = decodeURIComponent(params.get('route') || '').replace(/\+/g, ' '); // Decode and replace '+' with space
    const date = params.get('date') || '';
    const registration = params.get('reg')?.toUpperCase() || '';
    const airlineIcao = params.get('airline')?.toUpperCase() || '';

    const etd = formatSimbriefDateTime(date);
    // ETA is not directly in the URL, so we'll leave it empty for now.
    // In a more advanced integration, you'd fetch the OFP XML for precise times.

    const responseData = {
      departureAirport: departure,
      arrivalAirport: arrival,
      aircraftType: aircraftType,
      flightNumber: flightNumber,
      flightPlan: route,
      etd: etd,
      eta: '', // ETA is not directly available in the URL params
      aircraftRegistration: registration,
      airlineIcao: airlineIcao, // Pass ICAO to map to full name on client
    };

    console.log('Edge Function: Parsed SimBrief data:', responseData);
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});