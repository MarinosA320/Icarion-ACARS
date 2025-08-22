import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { showSuccess, showError } from '@/utils/toast';
import { fetchMetar, fetchTaf, fetchNotams } from '@/utils/aviationApi';
import { Skeleton } from '@/components/ui/skeleton';
import FlightPathMap from '@/components/FlightPathMap'; // Reusing existing map component
import DynamicBackground from '@/components/DynamicBackground';

const ifrFlightPlanningBackgroundImages = [
  '/images/backgrounds/ifr-planning-bg.jpg', // Assuming you'll add this image
];

interface MetarData {
  rawText: string;
  stationId: string;
  observationTime: string;
  temp: { value: number; unit: string };
  dewpoint: { value: number; unit: string };
  wind: { speed: number; direction: string; unit: string };
  visibility: { value: number; unit: string };
  altimeter: { value: number; unit: string };
  flightCategory: string;
  clouds: Array<{ coverage: string; altitude: number; type?: string }>;
}

interface TafData {
  rawText: string;
  stationId: string;
  issueTime: string;
  forecast: Array<{
    period: { from: string; to: string };
    wind: { speed: number; direction: string; unit: string };
    visibility: { value: number; unit: string };
    clouds: Array<{ coverage: string; altitude: number; type?: string }>;
    changeIndicator?: string;
  }>;
}

