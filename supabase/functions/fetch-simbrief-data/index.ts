import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to extract text content from an XML tag
const extractXmlTagContent = (xml: string, tagName: string): string | undefined => {
  const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, 's');
  const match = xml.match(regex);
  return match ? match[1].trim() : undefined;
};

// Helper to extract attribute from an XML tag (basic, for simple cases)
const extractXmlAttribute = (xml: string, tagName: string, attributeName: string): string | undefined => {
  const regex = new RegExp(`<${tagName}\\s+[^>]*?${attributeName}="(.*?)"`, 's');
  const match = xml.match(regex);
  return match ? match[1].trim() : undefined;
};

// Helper to convert SimBrief date format (e.g., "06 Aug 2025 - 14:50") to YYYY-MM-DDTHH:MM
const formatSimbriefDateTime = (simbriefDate: string | undefined): string => {
  if (!simbriefDate) return '';
  try {
    const parts = simbriefDate.split(' - ');
    if (parts.length !== 2) {
      console.warn("formatSimbriefDateTime: Invalid date format received:", simbriefDate);
      return '';
    }

    const datePart = parts[0];
    const timePart = parts[1];

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

// Helper to convert Zulu date format (YYYYMMDDHHMM) to YYYY-MM-DDTHH:MM
const formatZuluDateTime = (zuluDate: string | undefined): string => {
  if (!zuluDate || zuluDate.length !== 12) return '';
  const year = zuluDate.substring(0, 4);
  const month = zuluDate.substring(4, 6);
  const day = zuluDate.substring(6, 8);
  const hour = zuluDate.substring(8, 10);
  const minute = zuluDate.substring(10, 12);
  return `${year}-${month}-${day}T${hour}:${minute}`;
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
      return new Response(JSON.stringify({ error: 'Invalid input: SimBrief URL is required.' }), {
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

    let responseData = {
      departureAirport: '',
      arrivalAirport: '',
      aircraftType: '',
      flightNumber: '',
      flightPlan: '',
      etd: '',
      eta: '',
      aircraftRegistration: '',
      airlineIcao: '',
      actualFuelBurnKg: '',
      averageAltitudeFt: '',
      averageSpeedKts: '',
      maxPitchDeg: '',
      maxBankDeg: '',
      weatherSource: '',
    };

    if (url.pathname.includes('dispatch.php')) {
      // Handle Dispatch Options URL
      const params = new URLSearchParams(url.search);

      responseData.departureAirport = params.get('orig')?.toUpperCase() || '';
      responseData.arrivalAirport = params.get('dest')?.toUpperCase() || '';
      responseData.aircraftType = params.get('basetype')?.toUpperCase() || '';
      responseData.flightNumber = params.get('fltnum')?.toUpperCase() || '';
      responseData.flightPlan = decodeURIComponent(params.get('route') || '').replace(/\+/g, ' ');
      responseData.etd = formatSimbriefDateTime(params.get('date'));
      responseData.aircraftRegistration = params.get('reg')?.toUpperCase() || '';
      responseData.airlineIcao = params.get('airline')?.toUpperCase() || '';
      // ETA and other monitoring fields are not directly in dispatch URL
      console.log('Edge Function: Parsed SimBrief Dispatch data:', responseData);

    } else if (url.pathname.includes('xml.php')) {
      // Handle OFP XML URL
      console.log('Edge Function: Fetching SimBrief OFP XML from:', simbriefUrl);
      const xmlResponse = await fetch(simbriefUrl);

      if (!xmlResponse.ok) {
        const errorText = await xmlResponse.text();
        console.error(`Edge Function: SimBrief OFP XML fetch failed with status: ${xmlResponse.status}, response: ${errorText}`);
        return new Response(JSON.stringify({ error: `Failed to fetch SimBrief OFP XML: ${xmlResponse.status}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: xmlResponse.status,
        });
      }

      const xmlText = await xmlResponse.text();
      console.log('Edge Function: Successfully fetched SimBrief OFP XML.');

      // Basic XML parsing using string manipulation
      responseData.airlineIcao = extractXmlTagContent(xmlText, 'icao_airline')?.toUpperCase() || '';
      responseData.aircraftType = extractXmlTagContent(xmlText, 'icao_aircraft')?.toUpperCase() || '';
      responseData.flightNumber = extractXmlTagContent(xmlText, 'flight_number')?.toUpperCase() || '';
      responseData.departureAirport = extractXmlTagContent(xmlText, 'origin_icao')?.toUpperCase() || '';
      responseData.arrivalAirport = extractXmlTagContent(xmlText, 'destination_icao')?.toUpperCase() || '';
      responseData.aircraftRegistration = extractXmlTagContent(xmlText, 'reg')?.toUpperCase() || '';
      responseData.flightPlan = extractXmlTagContent(xmlText, 'route') || '';
      responseData.etd = formatZuluDateTime(extractXmlTagContent(xmlText, 'etd_zulu'));
      responseData.eta = formatZuluDateTime(extractXmlTagContent(xmlText, 'eta_zulu'));

      // Extract new monitoring fields from XML
      responseData.actualFuelBurnKg = extractXmlTagContent(xmlText, 'burn') || '';
      responseData.averageAltitudeFt = extractXmlTagContent(xmlText, 'avg_alt') || '';
      // SimBrief OFP often gives avg_mach, convert to kts if possible, or leave as is
      const avgMach = extractXmlTagContent(xmlText, 'avg_mach');
      if (avgMach) {
        // A very rough conversion from Mach to IAS/TAS at typical cruise altitudes
        // This is a simplification; real conversion needs altitude and temperature.
        // Mach 0.78 is roughly 450-500 kts TAS. Let's just store Mach for now or a rough estimate.
        // For simplicity, I'll just store the Mach number as a string for now, or leave empty.
        // If the user wants to input speed in KTS, they can do so.
        // For now, I'll leave averageSpeedKts empty as direct conversion is complex.
      }
      // Max pitch/bank are not typically in SimBrief OFP XML
      responseData.weatherSource = 'SimBrief OFP'; // Indicate source

      console.log('Edge Function: Parsed SimBrief OFP XML data:', responseData);

    } else {
      return new Response(JSON.stringify({ error: 'Unsupported SimBrief URL format. Please provide a Dispatch Options URL or an OFP XML URL.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ error: `An unexpected error occurred in the SimBrief data function: ${error.message || 'Unknown error'}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});