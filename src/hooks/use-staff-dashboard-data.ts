import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  discord_username: string | null;
  vatsim_ivao_id: string | null;
  avatar_url: string | null;
  is_staff: boolean;
  rank: string;
  email: string | null; // Ensure email is always present
}

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
  instructor_id: string | null;
  user_profile: {
    display_name: string | null;
    email: string | null;
  } | null;
  instructor_profile: {
    display_name: string | null;
  } | null;
}

interface Flight {
  id: string;
  user_id: string;
  departure_airport: string;
  arrival_airport: string;
  aircraft_type: string;
  flight_time: string;
  landing_rate: number | null;
  flight_image_url: string | null;
  flight_number: string | null;
  pilot_role: string;
  etd: string | null;
  atd: string | null;
  eta: string | null;
  ata: string | null;
  flight_rules: string | null;
  flight_plan: string | null;
  departure_runway: string | null;
  arrival_runway: string | null;
  taxiways_used: string | null;
  gates_used_dep: string | null;
  gates_used_arr: string | null;
  departure_type: string | null;
  arrival_type: string | null;
  remarks: string | null;
  created_at: string;
  user_profile: {
    display_name: string;
    is_staff: boolean;
    email: string | null;
  } | null;
}

interface FlightBooking {
  id: string;
  user_id: string;
  departure_airport: string;
  arrival_airport: string;
  aircraft_type: string;
  aircraft_registration: string;
  flight_number: string | null;
  airline_name: string;
  etd: string | null;
  eta: string | null;
  status: string;
  created_at: string;
  user_profile: {
    display_name: string | null;
    email: string | null;
  } | null;
}

