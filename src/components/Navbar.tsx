import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NotificationMenu from '@/components/NotificationMenu';

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  is_staff: boolean;
  authorized_airlines: string[] | null; // Added authorized_airlines
}

const Navbar = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isIcarionPilot, setIsIcarionPilot] = useState(false); // New state for Icarion pilot status
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, is_staff, authorized_airlines') // Select authorized_airlines
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
          // Check if 'Icarion Virtual' is in authorized_airlines
          setIsIcarionPilot(data?.authorized_airlines?.includes('Icarion Virtual') || false);
        }
      }
    };

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setIsIcarionPilot(false); // Reset on sign out
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
      <Link to="/logbook" className="text-gray-700 dark:text-gray-300 hover:text-icarion-blue-DEFAULT dark:hover:text-icarion-gold-DEFAULT transition-colors">Logbook</Link>
      <Link to="/social-media" className="text-gray-700 dark:text-gray-300 hover:text-icarion-blue-DEFAULT dark:hover:text-icarion-gold-DEFAULT transition-colors">Social Media</Link>
      <Link to="/announcements" className="text-gray-700 dark:text-gray-300 hover:text-icarion-blue-DEFAULT dark:hover:text-icarion-gold-DEFAULT transition-colors">Announcements</Link>
      <Link to="/flight-briefing" className="text-gray-700 dark:text-gray-300 hover:text-icarion-blue-DEFAULT dark:hover:text-icarion-gold-DEFAULT transition-colors">Flight Briefing (Beta)</Link>
      <Link to="/flight-planning" className="text-gray-700 dark:text-gray-300 hover:text-icarion-blue-DEFAULT dark:hover:text-icarion-gold-DEFAULT transition-colors">Flight Planning (Beta)</Link> {/* New link */}
      <Link to="/careers" className="text-gray-700 dark:text-gray-300 hover:text-icarion-blue-DEFAULT dark:hover:text-icarion-gold-DEFAULT transition-colors">Careers</Link>
      <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-icarion-blue-DEFAULT dark:hover:text-icarion-gold-DEFAULT transition-colors">Contact</Link>
      <Link to="/profile-settings" className="text-gray-700 dark:text-gray-300 hover:text-icarion-blue-DEFAULT dark:hover:text-icarion-gold-DEFAULT transition-colors">Profile Settings</Link>
      {isIcarionPilot && ( // Conditionally render for Icarion pilots
        <Link to="/icarion-pilot-dashboard" className="text-gray-700 dark:text-gray-300 hover:text-icarion-blue-DEFAULT dark:hover:text-icarion-gold-DEFAULT transition-colors">Icarion Pilot Dashboard</Link>
      )}
      {profile?.is_staff && (
        <Link to="/staff-dashboard" className="text-gray-700 dark:text-gray-300 hover:text-icarion-blue-DEFAULT dark:hover:text-icarion-gold-DEFAULT transition-colors">Staff Dashboard</Link>
      )}
    </>
  );

  return (
    <nav className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg p-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-icarion-blue-DEFAULT dark:text-icarion-gold-DEFAULT">
        <span className="font-cinzel-decorative">Icarion</span> VA
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
              <NotificationMenu />
              <Button onClick={handleLogout} variant="outline" className="w-full">Logout</Button>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="flex items-center space-x-6">
          {navLinks}
          <NotificationMenu />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User"} />
                  <AvatarFallback>
                    {typeof profile?.display_name === 'string' && profile.display_name.length > 0
                      ? profile.display_name.charAt(0)
                      : 'VA'}
                  </AvatarFallback>
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