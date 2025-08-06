import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import {
  RANK_ORDER,
  AIRCRAFT_MIN_RANKS,
  ICARION_FLEET,
  ALL_AIRLINES,
  hasRequiredRank,
  hasTypeRating,
  Aircraft,
  Airline,
  AIRCRAFT_FAMILIES, // New import
} from '@/utils/aircraftData';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  vatsim_ivao_id: string | null;
  rank: string;
  type_ratings: string[] | null;
}

export const useUserProfileAndAircraftData = (selectedAirline: string, selectedAircraftType: string, initialAircraftTypeFromVatsim?: string, initialAircraftRegistrationFromBooking?: string, bookingId?: string) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [filteredAircraftTypes, setFilteredAircraftTypes] = useState<string[]>([]);
  const [aircraftRegistrations, setAircraftRegistrations] = useState<string[]>([]);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, vatsim_ivao_id, rank, type_ratings')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile for form:', error);
          showError('Error fetching user profile.');
        } else {
          setUserProfile(data as UserProfile);
          console.log('useUserProfileAndAircraftData: Fetched user profile:', data);
        }
      }
    };
    fetchUserProfile();
  }, []);

  // Filter aircraft types based on user rank and selected airline
  useEffect(() => {
    if (!userProfile) {
      console.log('useUserProfileAndAircraftData: userProfile not yet loaded.');
      return;
    }

    const currentAirline = ALL_AIRLINES.find(a => a.name === selectedAirline) || ALL_AIRLINES[0];
    const availableAircraftTypes = currentAirline.fleet.map(ac => ac.type);
    
    const filteredByRankAndTypeRating = availableAircraftTypes.filter(type => {
      const requiredRank = AIRCRAFT_MIN_RANKS[type];
      const meetsRank = requiredRank ? hasRequiredRank(userProfile.rank, requiredRank) : true;
      const meetsTypeRating = hasTypeRating(userProfile.type_ratings, type);
      
      console.log(`  Checking aircraft ${type}: Required Rank=${requiredRank}, User Rank=${userProfile.rank}, Meets Rank=${meetsRank}, User Ratings=${userProfile.type_ratings}, Required Family=${AIRCRAFT_FAMILIES[type]}, Meets Type Rating=${meetsTypeRating}`);
      return meetsRank && meetsTypeRating;
    });
    setFilteredAircraftTypes(filteredByRankAndTypeRating);
    console.log('useUserProfileAndAircraftData: Filtered aircraft types:', filteredByRankAndTypeRating);

  }, [userProfile, selectedAirline]);

  // Determine aircraft registrations based on selected aircraft type and airline
  useEffect(() => {
    if (!userProfile || !selectedAircraftType) {
      setAircraftRegistrations([]);
      return;
    }

    const currentAirline = ALL_AIRLINES.find(a => a.name === selectedAirline) || ALL_AIRLINES[0];
    const regs = currentAirline.fleet.find(ac => ac.type === selectedAircraftType)?.registrations || [];
    setAircraftRegistrations(regs);
  }, [userProfile, selectedAirline, selectedAircraftType]);

  return {
    userProfile,
    filteredAircraftTypes,
    aircraftRegistrations,
  };
};