const IfrFlightPlanning: React.FC = () => {
  const [departureIcao, setDepartureIcao] = useState('');
  const [arrivalIcao, setArrivalIcao] = useState('');
  const [route, setRoute] = useState('');
  const [loading, setLoading] = useState(false);

  const [depMetar, setDepMetar] = useState<MetarData | null>(null);
  const [depTaf, setDepTaf] = useState<TafData | null>(null);
  const [depNotams, setDepNotams] = useState<string[]>([]);

  const [arrMetar, setArrMetar] = useState<MetarData | null>(null);
  const [arrTaf, setArrTaf] = useState<TafData | null>(null);
  const [arrNotams, setArrNotams] = useState<string[]>([]);

  const [flightPlanObject, setFlightPlanObject] = useState<any | null>(null);
  const [flightPathGeoJSON, setFlightPathGeoJSON] = useState<any | null>(null);

  const handleGetBriefing = async () => {
    setLoading(true);
    setDepMetar(null);
    setDepTaf(null);
    setDepNotams([]);
    setArrMetar(null);
    setArrTaf(null);
    setArrNotams([]);
    setFlightPlanObject(null);
    setFlightPathGeoJSON(null);

    if (!departureIcao && !arrivalIcao) {
      showError('Please enter at least a Departure or Arrival ICAO.');
      setLoading(false);
      return;
    }

    try {
      const depIcaoUpper = departureIcao.toUpperCase();
      const arrIcaoUpper = arrivalIcao.toUpperCase();

      // Fetch Departure Airport Data
      if (depIcaoUpper) {
        const metar = await fetchMetar(depIcaoUpper);
        const taf = await fetchTaf(depIcaoUpper);
        const notams = await fetchNotams(depIcaoUpper);
        setDepMetar(metar);
        setDepTaf(taf);
        setDepNotams(notams);
      }

      // Fetch Arrival Airport Data
      if (arrIcaoUpper) {
        const metar = await fetchMetar(arrIcaoUpper);
        const taf = await fetchTaf(arrIcaoUpper);
        const notams = await fetchNotams(arrIcaoUpper);
        setArrMetar(metar);
        setArrTaf(taf);
        setArrNotams(notams);
      }

      // Build a simple ICAO flight plan object (placeholder for now)
      const fpl = {
        callsign: "N123AB",
        flight_rules: "IFR",
        aircraft: "C172", // Placeholder, ideally from user input
        equipment: "SDFGRY",
        dep: depIcaoUpper,
        dest: arrIcaoUpper,
        alts: [], // Placeholder
        route: route || "DIRECT",
        cruise: "F180", // Placeholder
        eet: "0000", // Placeholder
        dof: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
        remarks: "RMK/VIRTUAL FLIGHT",
      };
      setFlightPlanObject(fpl);

      // Generate a simple GeoJSON LineString for the route (placeholder)
      // In a real app, this would involve parsing the route string and geocoding waypoints.
      if (depIcaoUpper && arrIcaoUpper) {
        // For demonstration, we'll use dummy coordinates.
        // In a real scenario, you'd fetch airport coordinates.
        const dummyCoords = {
          'KLAX': [-118.4085, 33.9425], // Los Angeles
          'KJFK': [-73.7781, 40.6413],  // New York
          'KORD': [-87.9073, 41.9742],  // Chicago
          'EGLL': [-0.4543, 51.4700],   // London Heathrow
        };
        const depCoord = dummyCoords[depIcaoUpper as keyof typeof dummyCoords] || [-100, 40]; // Default to central US
        const arrCoord = dummyCoords[arrIcaoUpper as keyof typeof dummyCoords] || [-70, 40]; // Default to eastern US

        setFlightPathGeoJSON({
          type: "LineString",
          coordinates: [depCoord, arrCoord]
        });
      }


      showSuccess('Briefing data fetched!');
    } catch (error) {
      console.error('Error during briefing fetch:', error);
      showError('Failed to fetch briefing data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSkeletons = () => (
    <div className="space-y-8">
      <Skeleton className="h-8 w-1/2 mx-auto" />
      <Card className="shadow-md rounded-lg">
        <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
      <Card className="shadow-md rounded-lg">
        <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="relative min-h-screen flex flex-col">
      <DynamicBackground images={ifrFlightPlanningBackgroundImages} interval={10000} />
      <div className="fixed inset-0 bg-black opacity-50 z-0"></div>
      
      <div className="relative z-10 w-full max-w-5xl mx-auto text-white flex-grow flex flex-col items-center justify-start p-4 pt-24 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">IFR Flight Planning</h1>

        <Card className="max-w-3xl mx-auto mb-8 shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white">
          <CardHeader>
            <CardTitle>Plan Your IFR Flight</CardTitle>
            <CardDescription>Enter airport ICAO codes and your planned route to get a detailed briefing.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="departureIcao">Departure Airport (ICAO)</Label>
                <Input
                  id="departureIcao"
                  value={departureIcao}
                  onChange={(e) => setDepartureIcao(e.target.value.toUpperCase())}
                  placeholder="e.g., KLAX"
                  maxLength={4}
                />
              </div>
              <div>
                <Label htmlFor="arrivalIcao">Arrival Airport (ICAO)</Label>
                <Input
                  id="arrivalIcao"
                  value={arrivalIcao}
                  onChange={(e) => setArrivalIcao(e.target.value.toUpperCase())}
                  placeholder="e.g., KJFK"
                  maxLength={4}
                />
              </div>
              <div className="col-span-full">
                <Label htmlFor="route">Planned Route (Optional)</Label>
                <Textarea
                  id="route"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="e.g., KLAX V32 KPHX J10 KDEN"
                  rows={3}
                />
              </div>
            </div>
            <Button onClick={handleGetBriefing} className="w-full" disabled={loading}>
              {loading ? 'Generating Briefing...' : 'Get IFR Briefing'}
            </Button>
          </CardContent>
        </Card>

        {loading ? (
          renderSkeletons()
        ) : (depMetar || arrMetar || depNotams.length > 0 || arrNotams.length > 0 || flightPlanObject) && (
          <div className="space-y-8 w-full">
            <h2 className="text-2xl font-bold text-center">Detailed IFR Briefing</h2>

            {/* Departure Airport Briefing */}
            {(departureIcao && (depMetar || depTaf || depNotams.length > 0)) && (
              <Card className="shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white">
                <CardHeader>
                  <CardTitle>Departure Airport: {departureIcao.toUpperCase()}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {depMetar && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">METAR</h3>
                      <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded-md">{depMetar.rawText}</pre>
                    </div>
                  )}
                  {depTaf && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">TAF</h3>
                      <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded-md">{depTaf.rawText}</pre>
                    </div>
                  )}
                  {depNotams.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">NOTAMs</h3>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {depNotams.map((notam, index) => (
                          <li key={index}>{notam}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Arrival Airport Briefing */}
            {(arrivalIcao && (arrMetar || arrTaf || arrNotams.length > 0)) && (
              <Card className="shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white">
                <CardHeader>
                  <CardTitle>Arrival Airport: {arrivalIcao.toUpperCase()}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {arrMetar && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">METAR</h3>
                      <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded-md">{arrMetar.rawText}</pre>
                    </div>
                  )}
                  {arrTaf && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">TAF</h3>
                      <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded-md">{arrTaf.rawText}</pre>
                    </div>
                  )}
                  {arrNotams.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">NOTAMs</h3>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {arrNotams.map((notam, index) => (
                          <li key={index}>{notam}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ICAO Flight Plan Object */}
            {flightPlanObject && (
              <Card className="shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white">
                <CardHeader>
                  <CardTitle>Generated ICAO Flight Plan Object</CardTitle>
                  <CardDescription>This is a simplified representation for virtual flight planning.</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                    {JSON.stringify(flightPlanObject, null, 2)}
                  </pre>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: Actual IFR flight plan filing requires integration with official services like FAA Leidos FSS (US) or EUROCONTROL NM B2B (Europe), which involve complex authentication and approval processes. This application provides a simulated object for planning purposes.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Flight Path Map */}
            {flightPathGeoJSON && (
              <Card className="shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white">
                <CardHeader>
                  <CardTitle>Planned Flight Path</CardTitle>
                  <CardDescription>A visual representation of your planned route.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FlightPathMap geoJsonData={flightPathGeoJSON} />
                  <p className="text-xs text-muted-foreground mt-2">
                    Map data from OpenStreetMap contributors. Airway overlays and detailed charts are subject to copyright and licensing restrictions.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Additional Resources */}
            <Card className="shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white">
              <CardHeader>
                <CardTitle>Additional IFR Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Routing & Charts</h3>
                  <p className="text-muted-foreground">
                    Official IFR charts (e.g., Jeppesen, FAA) are copyrighted and cannot be freely embedded. For planning, consider these resources:
                  </p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li><a href="https://www.fly.faa.gov/rmt/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">FAA Preferred Route Database</a> (for US routes)</li>
                    <li><a href="https://www.openaip.net/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAIP</a> (free vector data for airports, navaids, airways, airspace)</li>
                    <li><a href="https://ourairports.com/data/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OurAirports</a> (CSV data for airports, frequencies, runways)</li>
                    <li>For US charts: <a href="https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/vfr_charts/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">FAA AeroNav Digital Charts</a></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default IfrFlightPlanning;