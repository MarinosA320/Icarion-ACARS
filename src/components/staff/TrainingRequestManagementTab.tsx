import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import UserDetailsDialog from '@/components/UserDetailsDialog';
import { TrainingRequest } from '@/hooks/useTrainingRequestsManagement';
import { Profile } from '@/hooks/useUsersManagement';

interface TrainingRequestManagementTabProps {
  trainingRequests: TrainingRequest[];
  staffMembers: Profile[];
  handleUpdateTrainingRequest: (requestId: string, updatedFields: Partial<TrainingRequest>) => Promise<void>;
  handleDeleteTrainingRequest: (requestId: string) => Promise<void>;
  fetchTrainingRequests: () => Promise<void>;
}

const TrainingRequestManagementTab: React.FC<TrainingRequestManagementTabProps> = ({
  trainingRequests,
  staffMembers,
  handleUpdateTrainingRequest,
  handleDeleteTrainingRequest,
  fetchTrainingRequests,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editInstructorId, setEditInstructorId] = useState<string | null>('');
  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEditClick = (request: TrainingRequest) => {
    setSelectedRequest(request);
    setEditStatus(request.status);
    setEditInstructorId(request.instructor_id || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setLoading(true);
    const updatedFields: Partial<TrainingRequest> = {
      status: editStatus,
      instructor_id: editInstructorId === '' ? null : editInstructorId,
    };

    await handleUpdateTrainingRequest(selectedRequest.id, updatedFields);
    setLoading(false);
    setIsEditDialogOpen(false);
    fetchTrainingRequests();
  };

  const handleViewUserDetails = (user: any) => {
    setSelectedUser(user);
    setIsUserDetailsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Requests</CardTitle>
        <CardDescription>Manage incoming training requests from pilots.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pilot</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Desired Rank</TableHead>
              <TableHead>Aircraft Type</TableHead>
              <TableHead>Preferred Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainingRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No training requests found.
                </TableCell>
              </TableRow>
            ) : (
              trainingRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.user_profile?.display_name || 'N/A'}</TableCell>
                  <TableCell>{request.training_category}</TableCell>
                  <TableCell>{request.desired_rank}</TableCell>
                  <TableCell>{request.aircraft_type}</TableCell>
                  <TableCell>{format(new Date(request.preferred_date_time), 'PPP p')}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${request.status === 'Pending' ? 'text-yellow-600' : request.status === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell>{request.instructor_profile?.display_name || 'Unassigned'}</TableCell>
                  <TableCell className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">View</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Training Request Details</DialogTitle>
                          <DialogDescription>
                            Request from {request.user_profile?.display_name || 'N/A'} for {request.training_category} {request.training_category === 'Aircraft Type Rating' ? `(${request.aircraft_type})` : ''}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-4 py-4 text-sm">
                          <div><span className="font-medium">Pilot Name:</span> {request.user_profile?.first_name} {request.user_profile?.last_name} ({request.user_profile?.display_name})</div>
                          <div><span className="font-medium">Pilot Email:</span> {request.user_profile?.email || 'N/A'}</div>
                          <div><span className="font-medium">Discord:</span> {request.user_profile?.discord_username || 'N/A'}</div>
                          <div><span className="font-medium">VATSIM/IVAO ID:</span> {request.user_profile?.vatsim_ivao_id || 'N/A'}</div>
                          <div><span className="font-medium">Current Rank:</span> {request.user_profile?.rank || 'N/A'}</div>
                          <div><span className="font-medium">Training Category:</span> {request.training_category}</div>
                          <div><span className="font-medium">Desired Rank:</span> {request.desired_rank}</div>
                          <div><span className="font-medium">Aircraft Type:</span> {request.aircraft_type}</div>
                          <div><span className="font-medium">Preferred Date/Time:</span> {format(new Date(request.preferred_date_time), 'PPP p')}</div>
                          <div><span className="font-medium">Prior Experience:</span> <p className="whitespace-pre-wrap">{request.prior_experience || 'N/A'}</p></div>
                          <div><span className="font-medium">Optional Message:</span> <p className="whitespace-pre-wrap">{request.optional_message || 'N/A'}</p></div>
                          <div><span className="font-medium">Status:</span> {request.status}</div>
                          <div><span className="font-medium">Assigned Instructor:</span> {request.instructor_profile?.display_name || 'Unassigned'}</div>
                          <div><span className="font-medium">Requested On:</span> {format(new Date(request.created_at), 'PPP p')}</div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => handleViewUserDetails(request.user_profile)}>
                            View Applicant Profile
                          </Button>
                          <Button onClick={() => handleEditClick(request)}>
                            Edit Request
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this training request.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTrainingRequest(request.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {selectedRequest && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Training Request</DialogTitle>
              <DialogDescription>
                Update the status or assign an instructor for this request.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus} disabled={loading}>
                  <SelectTrigger id="editStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editInstructor">Assign Instructor</Label>
                <Select value={editInstructorId || ''} onValueChange={setEditInstructorId} disabled={loading}>
                  <SelectTrigger id="editInstructor">
                    <SelectValue placeholder="Select instructor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {staffMembers.map(staff => (
                      <SelectItem key={staff.id} value={staff.id}>{staff.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
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

export default TrainingRequestManagementTab;