import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // New Import

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  is_staff: boolean;
}

const Navbar = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, is_staff')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      }
    };

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navLinks = (
    <>
      <Link to="/logbook" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">Logbook</Link>
      <Link to="/social-media" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">Social Media</Link>
      <Link to="/plan-flight" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">Plan Flight</Link>
      <Link to="/my-bookings" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">My Bookings</Link>
      <Link to="/my-training-requests" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">My Training Requests</Link>
      <Link to="/announcements" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">Announcements</Link>
      {/* <Link to="/live-map" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">Live Map</Link> Removed Link */}
      <Link to="/profile-settings" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">Profile Settings</Link>
      {profile?.is_staff && (
        <Link to="/staff-dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">Staff Dashboard</Link>
      )}
    </>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-primary dark:text-primary-foreground">
        Icarion VA
      </Link>

      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] sm:w-[300px] bg-white dark:bg-gray-800 p-4">
            <div className="flex flex-col space-y-4 mt-6">
              {navLinks}
              <Button onClick={handleLogout} variant="outline" className="w-full">Logout</Button>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="flex items-center space-x-6">
          {navLinks}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User"} />
                  <AvatarFallback>{profile?.display_name ? profile.display_name.charAt(0) : 'VA'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.display_name || 'Virtual Pilot'}</p>
                  {profile?.is_staff && (
                    <Badge variant="secondary" className="w-fit">Staff</Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile-settings')}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </nav>
  );
};

export default Navbar;