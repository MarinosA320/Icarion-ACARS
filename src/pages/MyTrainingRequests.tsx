import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';

interface TrainingRequest {
  id: string;
  user_id: string;
  desired_rank: string;
  aircraft_type: string;
  preferred_date_time: string;
  prior_experience: string | null;
  optional_message: string | null;
  status: string;
  created_at: string;
  instructor_id: string | null; // New field
  user_profile: { // Changed from 'profiles'
    display_name: string | null;
    email: string | null; // Added email here as it's needed for display
  } | null;
  instructor_profile: { // New field for instructor's profile
    display_name: string | null;
  } | null;
}

const MyTrainingRequests = () => {
  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmailsForUserIds = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) {
      return {};
    }
    try {
      const response = await supabase.functions.invoke('get-user-emails', {
        body: { user_ids: userIds },
      });
      if (response.error) {
        console.error('Error invoking get-user-emails function:', response.error);
        return {};
      }
      return response.data;
    } catch (error) {
      console.error('Network error invoking get-user-emails function:', error);
      return {};
    }
  }, []);

  const fetchProfilesData = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) {
      return {};
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name');

    if (error) {
      console.error('Error fetching profiles data for user IDs:', error);
      return {};
    }
    const profilesMap: { [key: string]: { display_name: string | null } } = {};
    data.forEach(profile => {
      profilesMap[profile.id] = { display_name: profile.display_name };
    });
    return profilesMap;
  }, []);

  useEffect(() => {
    const fetchTrainingRequests = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('User not logged in.');
        setLoading(false);
        return;
      }

      // Explicitly list all columns from training_requests and embed instructor_profile using FK name
      const selectString = "id,user_id,desired_rank,aircraft_type,preferred_date_time,prior_experience,optional_message,status,created_at,instructor_id,instructor_profile:profiles!fk_training_requests_instructor_id(display_name)";
      console.log("MyTrainingRequests - Select String:", selectString);
      const { data, error } = await supabase
        .from('training_requests')
        .select(selectString)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        showError('Error fetching training requests: ' + error.message);
        console.error('Error fetching training requests:', error);
        setLoading(false);
        return;
      }

      const allRelatedUserIds = new Set<string>();
      data.forEach(req => {
        allRelatedUserIds.add(req.user_id);
        if (req.instructor_id) {
          allRelatedUserIds.add(req.instructor_id);
        }
      });

      const userEmails = await fetchEmailsForUserIds(Array.from(allRelatedUserIds));
      const userDisplayNames = await fetchProfilesData(Array.from(allRelatedUserIds));

      const requestsWithProfiles = data.map(req => ({
        ...req,
        user_profile: {
          display_name: userDisplayNames[req.user_id]?.display_name || null,
          email: userEmails[req.user_id] || null,
        },
        // instructor_profile is already embedded correctly by Supabase
      }));
      setTrainingRequests(requestsWithProfiles as TrainingRequest[]);
      setLoading(false);
    };

    fetchTrainingRequests();
  }, [fetchEmailsForUserIds, fetchProfilesData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-500';
      case 'Approved':
        return 'text-green-500';
      case 'Rejected':
        return 'text-red-500';
      case 'Completed':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">My Training & Exam Requests</h1>

      {loading && trainingRequests.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">Loading your requests...</p>
      ) : trainingRequests.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">You have not submitted any training or exam requests yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingRequests.map((request) => (
            <Card key={request.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">
                  Request for: {request.desired_rank}
                </CardTitle>
                <CardDescription className="text-sm">
                  Aircraft Type: {request.aircraft_type}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Preferred Date/Time: {format(new Date(request.preferred_date_time), 'PPP p')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Submitted On: {format(new Date(request.created_at), 'PPP p')}
                </p>
                <p className={`text-sm font-semibold ${getStatusColor(request.status)}`}>
                  Status: {request.status}
                </p>
                {request.instructor_profile?.display_name && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Assigned Instructor: {request.instructor_profile.display_name}
                  </p>
                )}
                {request.prior_experience && (
                  <div className="mt-4">
                    <p className="font-medium text-sm">Prior Experience:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{request.prior_experience}</p>
                  </div>
                )}
                {request.optional_message && (
                  <div className="mt-2">
                    <p className="font-medium text-sm">Message:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{request.optional_message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrainingRequests;