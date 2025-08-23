import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Edge Function: update-live-flight invoked.');

  try {
    const {
      user_id,
      flight_id, // Optional, can be null if not linked to a specific logged flight
      callsign,
      aircraft_type,
      departure_airport,
      arrival_airport,
      current_latitude,
      current_longitude,
      current_altitude_ft,
      current_speed_kts,
      heading_deg,
      is_active = true, // Default to active
    } = await req.json();

    // Basic validation
    if (!user_id || !callsign || !aircraft_type || current_latitude === undefined || current_longitude === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required flight data fields.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create a Supabase client with the service role key
    // This allows the function to bypass RLS and update any user's live_flights entry
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabaseAdmin
      .from('live_flights')
      .upsert(
        {
          user_id,
          flight_id,
          callsign,
          aircraft_type,
          departure_airport,
          arrival_airport,
          current_latitude,
          current_longitude,
          current_altitude_ft,
          current_speed_kts,
          heading_deg,
          last_updated_at: new Date().toISOString(),
          is_active,
        },
        {
          onConflict: 'user_id, callsign', // Conflict on user_id and callsign to update existing flight
          ignoreDuplicates: false,
        }
      )
      .select(); // Select the updated/inserted row

    if (error) {
      console.error('Error upserting live flight data:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Live flight data upserted successfully:', data);
    return new Response(JSON.stringify({ message: 'Live flight data updated successfully.', data }), {
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