import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';

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
  } | null;
  assigned_to_profile: {
    display_name: string | null;
  } | null;
}

const MyRequests = () => {
  const [requests, setRequests] = useState<UserRequest[]>([]);
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
    const fetchUserRequests = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('User not logged in.');
        setLoading(false);
        return;
      }

      const selectString = "*,user_profile:profiles!user_requests_user_id_fkey(display_name),assigned_to_profile:profiles!user_requests_assigned_to_fkey(display_name)";
      const { data, error } = await supabase
        .from('user_requests')
        .select(selectString)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        showError('Error fetching requests: ' + error.message);
        console.error('Error fetching requests:', error);
        setLoading(false);
        return;
      }

      const allRelatedUserIds = new Set<string>();
      data.forEach(req => {
        allRelatedUserIds.add(req.user_id);
        if (req.assigned_to) {
          allRelatedUserIds.add(req.assigned_to);
        }
      });

      const userEmails = await fetchEmailsForUserIds(Array.from(allRelatedUserIds));
      // user_profile and assigned_to_profile are already embedded, just need to add email to user_profile

      const requestsWithProfiles = data.map(req => ({
        ...req,
        user_profile: req.user_profile ? {
          ...req.user_profile,
          email: userEmails[req.user_id] || null,
        } : null,
      }));
      setRequests(requestsWithProfiles as UserRequest[]);
      setLoading(false);
    };

    fetchUserRequests();
  }, [fetchEmailsForUserIds]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-500';
      case 'Approved':
      case 'Completed':
      case 'Resolved':
        return 'text-green-500';
      case 'Rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getRequestTypeDisplay = (type: string) => {
    switch (type) {
      case 'training': return 'Training Request';
      case 'exam': return 'Exam Request';
      case 'contact': return 'General Contact';
      case 'new_member_orientation': return 'New Member Orientation';
      case 'advisory_real_pilot': return 'Advisory for Real Pilot Career';
      case 'improvement_request': return 'Request for Improvement';
      case 'report_member': return 'Report a Member';
      case 'tech_support': return 'Technical Support';
      case 'report_staff': return 'Report a Staff Member';
      case 'other': return 'Other Request';
      default: return type;
    }
  };

  const renderRequestDetails = (request: UserRequest) => {
    if (!request.details) return null;

    switch (request.request_type) {
      case 'training':
      case 'exam':
        return (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Desired Rank: {request.details.desired_rank}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Aircraft Type: {request.details.aircraft_type}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Preferred Date/Time (UTC): {request.details.preferred_date_time ? format(new Date(request.details.preferred_date_time), 'PPP p') : 'N/A'}
            </p>
            {request.details.prior_experience && (
              <div className="mt-4">
                <p className="font-medium text-sm">Prior Experience:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{request.details.prior_experience}</p>
              </div>
            )}
            {request.details.optional_message && (
              <div className="mt-2">
                <p className="font-medium text-sm">Optional Message:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{request.details.optional_message}</p>
              </div>
            )}
          </>
        );
      case 'contact':
      case 'new_member_orientation':
      case 'advisory_real_pilot':
      case 'improvement_request':
      case 'report_member':
      case 'tech_support':
      case 'report_staff':
      case 'other':
        return (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Subject: {request.details.subject}
            </p>
            <div className="mt-2">
              <p className="font-medium text-sm">Message:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{request.details.message}</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">My Requests</h1>

      {loading && requests.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">Loading your requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">You have not submitted any requests yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">
                  {getRequestTypeDisplay(request.request_type)}
                </CardTitle>
                <CardDescription className="text-sm">
                  Submitted On: {format(new Date(request.created_at), 'PPP p')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className={`text-sm font-semibold ${getStatusColor(request.status)} mb-2`}>
                  Status: {request.status}
                </p>
                {request.assigned_to_profile?.display_name && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Assigned To: {request.assigned_to_profile.display_name}
                  </p>
                )}
                {renderRequestDetails(request)}
                {request.resolution_notes && (
                  <div className="mt-4">
                    <p className="font-medium text-sm">Resolution Notes:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{request.resolution_notes}</p>
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

export default MyRequests;