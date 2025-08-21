import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import DynamicBackground from '@/components/DynamicBackground';
import { Button } from '@/components/ui/button'; // Import Button

const icarionPilotBackgroundImages = [
  '/images/backgrounds/profile-bg-new.png', // Example background image
];

const IcarionPilotDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isIcarionPilot, setIsIcarionPilot] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

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
        .select('display_name, authorized_airlines')
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
        setDisplayName(profileData.display_name);
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
      <DynamicBackground images={icarionPilotBackgroundImages} interval={10000} />
      <div className="fixed inset-0 bg-black opacity-40 z-0"></div>
      
      <div className="relative z-10 w-full max-w-5xl mx-auto text-white flex-grow flex flex-col items-center justify-start p-4 pt-24 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
          Welcome, {displayName || 'Icarion Pilot'}!
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
          This is your exclusive dashboard with resources and information for Icarion Virtual pilots.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Card className="shadow-md rounded-lg bg-white/50 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle>Exclusive Briefings</CardTitle>
              <CardDescription>Access internal flight briefings and operational updates.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-full">
              <p className="text-gray-800 dark:text-gray-200 mb-4">
                Details about upcoming events, new routes, and fleet updates will appear here.
              </p>
              <Button 
                onClick={() => window.open('https://example.com/icarion-briefings', '_blank')}
                className="w-full mt-auto"
                variant="default"
              >
                View Briefings
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-lg bg-white/50 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle>Pilot Resources</CardTitle>
              <CardDescription>Download custom liveries, flight planning tools, and more.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-full">
              <p className="text-gray-800 dark:text-gray-200 mb-4">
                Links to essential tools and documents for your Icarion flights.
              </p>
              <Button 
                onClick={() => window.open('https://example.com/icarion-resources', '_blank')}
                className="w-full mt-auto"
                variant="default"
              >
                Access Resources
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-lg bg-white/50 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle>Internal Communications</CardTitle>
              <CardDescription>Direct messages and announcements from Icarion staff.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-full">
              <p className="text-gray-800 dark:text-gray-200 mb-4">
                Stay connected with the latest news and direct communications.
              </p>
              <Button 
                onClick={() => window.open('https://example.com/icarion-communications', '_blank')}
                className="w-full mt-auto"
                variant="default"
              >
                View Communications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IcarionPilotDashboard;