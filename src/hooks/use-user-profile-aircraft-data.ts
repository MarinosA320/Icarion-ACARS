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
  AIRCRAFT_FAMILIES,
} from '@/utils/aircraftData';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  vatsim_ivao_id: string | null;
  rank: string | null; // Updated to allow null
  type_ratings: string[] | null;
  authorized_airlines: string[] | null;
}

export const useUserProfileAndAircraftData = (selectedAirline: string, selectedAircraftType: string, initialAircraftTypeFromVatsim?: string, initialAircraftRegistrationFromBooking?: string, bookingId?: string) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [filteredAircraftTypes, setFilteredAircraftTypes] = useState<string[]>([]);
  const [aircraftRegistrations, setAircraftRegistrations] = useState<string[]>([]);
  const [availableAirlines, setAvailableAirlines] = useState<Airline[]>([]);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, vatsim_ivao_id, rank, type_ratings, authorized_airlines')
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

  // Filter available airlines based on user's authorized_airlines
  useEffect(() => {
    if (!userProfile) {
      setAvailableAirlines([]);
      return;
    }

    if (userProfile.authorized_airlines && userProfile.authorized_airlines.length > 0) {
      const filtered = ALL_AIRLINES.filter(airline =>
        userProfile.authorized_airlines?.includes(airline.name)
      );
      setAvailableAirlines(filtered);
      console.log('useUserProfileAndAircraftData: Filtered available airlines based on user authorization:', filtered);
    } else {
      setAvailableAirlines(ALL_AIRLINES);
      console.log('useUserProfileAndAircraftData: All airlines available (no specific authorization).');
    }
  }, [userProfile]);


  // Filter aircraft types based on user rank and selected airline
  useEffect(() => {
    if (!userProfile || !selectedAirline) {
      console.log('useUserProfileAndAircraftData: userProfile or selectedAirline not yet loaded for aircraft type filtering.');
      setFilteredAircraftTypes([]);
      return;
    }

    const currentAirline = ALL_AIRLINES.find(a => a.name === selectedAirline);
    if (!currentAirline) {
      setFilteredAircraftTypes([]);
      return;
    }

    const availableAircraftTypes = currentAirline.fleet.map(ac => ac.type);
    
    const filteredByRankAndTypeRating = availableAircraftTypes.filter(type => {
      const requiredRank = AIRCRAFT_MIN_RANKS[type];
      // Ensure userProfile.rank is a string, defaulting to 'Visitor' if null
      const userRankForCheck = userProfile.rank || 'Visitor'; 
      const meetsRank = requiredRank ? hasRequiredRank(userRankForCheck, requiredRank) : true;
      const meetsTypeRating = hasTypeRating(userProfile.type_ratings, type);
      
      console.log(`  Checking aircraft ${type}: Required Rank=${requiredRank}, User Rank=${userRankForCheck}, Meets Rank=${meetsRank}, User Ratings=${userProfile.type_ratings}, Required Family=${AIRCRAFT_FAMILIES[type]}, Meets Type Rating=${meetsTypeRating}`);
      return meetsRank && meetsTypeRating;
    });
    setFilteredAircraftTypes(filteredByRankAndTypeRating);
    console.log('useUserProfileAndAircraftData: Filtered aircraft types:', filteredByRankAndTypeRating);

  }, [userProfile, selectedAirline]);

  // Determine aircraft registrations based on selected aircraft type and airline
  useEffect(() => {
    if (!userProfile || !selectedAircraftType || !selectedAirline) {
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
    availableAirlines,
  };
};