import React from "react"; // Added React import
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ProfileSettings from "./pages/ProfileSettings";
import Logbook from "./pages/Logbook";
import SocialMedia from "./pages/SocialMedia";
import StaffDashboard from "./pages/StaffDashboard";
import Announcements from "./pages/Announcements";
import LogFlight from "./pages/LogFlight";
import FlightBriefing from "./pages/FlightBriefing";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import IcarionPilotDashboard from "./pages/IcarionPilotDashboard";
import IcarionPilotResources from "./pages/IcarionPilotResources";
import FlightPlanning from "./pages/FlightPlanning"; // New import
import Navbar from "./components/Navbar";
import { supabase } from "./integrations/supabase/client";
import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

interface Profile {
  rank: string | null;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        setLoading(false);
        return;
      }

      // Fetch user profile to check rank
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('rank')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile for rank check:', profileError);
      } else if (profileData?.rank === 'Visitor') {
        const hasSeenReminder = localStorage.getItem('hasSeenNewUserRatingReminder');
        if (!hasSeenReminder) {
          toast.info(
            "Welcome to Icarion VA! To begin your pilot career, request your initial type rating. For questions, reach out to staff on Discord!",
            {
              duration: 10000,
              onDismiss: () => localStorage.setItem('hasSeenNewUserRatingReminder', 'true'),
              onAutoClose: () => localStorage.setItem('hasSeenNewUserRatingReminder', 'true'),
            }
          );
        }
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && event === 'SIGNED_OUT') {
        navigate('/login');
        localStorage.removeItem('hasSeenNewUserRatingReminder');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile-settings"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <ProfileSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/logbook"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Logbook />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social-media"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <SocialMedia />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff-dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <ErrorBoundary>
                      <StaffDashboard />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/announcements"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Announcements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/log-flight"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <ErrorBoundary>
                      <LogFlight />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flight-briefing"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <FlightBriefing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/careers"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Careers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contact"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Contact />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/icarion-pilot-dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <IcarionPilotDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/icarion-pilot-dashboard/resources"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <IcarionPilotResources />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flight-planning" // New route for basic flight planning
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <FlightPlanning />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;