import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import UserDetailsDialog from '@/components/UserDetailsDialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, PlusCircle } from 'lucide-react';
import { AIRCRAFT_FAMILIES, ALL_AIRLINES } from '@/utils/aircraftData'; // Import ALL_AIRLINES
import SendMessageDialog from '@/components/staff/SendMessageDialog'; // New import

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
  type_ratings: string[] | null;
  authorized_airlines: string[] | null; // New field
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isSendMessageDialogOpen, setIsSendMessageDialogOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<{ id: string; display_name: string } | null>(null);

  const handleViewUserDetails = (user: Profile) => {
    setSelectedUser(user);
    setIsUserDetailsDialogOpen(true);
  };

  const handleSendMessageClick = (user: Profile) => {
    setMessageRecipient({ id: user.id, display_name: user.display_name || 'N/A' });
    setIsSendMessageDialogOpen(true);
  };

  const handleTypeRatingChange = (userId: string, currentRatings: string[] | null, family: string, isChecked: boolean) => {
    let newRatings = currentRatings ? [...currentRatings] : [];
    if (isChecked) {
      if (!newRatings.includes(family)) {
        newRatings.push(family);
      }
    } else {
      newRatings = newRatings.filter(r => r !== family);
    }
    handleUserUpdate(userId, 'type_ratings', newRatings);
  };

  const handleAuthorizedAirlineChange = (userId: string, currentAirlines: string[] | null, airlineName: string, isChecked: boolean) => {
    let newAirlines = currentAirlines ? [...currentAirlines] : [];
    if (isChecked) {
      if (!newAirlines.includes(airlineName)) {
        newAirlines.push(airlineName);
      }
    } else {
      newAirlines = newAirlines.filter(a => a !== airlineName);
    }
    handleUserUpdate(userId, 'authorized_airlines', newAirlines);
  };

  const allAircraftFamilies = Object.values(AIRCRAFT_FAMILIES).filter((value, index, self) => self.indexOf(value) === index);
  const allAirlineNames = ALL_AIRLINES.map(airline => airline.name);

  const filteredUsers = users.filter(user => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      user.display_name?.toLowerCase().includes(lowerCaseSearchTerm) ||
      user.first_name?.toLowerCase().includes(lowerCaseSearchTerm) ||
      user.last_name?.toLowerCase().includes(lowerCaseSearchTerm) ||
      user.email?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
        <CardDescription>View and update user profiles and roles.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Filter users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display Name</TableHead>
              <TableHead>Real Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Type Ratings</TableHead>
              <TableHead>Authorized Airlines</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No users found matching your filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
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
                        <SelectItem value="Visitor">Visitor</SelectItem>
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
                  <TableCell className="min-w-[250px]">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {user.type_ratings?.map((rating, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {rating}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleTypeRatingChange(user.id, user.type_ratings, rating, false)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <PlusCircle className="mr-2 h-4 w-4" /> Manage Ratings
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search family..." />
                          <CommandEmpty>No family found.</CommandEmpty>
                          <CommandGroup>
                            {allAircraftFamilies.map((family) => (
                              <CommandItem
                                key={family}
                                onSelect={() => {
                                  handleTypeRatingChange(user.id, user.type_ratings, family, !user.type_ratings?.includes(family));
                                }}
                              >
                                <Checkbox
                                  checked={user.type_ratings?.includes(family)}
                                  onCheckedChange={(checked) => {
                                    handleTypeRatingChange(user.id, user.type_ratings, family, !!checked);
                                  }}
                                  className="mr-2"
                                />
                                {family}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell className="min-w-[250px]">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {user.authorized_airlines?.map((airline, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {airline}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleAuthorizedAirlineChange(user.id, user.authorized_airlines, airline, false)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <PlusCircle className="mr-2 h-4 w-4" /> Manage Airlines
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search airline..." />
                          <CommandEmpty>No airline found.</CommandEmpty>
                          <CommandGroup>
                            {allAirlineNames.map((airlineName) => (
                              <CommandItem
                                key={airlineName}
                                onSelect={() => {
                                  handleAuthorizedAirlineChange(user.id, user.authorized_airlines, airlineName, !user.authorized_airlines?.includes(airlineName));
                                }}
                              >
                                <Checkbox
                                  checked={user.authorized_airlines?.includes(airlineName)}
                                  onCheckedChange={(checked) => {
                                    handleAuthorizedAirlineChange(user.id, user.authorized_airlines, airlineName, !!checked);
                                  }}
                                  className="mr-2"
                                />
                                {airlineName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewUserDetails(user)}>
                      View Details
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleSendMessageClick(user)}>
                      Message
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
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
      {messageRecipient && (
        <SendMessageDialog
          isOpen={isSendMessageDialogOpen}
          onClose={() => setIsSendMessageDialogOpen(false)}
          recipientId={messageRecipient.id}
          recipientDisplayName={messageRecipient.display_name}
        />
      )}
    </Card>
  );
};

export default UserManagementTab;