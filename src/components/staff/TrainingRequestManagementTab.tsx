import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
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
  instructor_id: string | null;
  user_profile: {
    display_name: string | null;
    email: string | null;
  } | null;
  instructor_profile: {
    display_name: string | null;
  } | null;
}

interface StaffMember {
  id: string;
  display_name: string | null;
}

interface TrainingRequestManagementTabProps {
  trainingRequests: TrainingRequest[];
  staffMembers: StaffMember[];
  handleTrainingRequestStatusUpdate: (requestId: string, newStatus: string, userId: string, desiredRank: string) => Promise<void>;
  handleAssignInstructor: (requestId: string, instructorId: string | null) => Promise<void>;
}

const TrainingRequestManagementTab: React.FC<TrainingRequestManagementTabProps> = ({
  trainingRequests,
  staffMembers,
  handleTrainingRequestStatusUpdate,
  handleAssignInstructor,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training/Exam Requests</CardTitle>
        <CardDescription>Review and manage pilot training and exam requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pilot</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Desired Rank</TableHead>
              <TableHead>Aircraft Type</TableHead>
              <TableHead>Preferred Date/Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Instructor</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainingRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.user_profile?.display_name || 'N/A'}</TableCell>
                <TableCell>{request.user_profile?.email || 'N/A'}</TableCell>
                <TableCell>{request.desired_rank}</TableCell>
                <TableCell>{request.aircraft_type}</TableCell>
                <TableCell>{format(new Date(request.preferred_date_time), 'PPP p')}</TableCell>
                <TableCell>
                  <Select value={request.status} onValueChange={(value) => handleTrainingRequestStatusUpdate(request.id, value, request.user_id, request.desired_rank)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={request.instructor_id || 'unassigned'}
                    onValueChange={(value) => handleAssignInstructor(request.id, value === 'unassigned' ? null : value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Assign Instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">View Details</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Training Request Details</DialogTitle>
                        <DialogDescription>
                          Request from {request.user_profile?.display_name || 'N/A'} for {request.desired_rank}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-4 py-4 text-sm">
                        <div><span className="font-medium">Pilot Email:</span> {request.user_profile?.email || 'N/A'}</div>
                        <div><span className="font-medium">Desired Rank:</span> {request.desired_rank}</div>
                        <div><span className="font-medium">Aircraft Type:</span> {request.aircraft_type}</div>
                        <div><span className="font-medium">Preferred Date/Time:</span> {format(new Date(request.preferred_date_time), 'PPP p')}</div>
                        <div><span className="font-medium">Prior Experience:</span> <p className="whitespace-pre-wrap">{request.prior_experience || 'N/A'}</p></div>
                        <div><span className="font-medium">Optional Message:</span> <p className="whitespace-pre-wrap">{request.optional_message || 'N/A'}</p></div>
                        <div><span className="font-medium">Current Status:</span> {request.status}</div>
                        <div><span className="font-medium">Assigned Instructor:</span> {request.instructor_profile?.display_name || 'N/A'}</div>
                        <div><span className="font-medium">Submitted On:</span> {format(new Date(request.created_at), 'PPP p')}</div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TrainingRequestManagementTab;