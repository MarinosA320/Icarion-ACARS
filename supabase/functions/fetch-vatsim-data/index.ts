import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Edge Function: fetch-vatsim-data invoked.');

  try {
    const { cid: rawCid } = await req.json(); // Get raw CID as string

    if (!rawCid) {
      return new Response(JSON.stringify({ error: 'Invalid input: CID is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const cid = parseInt(rawCid, 10); // Convert CID to number
    if (isNaN(cid)) {
      return new Response(JSON.stringify({ error: 'Invalid input: CID must be a number.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`Edge Function: Fetching VATSIM data for CID: ${cid}`);
    const vatsimResponse = await fetch('https://data.vatsim.net/v3/vatsim-data.json');

    if (!vatsimResponse.ok) {
      const errorText = await vatsimResponse.text();
      console.error(`Edge Function: VATSIM data fetch failed with status: ${vatsimResponse.status}, response: ${errorText}`);
      return new Response(JSON.stringify({ error: `Failed to fetch VATSIM data from external API: ${vatsimResponse.status}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: vatsimResponse.status,
      });
    }

    const data = await vatsimResponse.json();
    console.log('Edge Function: Successfully fetched VATSIM data. Total pilots:', data.pilots.length);

    // Ensure comparison is between numbers
    const pilot = data.pilots.find((p: any) => p.cid === cid);

    if (!pilot) {
      console.log(`Edge Function: No active VATSIM flight found for CID: ${cid}.`);
      return new Response(JSON.stringify({ error: `No active VATSIM flight found for CID: ${cid}. Please ensure you are connected to VATSIM.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    if (!pilot.flight_plan) {
      console.log(`Edge Function: Pilot found for CID: ${cid}, but no flight plan data available.`);
      return new Response(JSON.stringify({ error: `Pilot found, but no active flight plan for CID: ${cid}. Please ensure you have filed a flight plan on VATSIM.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Extract additional flight plan details
    const {
      aircraft_icao,
      departure,
      arrival,
      route,
      planned_dep_time, // YYYYMMDDHHMM
      planned_eta,      // YYYYMMDDHHMM
      planned_tasc,     // Total estimated enroute time in minutes
    } = pilot.flight_plan;

    const responseData = {
      cid: pilot.cid,
      callsign: pilot.callsign,
      flight_plan: {
        aircraft_icao,
        departure,
        arrival,
        route,
        planned_dep_time,
        planned_eta,
        planned_tasc,
      },
    };

    console.log(`Edge Function: Found VATSIM pilot data for CID ${cid}:`, responseData);
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