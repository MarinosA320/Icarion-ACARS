import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { fetchEmailsForUserIds } from '@/utils/supabaseDataFetch';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  discord_username: string | null;
  vatsim_ivao_id: string | null;
  avatar_url: string | null;
  is_staff: boolean;
  rank: string | null; // Updated to allow null
  email: string | null;
  type_ratings: string[] | null;
  authorized_airlines: string[] | null;
}

export const useUsersManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [staffMembers, setStaffMembers] = useState<Profile[]>([]);

  const fetchUsers = useCallback(async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select("id,first_name,last_name,display_name,discord_username,vatsim_ivao_id,avatar_url,is_staff,rank,type_ratings,authorized_airlines");

    if (profilesError) {
      showError('Error fetching users: ' + profilesError.message);
      console.error('Error fetching users:', profilesError);
      return;
    }

    const userIds = profilesData.map(p => p.id);
    const userEmails = await fetchEmailsForUserIds(userIds);

    const usersWithEmail = profilesData.map(profile => ({
      ...profile,
      email: userEmails[profile.id] || null,
    }));
    setUsers(usersWithEmail as Profile[]);
  }, []);

  const fetchStaffMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,display_name')
      .eq('is_staff', true);

    if (error) {
      console.error('Error fetching staff members:', error);
    } else {
      setStaffMembers(data as Profile[]);
    }
  }, []);

  const handleUserUpdate = useCallback(async (userId: string, field: string, value: any) => {
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('id', userId);

    if (error) {
      showError(`Error updating user ${field}: ` + error.message);
    } else {
      showSuccess(`User ${field} updated successfully!`);
      fetchUsers();
    }
  }, [fetchUsers]);

  return {
    users,
    staffMembers,
    fetchUsers,
    handleUserUpdate,
  };
};