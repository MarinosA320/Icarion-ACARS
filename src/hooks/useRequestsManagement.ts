import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { fetchEmailsForUserIds, fetchProfilesData } from '@/utils/supabaseDataFetch'; // Import fetchProfilesData
import { RANK_ORDER } from '@/utils/aircraftData';

interface UserRequest {
  id: string;
  user_id: string;
  request_type: string;
  status: string;
  details: {
    desired_rank?: string;
    aircraft_type?: string;
    preferred_date_time?: string;
    prior_experience?: string;
    optional_message?: string;
    subject?: string;
    message?: string;
  } | null;
  created_at: string;
  assigned_to: string | null;
  resolution_notes: string | null;
  user_profile: {
    display_name: string | null;
    email: string | null;
    rank: string | null;
  } | null;
  assigned_to_profile: {
    display_name: string | null;
  } | null;
}

export const useRequestsManagement = () => {
  const [requests, setRequests] = useState<UserRequest[]>([]);

  const fetchUserRequests = useCallback(async () => {
    // Fetch requests without direct profile joins
    const { data, error } = await supabase
      .from('user_requests')
      .select('id,user_id,request_type,status,details,created_at,assigned_to,resolution_notes')
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching user requests: ' + error.message);
      console.error('Error fetching user requests:', error);
      return;
    }

    const allRelatedUserIds = new Set<string>();
    data.forEach(req => {
      allRelatedUserIds.add(req.user_id);
      if (req.assigned_to) {
        allRelatedUserIds.add(req.assigned_to);
      }
    });

    const profilesMap = await fetchProfilesData(Array.from(allRelatedUserIds));

    const requestsWithProfiles = data.map(req => ({
      ...req,
      user_profile: profilesMap[req.user_id] || null,
      assigned_to_profile: req.assigned_to ? profilesMap[req.assigned_to] || null : null,
    }));
    setRequests(requestsWithProfiles as UserRequest[]);
  }, []);

  const handleUpdateRequestStatus = useCallback(async (requestId: string, newStatus: string, userId: string, desiredRank?: string) => {
    const { error } = await supabase
      .from('user_requests')
      .update({ status: newStatus })
      .eq('id', requestId);

    if (error) {
      showError('Error updating request status: ' + error.message);
    } else {
      showSuccess('Request status updated!');
      // If a training/exam request is completed and a desired rank is provided, update pilot's rank
      if (newStatus === 'Completed' && desiredRank) {
        const { data: currentProfile, error: profileError } = await supabase
          .from('profiles')
          .select('rank')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching current pilot rank:', profileError);
          showError('Error fetching pilot rank for update.');
        } else if (currentProfile && RANK_ORDER[desiredRank] > RANK_ORDER[currentProfile.rank]) {
          const { error: rankUpdateError } = await supabase
            .from('profiles')
            .update({ rank: desiredRank })
            .eq('id', userId);

          if (rankUpdateError) {
            showError('Error updating pilot rank: ' + rankUpdateError.message);
          } else {
            showSuccess(`Pilot rank updated to ${desiredRank}!`);
          }
        } else if (currentProfile && RANK_ORDER[desiredRank] <= RANK_ORDER[currentProfile.rank]) {
          showSuccess(`Pilot's current rank (${currentProfile.rank}) is already equal to or higher than the desired rank (${desiredRank}). Rank not updated.`);
        }
      }
      fetchUserRequests(); // Refresh requests after update
    }
  }, [fetchUserRequests]);

  const handleAssignStaff = useCallback(async (requestId: string, staffId: string | null) => {
    const { error } = await supabase
      .from('user_requests')
      .update({ assigned_to: staffId })
      .eq('id', requestId);

    if (error) {
      showError('Error assigning staff: ' + error.message);
    } else {
      showSuccess('Staff assigned successfully!');
      fetchUserRequests(); // Refresh requests after update
    }
  }, [fetchUserRequests]);

  const handleUpdateResolutionNotes = useCallback(async (requestId: string, notes: string) => {
    const { error } = await supabase
      .from('user_requests')
      .update({ resolution_notes: notes })
      .eq('id', requestId);

    if (error) {
      showError('Error updating resolution notes: ' + error.message);
    } else {
      showSuccess('Resolution notes updated!');
      fetchUserRequests(); // Refresh requests
    }
  }, [fetchUserRequests]);

  return {
    requests,
    fetchUserRequests,
    handleUpdateRequestStatus,
    handleAssignStaff,
    handleUpdateResolutionNotes,
  };
};