export const useStaffDashboardData = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);
  const [staffMembers, setStaffMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserIsStaff, setCurrentUserIsStaff] = useState(false);

  const fetchEmailsForUserIds = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) {
      console.log('fetchEmailsForUserIds: No user IDs provided, returning empty object.');
      return {};
    }
    console.log('fetchEmailsForUserIds: Attempting to invoke get-user-emails with user IDs:', userIds);
    try {
      const response = await supabase.functions.invoke('get-user-emails', {
        body: { user_ids: userIds },
      });

      if (response.error) {
        console.error('fetchEmailsForUserIds: Error invoking get-user-emails function:', response.error);
        showError('Error fetching user emails.');
        return {};
      } else if (response.data) {
        console.log('fetchEmailsForUserIds: Received data from get-user-emails:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('fetchEmailsForUserIds: Caught error during function invocation:', error);
      showError('Network error fetching user emails. Please check your internet connection or try again later.');
    }
    return {};
  }, []);

  const fetchProfilesData = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) {
      return {};
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, is_staff'); // Include is_staff for other uses

    if (error) {
      console.error('Error fetching profiles data for user IDs:', error);
      return {};
    }
    const profilesMap: { [key: string]: { display_name: string | null, is_staff: boolean } } = {};
    data.forEach(profile => {
      profilesMap[profile.id] = { display_name: profile.display_name, is_staff: profile.is_staff };
    });
    return profilesMap;
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select("id,first_name,last_name,display_name,discord_username,vatsim_ivao_id,avatar_url,is_staff,rank");

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
  }, [fetchEmailsForUserIds]);

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

  const fetchTrainingRequests = useCallback(async () => {
    // Explicitly list all columns from training_requests and embed instructor_profile using FK name
    const selectString = "id,user_id,desired_rank,aircraft_type,preferred_date_time,prior_experience,optional_message,status,created_at,instructor_id,instructor_profile:profiles!fk_training_requests_instructor_id(display_name)";
    console.log("useStaffDashboardData - Training Requests Select String:", selectString);
    const { data, error } = await supabase
      .from('training_requests')
      .select(selectString)
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching training requests: ' + error.message);
      console.error('Error fetching training requests:', error);
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
  }, [fetchEmailsForUserIds, fetchProfilesData]);

  const fetchAllFlights = useCallback(async () => {
    const { data, error } = await supabase
      .from('flights')
      .select("id,user_id,departure_airport,arrival_airport,aircraft_type,flight_time,landing_rate,flight_image_url,flight_number,pilot_role,etd,atd,eta,ata,flight_rules,flight_plan,departure_runway,arrival_runway,taxiways_used,gates_used_dep,gates_used_arr,departure_type,arrival_type,remarks,created_at");

    if (error) {
      showError('Error fetching all flights: ' + error.message);
      console.error('Error fetching all flights:', error);
      return;
    }

    const allFlightUserIds = new Set<string>();
    data.forEach(flight => allFlightUserIds.add(flight.user_id));

    const userEmails = await fetchEmailsForUserIds(Array.from(allFlightUserIds));
    const userProfiles = await fetchProfilesData(Array.from(allFlightUserIds));

    const flightsWithProfiles = data.map(flight => ({
      ...flight,
      user_profile: {
        display_name: userProfiles[flight.user_id]?.display_name || null,
        is_staff: userProfiles[flight.user_id]?.is_staff || false,
        email: userEmails[flight.user_id] || null,
      },
    }));
    setFlights(flightsWithProfiles as Flight[]);
  }, [fetchEmailsForUserIds, fetchProfilesData]);

  const fetchAllFlightBookings = useCallback(async () => {
    const { data, error } = await supabase
      .from('flight_bookings')
      .select("id,user_id,departure_airport,arrival_airport,aircraft_type,aircraft_registration,flight_number,airline_name,etd,eta,status,created_at");

    if (error) {
      showError('Error fetching all flight bookings: ' + error.message);
      console.error('Error fetching all flight bookings:', error);
      return;
    }

    const allBookingUserIds = new Set<string>();
    data.forEach(booking => allBookingUserIds.add(booking.user_id));

    const userEmails = await fetchEmailsForUserIds(Array.from(allBookingUserIds));
    const userProfiles = await fetchProfilesData(Array.from(allBookingUserIds));

    const bookingsWithEmails = data.map(booking => ({
      ...booking,
      user_profile: {
        display_name: userProfiles[booking.user_id]?.display_name || null,
        email: userEmails[booking.user_id] || null,
      },
    }));
    setFlightBookings(bookingsWithEmails as FlightBooking[]);
  }, [fetchEmailsForUserIds]);

  useEffect(() => {
    const checkStaffStatus = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        showError('Authentication error. Please log in.');
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_staff')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.is_staff) {
        showError('Access Denied: You must be staff to view this page.');
        setLoading(false);
        return;
      }
      setCurrentUserIsStaff(true);
      setLoading(false);
    };

    checkStaffStatus();
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
      fetchUsers(); // Refresh users after update
    }
  }, [fetchUsers]);

  const handleTrainingRequestStatusUpdate = useCallback(async (requestId: string, newStatus: string, userId: string, desiredRank: string) => {
    const { error } = await supabase
      .from('training_requests')
      .update({ status: newStatus })
      .eq('id', requestId);

    if (error) {
      showError('Error updating request status: ' + error.message);
    } else {
      showSuccess('Training request status updated!');
      if (newStatus === 'Completed') {
        if (window.confirm(`Are you sure you want to promote this pilot to ${desiredRank}?`)) {
          const { error: rankUpdateError } = await supabase
            .from('profiles')
            .update({ rank: desiredRank })
            .eq('id', userId);

          if (rankUpdateError) {
            showError('Error updating pilot rank: ' + rankUpdateError.message);
          } else {
            showSuccess(`Pilot rank updated to ${desiredRank}!`);
            fetchUsers(); // Refresh users to show new rank
          }
        }
      }
      fetchTrainingRequests(); // Refresh training requests after update
    }
  }, [fetchTrainingRequests, fetchUsers]);

  const handleAssignInstructor = useCallback(async (requestId: string, instructorId: string | null) => {
    const { error } = await supabase
      .from('training_requests')
      .update({ instructor_id: instructorId }) // Now correctly handles null
      .eq('id', requestId);

    if (error) {
      showError('Error assigning instructor: ' + error.message);
    } else {
      showSuccess('Instructor assigned successfully!');
      fetchTrainingRequests(); // Refresh training requests after update
    }
  }, [fetchTrainingRequests]);

  const handleBookingStatusUpdate = useCallback(async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('flight_bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (error) {
      showError('Error updating booking status: ' + error.message);
    } else {
      showSuccess('Flight booking status updated!');
      fetchAllFlightBookings(); // Refresh flight bookings after update
    }
  }, [fetchAllFlightBookings]);

  const handleDeleteBooking = useCallback(async (bookingId: string) => {
    const { error } = await supabase
      .from('flight_bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      showError('Error deleting flight booking: ' + error.message);
    } else {
      showSuccess('Flight booking deleted successfully!');
      fetchAllFlightBookings(); // Refresh flight bookings after delete
    }
  }, [fetchAllFlightBookings]);

  const handleDeleteFlight = useCallback(async (flightId: string, flightImageUrl: string | null) => {
    if (flightImageUrl) {
      const url = new URL(flightImageUrl);
      // Assuming the path is /storage/v1/object/public/<bucket_name>/<path_to_file>
      const pathSegments = url.pathname.split('/');
      // Find the index of 'public' and take everything after it
      const publicIndex = pathSegments.indexOf('public');
      const bucketName = pathSegments[publicIndex + 1]; // e.g., 'flight_images'
      const filePathInStorage = pathSegments.slice(publicIndex + 2).join('/'); // e.g., 'flight_images/user-id-timestamp.jpg'

      const { error: storageError } = await supabase.storage
        .from(bucketName) // Use the extracted bucket name
        .remove([filePathInStorage]);

      if (storageError) {
        showError('Error deleting flight image from storage: ' + storageError.message);
        return;
      }
    }

    const { error: dbError } = await supabase
      .from('flights')
      .delete()
      .eq('id', flightId);

    if (dbError) {
      showError('Error deleting flight record: ' + dbError.message);
    } else {
      showSuccess('Flight record deleted successfully!');
      fetchAllFlights(); // Refresh flights after delete
    }
  }, [fetchAllFlights]);

  return {
    users,
    trainingRequests,
    flights,
    flightBookings,
    staffMembers,
    loading,
    currentUserIsStaff,
    fetchUsers,
    fetchStaffMembers,
    fetchTrainingRequests,
    fetchAllFlights,
    fetchAllFlightBookings,
    handleUserUpdate,
    handleTrainingRequestStatusUpdate,
    handleAssignInstructor,
    handleBookingStatusUpdate,
    handleDeleteBooking,
    handleDeleteFlight,
  };
};