import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserDetailsDialog from '@/components/UserDetailsDialog';
import UserManagementTab from '@/components/staff/UserManagementTab';
import LogbookEntryManagementTab from '@/components/staff/LogbookEntryManagementTab';
import JobOpeningManagementTab from '@/components/staff/JobOpeningManagementTab';
import CreateJobOpeningForm from '@/components/staff/CreateJobOpeningForm';
import JobApplicationManagementTab from '@/components/staff/JobApplicationManagementTab';
import TrainingRequestManagementTab from '@/components/staff/TrainingRequestManagementTab';
import { useStaffDashboardData } from '@/hooks/use-staff-dashboard-data';
import { Skeleton } from '@/components/ui/skeleton';
// Removed DynamicBackground import

const StaffDashboard = () => {
  const {
    users,
    flights,
    jobOpenings,
    jobApplications,
    trainingRequests,
    staffMembers,
    loading,
    currentUserIsStaff,
    fetchUsers,
    fetchStaffMembers,
    fetchAllFlights,
    fetchJobOpenings,
    fetchJobApplications,
    fetchAllTrainingRequests,
    handleUserUpdate,
    handleDeleteFlight,
    handleCreateJobOpening,
    handleUpdateJobOpening,
    handleDeleteJobOpening,
    handleUpdateApplicationStatus,
    handleDeleteApplication,
    handleUpdateTrainingRequest,
    handleDeleteTrainingRequest,
  } = useStaffDashboardData();

  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('users');

  // Fetch data based on active tab
  useEffect(() => {
    if (!currentUserIsStaff) return;

    switch (activeTab) {
      case 'users':
        fetchUsers();
        fetchStaffMembers();
        break;
      case 'logbook-entries':
        fetchAllFlights();
        break;
      case 'announcements':
        // Announcements are managed on their own page now, no data fetch needed here
        break;
      case 'job-openings':
        fetchJobOpenings();
        break;
      case 'job-applications':
        fetchJobApplications();
        break;
      case 'training-requests':
        fetchAllTrainingRequests();
        break;
      default:
        break;
    }
  }, [activeTab, currentUserIsStaff, fetchUsers, fetchStaffMembers, fetchAllFlights, fetchJobOpenings, fetchJobApplications, fetchAllTrainingRequests]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!currentUserIsStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-600">Access Denied</h1>
          <p className="text-xl text-gray-900">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col items-center justify-start p-4 pt-24">
        <h1 className="text-3xl font-bold mb-8 text-center">Staff Dashboard</h1>

        <div className="w-full bg-white p-6 rounded-lg shadow-lg">
          <Tabs defaultValue="users" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="logbook-entries">Logbook Entries</TabsTrigger>
              {/* Removed Flight Bookings Tab */}
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="job-openings">Job Openings</TabsTrigger>
              <TabsTrigger value="job-applications">Job Applications</TabsTrigger>
              <TabsTrigger value="training-requests">Training Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <UserManagementTab
                users={users}
                handleUserUpdate={handleUserUpdate}
                isUserDetailsDialogOpen={isUserDetailsDialogOpen}
                selectedUser={selectedUser}
                setIsUserDetailsDialogOpen={setIsUserDetailsDialogOpen}
                setSelectedUser={setSelectedUser}
              />
            </TabsContent>

            <TabsContent value="logbook-entries" className="mt-6">
              <LogbookEntryManagementTab
                flights={flights}
                handleDeleteFlight={handleDeleteFlight}
              />
            </TabsContent>

            {/* Removed Flight Bookings Content */}

            <TabsContent value="announcements" className="mt-6">
              <p className="text-center text-gray-600">
                Announcement management has been moved to the <a href="/announcements" className="text-blue-500 hover:underline">Announcements page</a>.
              </p>
            </TabsContent>

            <TabsContent value="job-openings" className="mt-6">
              <CreateJobOpeningForm onJobPosted={fetchJobOpenings} />
              <JobOpeningManagementTab
                jobOpenings={jobOpenings}
                handleUpdateJobOpening={handleUpdateJobOpening}
                handleDeleteJobOpening={handleDeleteJobOpening}
                fetchJobOpenings={fetchJobOpenings}
              />
            </TabsContent>

            <TabsContent value="job-applications" className="mt-6">
              <JobApplicationManagementTab
                jobApplications={jobApplications}
                handleUpdateApplicationStatus={handleUpdateApplicationStatus}
                handleDeleteApplication={handleDeleteApplication}
                fetchJobApplications={fetchJobApplications}
              />
            </TabsContent>

            <TabsContent value="training-requests" className="mt-6">
              <TrainingRequestManagementTab
                trainingRequests={trainingRequests}
                staffMembers={staffMembers}
                handleUpdateTrainingRequest={handleUpdateTrainingRequest}
                handleDeleteTrainingRequest={handleDeleteTrainingRequest}
                fetchTrainingRequests={fetchAllTrainingRequests}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedUser && (
        <UserDetailsDialog
          isOpen={isUserDetailsDialogOpen}
          onClose={() => setIsUserDetailsDialogOpen(false)}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default StaffDashboard;