import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserDetailsDialog from '@/components/UserDetailsDialog';
import UserManagementTab from '@/components/staff/UserManagementTab';
import TrainingRequestManagementTab from '@/components/staff/TrainingRequestManagementTab';
import LogbookEntryManagementTab from '@/components/staff/LogbookEntryManagementTab';
import FlightBookingManagementTab from '@/components/staff/FlightBookingManagementTab';
import { useStaffDashboardData } from '@/hooks/use-staff-dashboard-data'; // Import the new hook

const StaffDashboard = () => {
  const {
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
  } = useStaffDashboardData(); // Use the custom hook

  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null); // Use 'any' for now to match UserDetailsDialogProps
  const [activeTab, setActiveTab] = useState('users'); // State to manage active tab

  // Fetch data based on active tab
  useEffect(() => {
    if (!currentUserIsStaff) return;

    switch (activeTab) {
      case 'users':
        fetchUsers();
        fetchStaffMembers(); // Staff members are needed for training requests tab, so fetch here
        break;
      case 'training-requests':
        fetchTrainingRequests();
        fetchStaffMembers();
        break;
      case 'logbook-entries':
        fetchAllFlights();
        break;
      case 'flight-bookings':
        fetchAllFlightBookings();
        break;
      case 'announcements':
        // Announcements are managed on their own page now, no data fetch needed here
        break;
      default:
        break;
    }
  }, [activeTab, currentUserIsStaff, fetchUsers, fetchStaffMembers, fetchTrainingRequests, fetchAllFlights, fetchAllFlightBookings]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Staff Dashboard...</div>;
  }

  if (!currentUserIsStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-600">Access Denied</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Staff Dashboard</h1>

      <Tabs defaultValue="users" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="training-requests">Training Requests</TabsTrigger>
          <TabsTrigger value="logbook-entries">Logbook Entries</TabsTrigger>
          <TabsTrigger value="flight-bookings">Flight Bookings</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
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

        <TabsContent value="training-requests" className="mt-6">
          <TrainingRequestManagementTab
            trainingRequests={trainingRequests}
            staffMembers={staffMembers}
            handleTrainingRequestStatusUpdate={handleTrainingRequestStatusUpdate}
            handleAssignInstructor={handleAssignInstructor}
          />
        </TabsContent>

        <TabsContent value="logbook-entries" className="mt-6">
          <LogbookEntryManagementTab
            flights={flights}
            handleDeleteFlight={handleDeleteFlight}
          />
        </TabsContent>

        <TabsContent value="flight-bookings" className="mt-6">
          <FlightBookingManagementTab
            flightBookings={flightBookings}
            handleBookingStatusUpdate={handleBookingStatusUpdate}
            handleDeleteBooking={handleDeleteBooking}
          />
        </TabsContent>

        <TabsContent value="announcements" className="mt-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Announcement management has been moved to the <a href="/announcements" className="text-blue-500 hover:underline">Announcements page</a>.
          </p>
        </TabsContent>
      </Tabs>

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