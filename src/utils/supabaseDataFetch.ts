import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  discord_username: string | null;
  vatsim_ivao_id: string | null;
  avatar_url: string | null;
  is_staff: boolean;
  rank: string | null;
  type_ratings: string[] | null;
  email?: string | null; // Added email to ProfileData interface
}

/**
 * Fetches emails for a given list of user IDs using a Supabase Edge Function.
 * This is necessary because user emails are part of auth.users and not directly exposed in public.profiles.
 * @param userIds An array of user UUIDs.
 * @returns A map of user ID to email address.
 */
export const fetchEmailsForUserIds = async (userIds: string[]): Promise<{ [key: string]: string }> => {
  if (userIds.length === 0) {
    return {};
  }
  try {
    const response = await supabase.functions.invoke('get-user-emails', {
      body: { user_ids: userIds },
    });

    if (response.error) {
      console.error('Error invoking get-user-emails function:', response.error);
      showError('Error fetching user emails.');
      return {};
    } else if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error('Network error invoking get-user-emails function:', error);
    showError('Network error fetching user emails. Please check your internet connection or try again later.');
  }
  return {};
};

/**
 * Fetches detailed profile data for a given list of user IDs.
 * @param userIds An array of user UUIDs.
 * @param includeEmail Optional: if true, also fetches and includes user email addresses.
 * @returns A map of user ID to their profile data.
 */
export const fetchProfilesData = async (userIds: string[], includeEmail: boolean = false): Promise<{ [key: string]: ProfileData }> => {
  if (userIds.length === 0) {
    return {};
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, is_staff, vatsim_ivao_id, first_name, last_name, discord_username, avatar_url, rank, type_ratings');
  
  if (error) {
    console.error('Error fetching profiles data for user IDs:', error);
    showError('Error fetching user profiles data.');
    return {};
  }

  const profilesMap: { [key: string]: ProfileData } = {};
  data.forEach(profile => {
    profilesMap[profile.id] = profile as ProfileData;
  });

  if (includeEmail) {
    const userEmails = await fetchEmailsForUserIds(userIds);
    for (const userId of userIds) {
      if (profilesMap[userId]) {
        profilesMap[userId].email = userEmails[userId] || null;
      }
    }
  }

  return profilesMap;
};