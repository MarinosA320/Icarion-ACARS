import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { showSuccess, showError } from '@/utils/toast';
import { fetchNotams } from '@/utils/aviationApi';
import { useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import DynamicBackground from '@/components/DynamicBackground';

const flightBriefingBackgroundImages = [
  '/images/backgrounds/briefing.jpg', // Corrected path: removed redundant .jpg
];

const FlightBriefing = () => {
  const location = useLocation();
  const initialDepartureIcao = location.state?.initialDepartureIcao || '';
  const initialArrivalIcao = location.state?.initialArrivalIcao || '';

  const [departureIcao, setDepartureIcao] = useState(initialDepartureIcao);
  const [arrivalIcao, setArrivalIcao] = useState(initialArrivalIcao);
  const [route, setRoute] = useState('');
  const [loading, setLoading] = useState(false);

  const [depNotams, setDepNotams] = useState<string[]>([]);
  const [arrNotams, setArrNotams] = useState<string[]>([]);

  // Trigger briefing fetch if initial ICAOs are provided
  useEffect(() => {
    if (initialDepartureIcao || initialArrivalIcao) {
      handleGetBriefing();
    }
  }, [initialDepartureIcao, initialArrivalIcao]); // Depend on initial ICAOs

  const handleGetBriefing = async () => {
    setLoading(true);
    setDepNotams([]);
    setArrNotams([]);

    if (!departureIcao && !arrivalIcao) {
      showError('Please enter at least a Departure or Arrival ICAO.');
      setLoading(false);
      return;
    }

    try {
      // Fetch Departure Airport Data
      if (departureIcao) {
        const notams = await fetchNotams(departureIcao.toUpperCase());
        setDepNotams(notams);
      }

      // Fetch Arrival Airport Data
      if (arrivalIcao) {
        const notams = await fetchNotams(arrivalIcao.toUpperCase());
        setArrNotams(notams);
      }

      showSuccess('Briefing data fetched!');
    } catch (error) {
      console.error('Error during briefing fetch:', error);
      showError('Failed to fetch briefing data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderBriefingSkeletons = () => (
    <div className="space-y-8">
      <Skeleton className="h-8 w-1/2 mx-auto" /> {/* Title skeleton */}
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
    <DynamicBackground images={flightBriefingBackgroundImages} interval={10000} className="min-h-screen flex flex-col items-center justify-center p-4 pt-24">
      {/* Darker overlay on top of the image for better text contrast and depth */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      <div className="relative z-10 w-full max-w-5xl mx-auto text-white">
        <h1 className="text-3xl font-bold mb-8 text-center">Flight Briefing</h1>

        <Card className="max-w-3xl mx-auto mb-8 shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white">
          <CardHeader>
            <CardTitle>Get Your Briefing</CardTitle>
            <CardDescription>Enter airport ICAO codes and route to get NOTAM information.</CardDescription>
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
                <Label htmlFor="route">Route (Optional)</Label>
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
              {loading ? 'Fetching Briefing...' : 'Get Briefing'}
            </Button>
          </CardContent>
        </Card>

        {loading && (departureIcao || arrivalIcao) ? (
          renderBriefingSkeletons()
        ) : (depNotams.length > 0 || arrNotams.length > 0) && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center">Detailed Briefing</h2>

            {/* Departure Airport Briefing */}
            {departureIcao && depNotams.length > 0 && (
              <Card className="shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white">
                <CardHeader>
                  <CardTitle>Departure Airport: {departureIcao.toUpperCase()}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">NOTAMs (Placeholder)</h3>
                    {depNotams.length > 0 ? (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {depNotams.map((notam, index) => (
                          <li key={index}>{notam}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No NOTAMs available (or fetched by placeholder).</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Note: Real-time NOTAM fetching often requires specific API access or manual lookup from official sources like <a href="https://notams.faa.gov/dinsQueryWeb/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">FAA NOTAMs</a> or <a href="https://www.eurocontrol.int/service/european-ais-database-ead" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Eurocontrol EAD</a>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Arrival Airport Briefing */}
            {arrivalIcao && arrNotams.length > 0 && (
              <Card className="shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white">
                <CardHeader>
                  <CardTitle>Arrival Airport: {arrivalIcao.toUpperCase()}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">NOTAMs (Placeholder)</h3>
                    {arrNotams.length > 0 ? (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {arrNotams.map((notam, index) => (
                          <li key={index}>{notam}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No NOTAMs available (or fetched by placeholder).</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Note: Real-time NOTAM fetching often requires specific API access or manual lookup from official sources like <a href="https://notams.faa.gov/dinsQueryWeb/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">FAA NOTAMs</a> or <a href="https://www.eurocontrol.int/service/european-ais-database-ead" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Eurocontrol EAD</a>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enroute Information */}
            <Card className="shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white">
              <CardHeader>
                <CardTitle>Enroute Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Significant Weather Charts (SIGWX)</h3>
                  <p className="text-muted-foreground">
                    Directly embedding real-time significant weather charts is complex due to data formats and licensing.
                    Please refer to official aviation weather sources for these charts:
                  </p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li><a href="https://aviationweather.gov/sigwx/sfc" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Aviation Weather Center (USA)</a></li>
                    <li><a href="https://www.wunderground.com/maps/airports/significant-weather" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Wunderground Significant Weather</a></li>
                    <li>For European SIGWX, check EUMETNET or national meteorological services.</li>
                  </ul>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Route Analysis & Overflown Countries</h3>
                  <p className="text-muted-foreground">
                    Determining countries overflown based on a free-text route string requires advanced geospatial processing and a comprehensive database of airspaces and country boundaries, which is beyond the scope of this application.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    For now, please manually check NOTAMs for countries along your planned route.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Airport Charts (AIP) */}
            <Card className="shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white">
              <CardHeader>
                <CardTitle>Airport Charts (AIP)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Official Aeronautical Information Publication (AIP) charts are typically copyrighted and require subscriptions to official services.
                  You can usually find charts for specific airports through:
                </p>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  <li>Your flight simulator's built-in chart viewer (if available).</li>
                  <li>Subscription services like Navigraph, Jeppesen, or ForeFlight.</li>
                  <li>Some countries provide free public access to their AIPs (e.g., <a href="https://www.ead.eurocontrol.int/cms/ead-public/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Eurocontrol EAD (requires registration)</a> for Europe, or national aviation authority websites).</li>
                </ul>
              </CardContent>
            </Card>

            {/* Short Briefing Summary */}
            <Card className="shadow-md rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white">
              <CardHeader>
                <CardTitle>Short Briefing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">Key Information at a Glance:</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>
                    <span className="font-medium">Departure ({departureIcao.toUpperCase() || 'N/A'}):</span>
                    {depNotams.length > 0 ? ` ${depNotams.length} NOTAM(s) affecting operations.` : ' No NOTAMs.'}
                  </li>
                  <li>
                    <span className="font-medium">Arrival ({arrivalIcao.toUpperCase() || 'N/A'}):</span>
                    {arrNotams.length > 0 ? ` ${arrNotams.length} NOTAM(s) affecting operations.` : ' No NOTAMs.'}
                  </li>
                  <li>
                    <span className="font-medium">Enroute Weather:</span> Please consult external SIGWX charts for significant weather phenomena (e.g., thunderstorms, turbulence, icing).
                  </li>
                  <li>
                    <span className="font-medium">NOTAMs (General):</span> Always cross-reference with official NOTAM sources for all relevant regions.
                  </li>
                  <li>
                    <span className="font-medium">Charts:</span> Obtain official airport charts from your preferred chart provider or national AIPs.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DynamicBackground>
  );
};

export default FlightBriefing;