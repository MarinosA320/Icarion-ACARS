import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { showSuccess, showError } from '@/utils/toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  discord_username: string | null;
  vatsim_ivao_id: string | null;
  avatar_url: string | null;
  type_ratings: string[] | null; // New field
  rank: string; // Ensure rank is included
}

interface Flight {
  flight_time: string; // e.g., "02:30"
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

  const [desiredRank, setDesiredRank] = useState('');
  const [aircraftType, setAircraftType] = useState('');
  const [preferredDateTime, setPreferredDateTime] = useState('');
  const [priorExperience, setPriorExperience] = useState('');
  const [optionalMessage, setOptionalMessage] = useState('');

  const [totalFlights, setTotalFlights] = useState(0);
  const [totalFlightTime, setTotalFlightTime] = useState('0h 0m');
  const [averageLandingRate, setAverageLandingRate] = useState('N/A');

  const { theme, setTheme } = useTheme();

  useEffect(() => {
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
          .select('id, first_name, last_name, display_name, discord_username, vatsim_ivao_id, avatar_url, type_ratings, rank') // Added rank
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

    fetchProfileAndFlights();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    let avatarUrl = profile.avatar_url;
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${profile.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Changed to 'avatars' (with hyphen)
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        showError('Error uploading avatar: ' + uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath); // Changed to 'avatars' (with hyphen)
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

  const handleTrainingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desiredRank || !aircraftType || !preferredDateTime || !priorExperience) {
      showError('Please fill all required fields for the request.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('User not logged in.');
      return;
    }

    const { error } = await supabase.from('training_requests').insert({
      user_id: user.id,
      desired_rank: desiredRank,
      aircraft_type: aircraftType,
      preferred_date_time: preferredDateTime,
      prior_experience: priorExperience,
      optional_message: optionalMessage,
      status: 'Pending',
    });

    if (error) {
      showError('Error submitting request: ' + error.message);
    } else {
      showSuccess('Training/Exam request submitted successfully!');
      setDesiredRank('');
      setAircraftType('');
      setPreferredDateTime('');
      setPriorExperience('');
      setOptionalMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Profile Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Information Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your public display name and contact details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User"} />
                  <AvatarFallback>{profile?.display_name ? profile.display_name.charAt(0) : 'VA'}</AvatarFallback>
                </Avatar>
              </div>
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Your last name"
                />
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              <div>
                <Label htmlFor="discordUsername">Discord Username</Label>
                <Input
                  id="discordUsername"
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  placeholder="Your Discord username"
                />
              </div>
              <div>
                <Label htmlFor="vatsimIvaoId">VATSIM ID (CID) or IVAO ID (VID)</Label>
                <Input
                  id="vatsimIvaoId"
                  value={vatsimIvaoId}
                  onChange={(e) => setVatsimIvaoId(e.target.value)}
                  placeholder="Your VATSIM or IVAO ID"
                />
              </div>
              {profile && (
                <>
                  <div>
                    <Label>Your Current Rank</Label>
                    <Input value={profile.rank} disabled className="bg-gray-100 dark:bg-gray-700" />
                  </div>
                  <div>
                    <Label>Your Type Ratings</Label>
                    <Input
                      value={profile.type_ratings && profile.type_ratings.length > 0 ? profile.type_ratings.join(', ') : 'None'}
                      disabled
                      className="bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                </>
              )}
              <Button type="submit" className="w-full">Update Profile</Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Security Card */}
        <Card className="col-span-1">
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

        {/* Flight Statistics Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Flight Statistics</CardTitle>
            <CardDescription>Your flight performance and activity.</CardDescription>
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
          </CardContent>
        </Card>

        {/* Training/Exam Request Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Training/Exam Request</CardTitle>
            <CardDescription>Request training or an exam for a rank upgrade.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrainingRequest} className="space-y-4">
              <div>
                <Label htmlFor="desiredRank">Desired Rank</Label>
                <Select value={desiredRank} onValueChange={setDesiredRank}>
                  <SelectTrigger id="desiredRank">
                    <SelectValue placeholder="Select a rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First Officer">First Officer</SelectItem>
                    <SelectItem value="Captain">Captain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="aircraftType">Preferred Aircraft Type</Label>
                <Input
                  id="aircraftType"
                  value={aircraftType}
                  onChange={(e) => setAircraftType(e.target.value)}
                  placeholder="e.g., A320, B737"
                />
              </div>
              <div>
                <Label htmlFor="preferredDateTime">Preferred Date/Time</Label>
                <Input
                  id="preferredDateTime"
                  type="datetime-local"
                  value={preferredDateTime}
                  onChange={(e) => setPreferredDateTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="priorExperience">Prior Experience</Label>
                <Textarea
                  id="priorExperience"
                  value={priorExperience}
                  onChange={(e) => setPriorExperience(e.target.value)}
                  placeholder="Describe your prior experience relevant to this rank."
                />
              </div>
              <div>
                <Label htmlFor="optionalMessage">Optional Message</Label>
                <Textarea
                  id="optionalMessage"
                  value={optionalMessage}
                  onChange={(e) => setOptionalMessage(e.target.value)}
                  placeholder="Any additional notes for the staff."
                />
              </div>
              <Button type="submit" className="w-full">Submit Request</Button>
            </form>
          </CardContent>
        </Card>

        {/* Day/Night Mode Toggle Card */}
        <Card className="col-span-full lg:col-span-1">
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
      </div>
    </div>
  );
};

export default ProfileSettings;