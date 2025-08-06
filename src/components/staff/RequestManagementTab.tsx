import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { showSuccess, showError } from '@/utils/toast';

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
    rank: string; // Added rank for potential rank updates
  } | null;
  assigned_to_profile: {
    display_name: string | null;
  } | null;
}

interface StaffMember {
  id: string;
  display_name: string | null;
}

interface RequestManagementTabProps {
  requests: UserRequest[];
  staffMembers: StaffMember[];
  handleUpdateRequestStatus: (requestId: string, newStatus: string, userId: string, desiredRank?: string) => Promise<void>;
  handleAssignStaff: (requestId: string, staffId: string | null) => Promise<void>;
  handleUpdateResolutionNotes: (requestId: string, notes: string) => Promise<void>;
}

const RequestManagementTab: React.FC<RequestManagementTabProps> = ({
  requests,
  staffMembers,
  handleUpdateRequestStatus,
  handleAssignStaff,
  handleUpdateResolutionNotes,
}) => {
  const [currentResolutionNotes, setCurrentResolutionNotes] = useState<string>('');
  const [selectedRequestIdForNotes, setSelectedRequestIdForNotes] = useState<string | null>(null);

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

  const handleOpenNotesDialog = (request: UserRequest) => {
    setSelectedRequestIdForNotes(request.id);
    setCurrentResolutionNotes(request.resolution_notes || '');
  };

  const handleSaveNotes = async () => {
    if (selectedRequestIdForNotes) {
      await handleUpdateResolutionNotes(selectedRequestIdForNotes, currentResolutionNotes);
      setSelectedRequestIdForNotes(null);
      setCurrentResolutionNotes('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Requests</CardTitle>
        <CardDescription>Review and manage all submitted user requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Request Type</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No user requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.user_profile?.display_name || 'N/A'}</TableCell>
                  <TableCell>{request.user_profile?.email || 'N/A'}</TableCell>
                  <TableCell>{getRequestTypeDisplay(request.request_type)}</TableCell>
                  <TableCell>{format(new Date(request.created_at), 'PPP p')}</TableCell>
                  <TableCell>
                    <Select
                      value={request.status}
                      onValueChange={(value) => handleUpdateRequestStatus(request.id, value, request.user_id, request.details?.desired_rank)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={request.assigned_to || 'unassigned'}
                      onValueChange={(value) => handleAssignStaff(request.id, value === 'unassigned' ? null : value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Assign Staff" />
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
                  <TableCell className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">View Details</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{getRequestTypeDisplay(request.request_type)} Details</DialogTitle>
                          <DialogDescription>
                            Request from {request.user_profile?.display_name || 'N/A'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-4 py-4 text-sm">
                          <div><span className="font-medium">Applicant Email:</span> {request.user_profile?.email || 'N/A'}</div>
                          <div><span className="font-medium">Current Rank:</span> {request.user_profile?.rank || 'N/A'}</div>
                          <div><span className="font-medium">Submitted On:</span> {format(new Date(request.created_at), 'PPP p')}</div>
                          <div><span className="font-medium">Current Status:</span> {request.status}</div>
                          <div><span className="font-medium">Assigned To:</span> {request.assigned_to_profile?.display_name || 'N/A'}</div>

                          {request.request_type === 'training' || request.request_type === 'exam' ? (
                            <>
                              <div><span className="font-medium">Desired Rank:</span> {request.details?.desired_rank || 'N/A'}</div>
                              <div><span className="font-medium">Aircraft Type:</span> {request.details?.aircraft_type || 'N/A'}</div>
                              <div><span className="font-medium">Preferred Date/Time (UTC):</span> {request.details?.preferred_date_time ? format(new Date(request.details.preferred_date_time), 'PPP p') : 'N/A'}</div>
                              <div><span className="font-medium">Prior Experience:</span> <p className="whitespace-pre-wrap">{request.details?.prior_experience || 'N/A'}</p></div>
                              <div><span className="font-medium">Optional Message:</span> <p className="whitespace-pre-wrap">{request.details?.optional_message || 'N/A'}</p></div>
                            </>
                          ) : (
                            <>
                              <div><span className="font-medium">Subject:</span> {request.details?.subject || 'N/A'}</div>
                              <div><span className="font-medium">Message:</span> <p className="whitespace-pre-wrap">{request.details?.message || 'N/A'}</p></div>
                            </>
                          )}
                          <div className="col-span-full">
                            <Label htmlFor="resolutionNotes">Resolution Notes</Label>
                            <Textarea
                              id="resolutionNotes"
                              value={request.resolution_notes || ''}
                              onChange={(e) => setCurrentResolutionNotes(e.target.value)}
                              placeholder="Add notes about the resolution of this request..."
                              rows={4}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => handleUpdateResolutionNotes(request.id, currentResolutionNotes)}>Save Notes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RequestManagementTab;