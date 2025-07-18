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

  console.log('Edge Function: get-user-emails invoked.'); // Added for debugging and to force redeployment

  try {
    const { user_ids } = await req.json();

    if (!user_ids || !Array.isArray(user_ids)) {
      return new Response(JSON.stringify({ error: 'Invalid input: user_ids array required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Use auth.admin.listUsers() to fetch user data, which includes email
    const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users from auth.admin.listUsers:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const userEmails: { [key: string]: string } = {};
    if (usersData && usersData.users) {
      usersData.users.forEach(user => {
        if (user_ids.includes(user.id) && user.email) {
          userEmails[user.id] = user.email;
        }
      });
    }

    return new Response(JSON.stringify(userEmails), {
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