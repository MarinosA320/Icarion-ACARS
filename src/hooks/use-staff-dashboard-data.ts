import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

import { useUsersManagement } from './useUsersManagement';
import { useFlightsManagement } from './useFlightsManagement';
import { useFlightBookingsManagement } from './useFlightBookingsManagement';
import { useJobOpeningsManagement } from './useJobOpeningsManagement';
import { useJobApplicationsManagement } from './useJobApplicationsManagement';
import { useTrainingRequestsManagement } from './useTrainingRequestsManagement'; // New import

export const useStaffDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [currentUserIsStaff, setCurrentUserIsStaff] = useState(false);

  // Integrate all specialized hooks
  const { users, staffMembers, fetchUsers, fetchStaffMembers, handleUserUpdate } = useUsersManagement();
  const { flights, fetchAllFlights, handleDeleteFlight } = useFlightsManagement();
  const { flightBookings, fetchAllFlightBookings, handleBookingStatusUpdate, handleDeleteBooking } = useFlightBookingsManagement();
  const { jobOpenings, fetchJobOpenings, handleCreateJobOpening, handleUpdateJobOpening, handleDeleteJobOpening } = useJobOpeningsManagement();
  const { jobApplications, fetchJobApplications, handleUpdateApplicationStatus, handleDeleteApplication } = useJobApplicationsManagement();
  const { trainingRequests, fetchAllTrainingRequests, handleUpdateTrainingRequest, handleDeleteTrainingRequest } = useTrainingRequestsManagement(); // New hook integration

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

  return {
    users,
    flights,
    flightBookings,
    jobOpenings,
    jobApplications,
    trainingRequests, // Expose training requests
    staffMembers,
    loading,
    currentUserIsStaff,
    // Expose all fetch and handler functions from sub-hooks
    fetchUsers,
    fetchStaffMembers,
    fetchAllFlights,
    fetchAllFlightBookings,
    fetchJobOpenings,
    fetchJobApplications,
    fetchAllTrainingRequests, // Expose fetch for training requests
    handleUserUpdate,
    handleBookingStatusUpdate,
    handleDeleteBooking,
    handleDeleteFlight,
    handleCreateJobOpening,
    handleUpdateJobOpening,
    handleDeleteJobOpening,
    handleUpdateApplicationStatus,
    handleDeleteApplication,
    handleUpdateTrainingRequest, // Expose update for training requests
    handleDeleteTrainingRequest, // Expose delete for training requests
  };
};