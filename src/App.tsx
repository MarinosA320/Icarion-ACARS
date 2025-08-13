import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner"; // Removed 'toast' from here
import { toast } from "sonner"; // Added direct import for 'toast' from 'sonner'
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
import Navbar from "./components/Navbar";
import { supabase } from "./integrations/supabase/client";
import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

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
        // Continue even if profile fetch fails, but don't show toast
      } else if (profileData?.rank === 'Visitor') {
        const hasSeenReminder = localStorage.getItem('hasSeenNewUserRatingReminder');
        if (!hasSeenReminder) {
          toast.info(
            "Welcome to Icarion VA! To begin your pilot career, request your initial type rating. For questions, reach out to staff on Discord!",
            {
              duration: 10000, // Show for 10 seconds
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
        // Clear the reminder flag if user signs out
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
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Removed /my-bookings route */}
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
                    <LogFlight />
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;