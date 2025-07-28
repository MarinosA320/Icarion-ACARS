import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import UserDetailsDialog from '@/components/UserDetailsDialog';

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
  email?: string;
}

interface UserManagementTabProps {
  users: Profile[];
  handleUserUpdate: (userId: string, field: string, value: any) => Promise<void>;
  isUserDetailsDialogOpen: boolean;
  selectedUser: Profile | null;
  setIsUserDetailsDialogOpen: (isOpen: boolean) => void;
  setSelectedUser: (user: Profile | null) => void;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  handleUserUpdate,
  isUserDetailsDialogOpen,
  selectedUser,
  setIsUserDetailsDialogOpen,
  setSelectedUser,
}) => {
  const handleViewUserDetails = (user: Profile) => {
    setSelectedUser(user);
    setIsUserDetailsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
        <CardDescription>View and update user profiles and roles.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display Name</TableHead>
              <TableHead>Real Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.display_name}</TableCell>
                <TableCell>{user.first_name} {user.last_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select value={user.rank} onValueChange={(value) => handleUserUpdate(user.id, 'rank', value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select Rank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trainee">Trainee</SelectItem>
                      <SelectItem value="First Officer">First Officer</SelectItem>
                      <SelectItem value="Captain">Captain</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select value={user.is_staff ? 'true' : 'false'} onValueChange={(value) => handleUserUpdate(user.id, 'is_staff', value === 'true')}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleViewUserDetails(user)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {selectedUser && (
        <UserDetailsDialog
          isOpen={isUserDetailsDialogOpen}
          onClose={() => setIsUserDetailsDialogOpen(false)}
          user={selectedUser}
        />
      )}
    </Card>
  );
};

export default UserManagementTab;