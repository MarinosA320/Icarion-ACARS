import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { fetchProfilesData } from '@/utils/supabaseDataFetch';

export interface TrainingRequest {
  id: string;
  user_id: string;
  desired_rank: string;
  aircraft_type: string;
  preferred_date_time: string;
  prior_experience: string | null;
  optional_message: string | null;
  status: string;
  created_at: string;
  instructor_id: string | null;
  training_category: string; // New field
  user_profile: {
    display_name: string | null;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    discord_username: string | null;
    vatsim_ivao_id: string | null;
    avatar_url: string | null;
    is_staff: boolean | null;
    rank: string | null;
  } | null;
  instructor_profile: {
    display_name: string | null;
    email: string | null;
  } | null;
}

export const useTrainingRequestsManagement = () => {
  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>([]);
  const [myTrainingRequests, setMyTrainingRequests] = useState<TrainingRequest[]>([]);

  const fetchAllTrainingRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from('training_requests')
      .select('id,user_id,desired_rank,aircraft_type,preferred_date_time,prior_experience,optional_message,status,created_at,instructor_id,training_category') // Select new field
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching training requests: ' + error.message);
      console.error('Error fetching training requests:', error);
      return;
    }

    const allUserIds = new Set<string>();
    data.forEach(req => {
      allUserIds.add(req.user_id);
      if (req.instructor_id) allUserIds.add(req.instructor_id);
    });

    const profilesMap = await fetchProfilesData(Array.from(allUserIds));

    const requestsWithProfiles = data.map(req => ({
      ...req,
      user_profile: profilesMap[req.user_id] || null,
      instructor_profile: req.instructor_id ? profilesMap[req.instructor_id] || null : null,
    }));
    setTrainingRequests(requestsWithProfiles as TrainingRequest[]);
  }, []);

  const fetchMyTrainingRequests = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMyTrainingRequests([]);
      return;
    }

    const { data, error } = await supabase
      .from('training_requests')
      .select('id,user_id,desired_rank,aircraft_type,preferred_date_time,prior_experience,optional_message,status,created_at,instructor_id,training_category') // Select new field
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching your training requests: ' + error.message);
      console.error('Error fetching your training requests:', error);
      return;
    }

    const allUserIds = new Set<string>();
    data.forEach(req => {
      allUserIds.add(req.user_id);
      if (req.instructor_id) allUserIds.add(req.instructor_id);
    });

    const profilesMap = await fetchProfilesData(Array.from(allUserIds));

    const requestsWithProfiles = data.map(req => ({
      ...req,
      user_profile: profilesMap[req.user_id] || null,
      instructor_profile: req.instructor_id ? profilesMap[req.instructor_id] || null : null,
    }));
    setMyTrainingRequests(requestsWithProfiles as TrainingRequest[]);
  }, []);

  const handleCreateTrainingRequest = useCallback(async (newRequest: Omit<TrainingRequest, 'id' | 'created_at' | 'user_profile' | 'instructor_profile' | 'status' | 'instructor_id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('You must be logged in to submit a request.');
      return;
    }

    const { error } = await supabase.from('training_requests').insert({
      ...newRequest,
      user_id: user.id,
      status: 'Pending', // Default status
    });

    if (error) {
      showError('Error submitting training request: ' + error.message);
    } else {
      showSuccess('Training request submitted successfully!');
      fetchMyTrainingRequests(); // Refresh user's requests
    }
  }, [fetchMyTrainingRequests]);

  const handleUpdateTrainingRequest = useCallback(async (requestId: string, updatedFields: Partial<TrainingRequest>) => {
    const { error } = await supabase
      .from('training_requests')
      .update(updatedFields)
      .eq('id', requestId);

    if (error) {
      showError('Error updating training request: ' + error.message);
    } else {
      showSuccess('Training request updated successfully!');
      fetchAllTrainingRequests(); // Refresh all requests for staff view
      fetchMyTrainingRequests(); // Refresh user's requests
    }
  }, [fetchAllTrainingRequests, fetchMyTrainingRequests]);

  const handleDeleteTrainingRequest = useCallback(async (requestId: string) => {
    const { error } = await supabase
      .from('training_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      showError('Error deleting training request: ' + error.message);
    } else {
      showSuccess('Training request deleted successfully!');
      fetchAllTrainingRequests(); // Refresh all requests for staff view
      fetchMyTrainingRequests(); // Refresh user's requests
    }
  }, [fetchAllTrainingRequests, fetchMyTrainingRequests]);

  return {
    trainingRequests,
    myTrainingRequests,
    fetchAllTrainingRequests,
    fetchMyTrainingRequests,
    handleCreateTrainingRequest,
    handleUpdateTrainingRequest,
    handleDeleteTrainingRequest,
  };
};