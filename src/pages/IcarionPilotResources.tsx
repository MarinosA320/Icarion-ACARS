import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import DynamicBackground from '@/components/DynamicBackground';
import { ExternalLink } from 'lucide-react';

const icarionPilotResourcesBackgroundImages = [
  '/images/backgrounds/profile-bg-new.png', // Using the same background as the dashboard for consistency
];

const IcarionPilotResources: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isIcarionPilot, setIsIcarionPilot] = useState(false);

  useEffect(() => {
    const checkPilotStatus = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        showError('Authentication error. Please log in.');
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('authorized_airlines')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching pilot status:', profileError);
        showError('Error fetching your pilot status.');
        setLoading(false);
        return;
      }

      if (profileData?.authorized_airlines?.includes('Icarion Virtual')) {
        setIsIcarionPilot(true);
      } else {
        setIsIcarionPilot(false);
      }
      setLoading(false);
    };

    checkPilotStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isIcarionPilot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-600">Access Denied</h1>
          <p className="text-xl text-gray-900">You must be an Icarion Virtual pilot to view this page.</p>
          <p className="text-md text-gray-700 mt-2">If you believe this is an error, please contact staff.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <DynamicBackground images={icarionPilotResourcesBackgroundImages} interval={10000} />
      <div className="fixed inset-0 bg-black opacity-40 z-0"></div>
      
      <div className="relative z-10 w-full max-w-5xl mx-auto text-white flex-grow flex flex-col items-center justify-start p-4 pt-24 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
          Icarion Pilot Resources
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
          A collection of essential tools and links to enhance your virtual flying experience with Icarion.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Card className="shadow-md rounded-lg bg-white/50 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle>Flight Planning & Charts</CardTitle>
              <CardDescription>Tools to plan your routes and access aeronautical charts.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-800 dark:text-gray-200">
                <li>
                  <a href="https://simbrief.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    SimBrief (Flight Planning) <ExternalLink className="inline-block h-4 w-4 ml-1" />
                  </a>
                </li>
                <li>
                  <a href="https://skyvector.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    SkyVector (Charts & Planning) <ExternalLink className="inline-block h-4 w-4 ml-1" />
                  </a>
                </li>
                <li>
                  <a href="https://charts.navigraph.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    Navigraph Charts (Subscription Required) <ExternalLink className="inline-block h-4 w-4 ml-1" />
                  </a>
                </li>
                <li>
                  <a href="https://flightaware.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    FlightAware (Real-time Flight Tracking) <ExternalLink className="inline-block h-4 w-4 ml-1" />
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-lg bg-white/50 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle>Aviation Weather</CardTitle>
              <CardDescription>Access up-to-date meteorological information.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-800 dark:text-gray-200">
                <li>
                  <a href="https://www.windy.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    Windy.com (Aviation Weather) <ExternalLink className="inline-block h-4 w-4 ml-1" />
                  </a>
                </li>
                <li>
                  <a href="https://aviationweather.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    Aviation Weather Center (USA) <ExternalLink className="inline-block h-4 w-4 ml-1" />
                  </a>
                </li>
                <li>
                  <a href="https://www.meteoblue.com/en/weather/webcams/map/world_europe_2661886" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    Meteoblue (Global Weather) <ExternalLink className="inline-block h-4 w-4 ml-1" />
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-lg bg-white/50 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle>Virtual ATC Networks</CardTitle>
              <CardDescription>Connect with air traffic control for realistic operations.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-800 dark:text-gray-200">
                <li>
                  <a href="https://www.vatsim.net/pilots/pilots-resources" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    VATSIM Pilot Resources <ExternalLink className="inline-block h-4 w-4 ml-1" />
                  </a>
                </li>
                <li>
                  <a href="https://ivao.aero/training/documentation/manuals/index.htm" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    IVAO Training Documentation <ExternalLink className="inline-block h-4 w-4 ml-1" />
                  </a>
                </li>
                <li>
                  <a href="https://poscon.net/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    POSCON (Pilot & ATC Client) <ExternalLink className="inline-block h-4 w-4 ml-1" />
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-lg bg-white/50 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle>Aircraft & Liveries</CardTitle>
              <CardDescription>Find Icarion liveries and recommended aircraft add-ons.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 dark:text-gray-200">
                (Content coming soon: Links to livery downloads, recommended aircraft for Icarion operations, etc.)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IcarionPilotResources;