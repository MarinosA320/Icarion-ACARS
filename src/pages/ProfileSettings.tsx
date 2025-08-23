import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CreateTrainingRequestForm from '@/components/CreateTrainingRequestForm';
import { useTrainingRequestsManagement } from '@/hooks/useTrainingRequestsManagement';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import DynamicBackground from '@/components/DynamicBackground';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  discord_username: string | null;
  vatsim_ivao_id: string | null;
  avatar_url: string | null;
  type_ratings: string[] | null;
  rank: string | null;
}

interface Flight {
  flight_time: string;
  landing_rate: number | null;
}

// Helper function to convert "HH:MM" to total minutes
const convertFlightTimeToMinutes = (flightTime: string): number => {
  const [hours, minutes] = flightTime.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert total minutes back to "HHh MMm" format for display
const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const profileSettingsBackgroundImages = [
  '/images/backgrounds/settingss.png',
];

const ProfileSettings = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [vatsimIvaoId, setVatsimIvaoId] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  const [totalFlights, setTotalFlights] = useState(0);
  const [totalFlightTime, setTotalFlightTime] = useState('0h 0m');
  const [averageLandingRate, setAverageLandingRate] = useState('N/A');

  const { theme, setTheme } = useTheme();
  const { myTrainingRequests, fetchMyTrainingRequests } = useTrainingRequestsManagement();

  const fetchProfileAndFlights = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      showError('Error fetching user data.');
      return;
    }
    if (user) {
      setCurrentEmail(user.email || '');
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, display_name, discord_username, vatsim_ivao_id, avatar_url, type_ratings, rank')
        .eq('id', user.id)
        .single();

      if (profileError) {
        showError('Error fetching profile data.');
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
        setFirstName(profileData.first_name || '');
        setLastName(profileData.last_name || '');
        setDisplayName(profileData.display_name || '');
        setDiscordUsername(profileData.discord_username || '');
        setVatsimIvaoId(profileData.vatsim_ivao_id || '');
      }

      // Fetch flight data
      const { data: flightsData, error: flightsError } = await supabase
        .from('flights')
        .select('flight_time, landing_rate')
        .eq('user_id', user.id);

      if (flightsError) {
        console.error('Error fetching flights:', flightsError);
      } else {
        setTotalFlights(flightsData.length);
        
        let totalMinutes = 0;
        let totalLandingRate = 0;
        let landingRateCount = 0;

        flightsData.forEach((flight: Flight) => {
          if (flight.flight_time) {
            totalMinutes += convertFlightTimeToMinutes(flight.flight_time);
          }
          if (flight.landing_rate !== null) {
            totalLandingRate += flight.landing_rate;
            landingRateCount++;
          }
        });

        setTotalFlightTime(formatMinutesToHoursAndMinutes(totalMinutes));
        if (landingRateCount > 0) {
          setAverageLandingRate(Math.round(totalLandingRate / landingRateCount).toString() + ' fpm');
        } else {
          setAverageLandingRate('N/A');
        }
      }
    }
  };

  useEffect(() => {
    fetchProfileAndFlights();
    fetchMyTrainingRequests();
  }, [fetchMyTrainingRequests]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!firstName.trim() || !lastName.trim() || !displayName.trim() || !discordUsername.trim()) {
      showError('First Name, Last Name, Display Name, and Discord Username are required.');
      return;
    }

    let avatarUrl = profile.avatar_url;
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${profile.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        showError('Error uploading avatar: ' + uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      avatarUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        discord_username: discordUsername,
        vatsim_ivao_id: vatsimIvaoId,
        avatar_url: avatarUrl,
      })
      .eq('id', profile.id);

    if (error) {
      showError('Error updating profile: ' + error.message);
    } else {
      showSuccess('Profile updated successfully!');
      setProfile(prev => prev ? { ...prev, first_name: firstName, last_name: lastName, display_name: displayName, discord_username: discordUsername, vatsim_ivao_id: vatsimIvaoId, avatar_url: avatarUrl } : null);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      showError('Please enter a new password.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      showError('Error updating password: ' + error.message);
    } else {
      showSuccess('Password updated successfully!');
      setNewPassword('');
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      showError('Please enter a new email.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      showError('Email update request sent! Please check your new email for confirmation.');
    } else {
      showSuccess('Email update request sent! Please check your new email for confirmation.');
      setNewEmail('');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Dynamic Background fixed to viewport */}
      <DynamicBackground images={profileSettingsBackgroundImages} interval={10000} />
      {/* Darker overlay on top of the image for better text contrast and depth */}
      <div className="fixed inset-0 bg-black opacity-30 z-0"></div>
      
      {/* Content container, scrollable */}
      <div className="relative z-10 w-full max-w-5xl mx-auto text-white flex-grow flex flex-col items-center justify-start p-4 pt-24 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Pilot Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {/* Pilot Overview Card */}
          <Card className="col-span-full lg:col-span-1 shadow-md rounded-lg bg-white/50 dark:bg-gray-800/50">
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User"} />
                <AvatarFallback>{profile?.display_name ? profile.display_name.charAt(0) : 'VA'}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{profile?.display_name || 'Virtual Pilot'}</CardTitle>
              <CardDescription className="text-lg">{profile?.rank || 'Visitor'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Flights:</span>
                <span>{totalFlights}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Flight Time:</span>
                <span>{totalFlightTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Average Landing Rate:</span>
                <span>{averageLandingRate}</span>
              </div>
              <div>
                <span className="font-medium">Type Ratings:</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {profile?.type_ratings && profile.type_ratings.length > 0 ? profile.type_ratings.join(', ') : 'None'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card className="col-span-full lg:col-span-2 shadow-md rounded-lg bg-white/50 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle>Update Profile Information</CardTitle>
              <CardDescription>Manage your public display name and contact details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Your first name"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Your last name"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="discordUsername">Discord Username</Label>
                  <Input
                    id="discordUsername"
                    value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value)}
                    placeholder="Your Discord username (e.g., user#1234)"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="vatsimIvaoId">VATSIM ID (CID) or IVAO ID (VID)</Label>
                  <Input
                    id="vatsimIvaoId"
                    value={vatsimIvaoId}
                    onChange={(e) => setVatsimIvaoId(e.target.value)}
                    placeholder="Your VATSIM or IVAO ID (optional)"
                  />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="avatarFile">Update Avatar (Optional)</Label>
                  <Input
                    id="avatarFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)}
                  />
                </div>
                <div className="col-span-full">
                  <Button type="submit" className="w-full">Update Profile</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Security Card */}
          <Card className="col-span-full lg:col-span-1 shadow-md rounded-lg bg-white/50 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Manage your password and email address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <Button type="submit" className="w-full">Update Password</Button>
              </form>

              <div className="border-t pt-6">
                <form onSubmit={handleEmailUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="currentEmail">Current Email</Label>
                    <Input id="currentEmail" value={currentEmail} disabled className="bg-gray-100 dark:bg-gray-700" />
                  </div>
                  <div>
                    <Label htmlFor="newEmail">New Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email"
                    />
                  </div>
                  <Button type="submit" className="w-full">Update Email</Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Day/Night Mode Toggle Card */}
          <Card className="col-span-full lg:col-span-2 shadow-md rounded-lg bg-white/50 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle>Display Mode</CardTitle>
              <CardDescription>Toggle between light and dark themes.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Label htmlFor="theme-toggle">Dark Mode</Label>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </CardContent>
          </Card>

          {/* Training Request Card */}
          <Card className="col-span-full shadow-md rounded-lg bg-white/50 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle>My Training Requests</CardTitle>
              <CardDescription>Submit new requests or view the status of your existing ones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CreateTrainingRequestForm onFormSubmitted={fetchMyTrainingRequests} />
              <h3 className="text-lg font-semibold mt-6 mb-4">My Submitted Requests</h3>
              {myTrainingRequests.length === 0 ? (
                <p className="text-center text-muted-foreground">You have no pending training requests.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Desired Rank</TableHead>
                      <TableHead>Aircraft Type</TableHead>
                      <TableHead>Preferred Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Instructor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myTrainingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.desired_rank}</TableCell>
                        <TableCell>{request.aircraft_type}</TableCell>
                        <TableCell>{format(new Date(request.preferred_date_time), 'PPP')}</TableCell>
                        <TableCell>
                          <span className={`font-semibold ${request.status === 'Pending' ? 'text-yellow-600' : request.status === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                            {request.status}
                          </span>
                        </TableCell>
                        <TableCell>{request.instructor_profile?.display_name || 'Unassigned'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;