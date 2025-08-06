import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import PlanFlight from "./pages/PlanFlight";
import MyBookings from "./pages/MyBookings";
import Announcements from "./pages/Announcements";
import MyRequests from "./pages/MyRequests"; // Changed import
import LogFlight from "./pages/LogFlight";
import FlightBriefing from "./pages/FlightBriefing";
import Careers from "./pages/Careers";
// import SimulateFlight from "./pages/SimulateFlight"; // Removed
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
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && event === 'SIGNED_OUT') {
        navigate('/login');
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
              <Route
                path="/plan-flight"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <PlanFlight />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <MyBookings />
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
                path="/my-requests" // Changed route path
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <MyRequests /> {/* Changed component name */}
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
              {/* Removed Simulate Flight Route */}
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