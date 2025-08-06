import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { RANK_ORDER } from '@/utils/aircraftData'; // Import RANK_ORDER for rank updates

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
  type_ratings: string[] | null; // New field
}

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
    rank: string;
  } | null;
  assigned_to_profile: {
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
    vatsim_ivao_id: string | null;
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

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

interface Answer {
  questionId: string;
  selectedOptionIndex?: number;
  textAnswer?: string;
}

interface JobOpening {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  questions: Question[] | null;
}

interface JobApplication {
  id: string;
  job_opening_id: string;
  user_id: string;
  answers: Answer[] | null;
  status: string;
  created_at: string;
  job_opening: {
    title: string;
    questions: Question[] | null;
  } | null;
  user_profile: {
    display_name: string | null;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    discord_username: string | null;
    vatsim_ivao_id: string | null;
    avatar_url: string | null;
    is_staff: boolean;
    rank: string;
  } | null;
}

export const useStaffDashboardData = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<UserRequest[]>([]); // Changed from trainingRequests
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
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
      .select('id, display_name, is_staff, vatsim_ivao_id, first_name, last_name, discord_username, avatar_url, rank, type_ratings'); // Added type_ratings
    if (error) {
      console.error('Error fetching profiles data for user IDs:', error);
      return {};
    }
    const profilesMap: { [key: string]: Profile } = {};
    data.forEach(profile => {
      profilesMap[profile.id] = profile as Profile;
    });
    return profilesMap;
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select("id,first_name,last_name,display_name,discord_username,vatsim_ivao_id,avatar_url,is_staff,rank,type_ratings"); // Added type_ratings

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

  const fetchUserRequests = useCallback(async () => { // Renamed from fetchTrainingRequests
    // Changed select string to directly join with profiles using the new foreign key
    const selectString = "*,user_profile:profiles!user_id(display_name,email,rank),assigned_to_profile:profiles!assigned_to(display_name)";
    console.log("useStaffDashboardData - User Requests Select String:", selectString);
    const { data, error } = await supabase
      .from('user_requests') // Changed table to user_requests
      .select(selectString)
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching user requests: ' + error.message);
      console.error('Error fetching user requests:', error);
      return;
    }

    // The user_profile.email should now be directly available from the join if the profile has an email.
    // If not, the fetchEmailsForUserIds can still act as a fallback or for other cases.
    const allRelatedUserIds = new Set<string>();
    data.forEach(req => {
      if (req.user_profile?.email) {
        // Email is already fetched via join, no need to fetch again
      } else {
        allRelatedUserIds.add(req.user_id);
      }
      if (req.assigned_to) {
        allRelatedUserIds.add(req.assigned_to);
      }
    });

    const userEmailsFallback = await fetchEmailsForUserIds(Array.from(allRelatedUserIds));

    const requestsWithProfiles = data.map(req => ({
      ...req,
      user_profile: req.user_profile ? {
        ...req.user_profile,
        email: req.user_profile.email || userEmailsFallback[req.user_id] || null, // Ensure email is populated
      } : null,
    }));
    setRequests(requestsWithProfiles as UserRequest[]); // Changed state to requests
  }, [fetchEmailsForUserIds]);

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
        vatsim_ivao_id: userProfiles[flight.user_id]?.vatsim_ivao_id || null,
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
  }, [fetchEmailsForUserIds, fetchProfilesData]);

  const fetchJobOpenings = useCallback(async () => {
    const { data, error } = await supabase
      .from('job_openings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching job openings: ' + error.message);
      console.error('Error fetching job openings:', error);
    } else {
      setJobOpenings(data as JobOpening[]);
    }
  }, []);

  const fetchJobApplications = useCallback(async () => {
    const { data, error } = await supabase
      .from('job_applications')
      .select("*,job_opening:job_openings(title,questions),user_profile:profiles(display_name,first_name,last_name,discord_username,vatsim_ivao_id,avatar_url,is_staff,rank,type_ratings)") // Added type_ratings
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching job applications: ' + error.message);
      console.error('Error fetching job applications:', error);
      return;
    }

    const allApplicantUserIds = new Set<string>();
    data.forEach(app => allApplicantUserIds.add(app.user_id));

    const userEmails = await fetchEmailsForUserIds(Array.from(allApplicantUserIds));

    const applicationsWithEmails = data.map(app => ({
      ...app,
      user_profile: app.user_profile ? {
        ...app.user_profile,
        email: userEmails[app.user_id] || null,
      } : null,
    }));
    setJobApplications(applicationsWithEmails as JobApplication[]);
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

  const handleUpdateRequestStatus = useCallback(async (requestId: string, newStatus: string, userId: string, desiredRank?: string) => {
    const { error } = await supabase
      .from('user_requests') // Changed table to user_requests
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
            fetchUsers(); // Refresh users to show new rank
          }
        } else if (currentProfile && RANK_ORDER[desiredRank] <= RANK_ORDER[currentProfile.rank]) {
          showSuccess(`Pilot's current rank (${currentProfile.rank}) is already equal to or higher than the desired rank (${desiredRank}). Rank not updated.`);
        }
      }
      fetchUserRequests(); // Refresh requests after update
    }
  }, [fetchUserRequests, fetchUsers]);

  const handleAssignStaff = useCallback(async (requestId: string, staffId: string | null) => {
    const { error } = await supabase
      .from('user_requests') // Changed table to user_requests
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
      const pathSegments = url.pathname.split('/');
      const publicIndex = pathSegments.indexOf('public');
      const bucketName = pathSegments[publicIndex + 1];
      const filePathInStorage = pathSegments.slice(publicIndex + 2).join('/');

      const { error: storageError } = await supabase.storage
        .from('flight-images')
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

  const handleCreateJobOpening = useCallback(async (newJob: Omit<JobOpening, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('job_openings').insert(newJob);
    if (error) {
      showError('Error creating job opening: ' + error.message);
    } else {
      showSuccess('Job opening created successfully!');
      fetchJobOpenings();
    }
  }, [fetchJobOpenings]);

  const handleUpdateJobOpening = useCallback(async (jobId: string, updatedFields: Partial<JobOpening>) => {
    const { error } = await supabase
      .from('job_openings')
      .update(updatedFields)
      .eq('id', jobId);

    if (error) {
      showError('Error updating job opening: ' + error.message);
    } else {
      showSuccess('Job opening updated successfully!');
      fetchJobOpenings();
    }
  }, [fetchJobOpenings]);

  const handleDeleteJobOpening = useCallback(async (jobId: string) => {
    const { error } = await supabase
      .from('job_openings')
      .delete()
      .eq('id', jobId);

    if (error) {
      showError('Error deleting job opening: ' + error.message);
    } else {
      showSuccess('Job opening deleted successfully!');
      fetchJobOpenings();
    }
  }, [fetchJobOpenings]);

  const handleUpdateApplicationStatus = useCallback(async (applicationId: string, newStatus: string) => {
    const { error } = await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    if (error) {
      showError('Error updating application status: ' + error.message);
    } else {
      showSuccess('Application status updated!');
      fetchJobApplications(); // Refresh applications
    }
  }, [fetchJobApplications]);

  const handleDeleteApplication = useCallback(async (applicationId: string) => {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', applicationId);

    if (error) {
      showError('Error deleting application: ' + error.message);
    } else {
      showSuccess('Application deleted successfully!');
      fetchJobApplications(); // Refresh applications
    }
  }, [fetchJobApplications]);

  return {
    users,
    requests, // Changed from trainingRequests
    flights,
    flightBookings,
    jobOpenings,
    jobApplications,
    staffMembers,
    loading,
    currentUserIsStaff,
    fetchUsers,
    fetchStaffMembers,
    fetchUserRequests, // Changed from fetchTrainingRequests
    fetchAllFlights,
    fetchAllFlightBookings,
    fetchJobOpenings,
    fetchJobApplications,
    handleUserUpdate,
    handleUpdateRequestStatus, // Changed from handleTrainingRequestStatusUpdate
    handleAssignStaff, // Changed from handleAssignInstructor
    handleUpdateResolutionNotes, // New handler
    handleBookingStatusUpdate,
    handleDeleteBooking,
    handleDeleteFlight,
    handleCreateJobOpening,
    handleUpdateJobOpening,
    handleDeleteJobOpening,
    handleUpdateApplicationStatus,
    handleDeleteApplication,
  };
};