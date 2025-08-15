import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { showSuccess, showError } from '@/utils/toast';
import UserDetailsDialog from '@/components/UserDetailsDialog';

interface Question {
  id: string;
  questionText: string;
  type: 'multiple-choice' | 'text';
  options?: string[];
  correctOptionIndex?: number;
}

interface Answer {
  questionId: string;
  selectedOptionIndex?: number;
  textAnswer?: string;
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
    is_staff: boolean | null;
    rank: string | null; // Updated to allow null
  } | null;
}

interface JobApplicationManagementTabProps {
  jobApplications: JobApplication[];
  handleUpdateApplicationStatus: (applicationId: string, newStatus: string) => Promise<void>;
  handleDeleteApplication: (applicationId: string) => Promise<void>;
  fetchJobApplications: () => Promise<void>;
}

const JobApplicationManagementTab: React.FC<JobApplicationManagementTabProps> = ({
  jobApplications,
  handleUpdateApplicationStatus,
  handleDeleteApplication,
  fetchJobApplications,
}) => {
  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleViewUserDetails = (user: any) => {
    setSelectedUser(user);
    setIsUserDetailsDialogOpen(true);
  };

  const getAnswerDisplay = (question: Question, answers: Answer[] | null) => {
    if (!answers) return 'N/A';
    const answer = answers.find(a => a.questionId === question.id);

    if (question.type === 'multiple-choice') {
      if (answer && answer.selectedOptionIndex !== undefined && question.options && question.options[answer.selectedOptionIndex]) {
        return question.options[answer.selectedOptionIndex];
      }
    } else if (question.type === 'text') {
      if (answer && answer.textAnswer) {
        return answer.textAnswer;
      }
    }
    return 'Not answered';
  };

  const getAnswerColor = (question: Question, answers: Answer[] | null) => {
    if (!answers) return 'text-gray-700 dark:text-gray-300';
    const answer = answers.find(a => a.questionId === question.id);

    if (question.type === 'multiple-choice') {
      if (answer && answer.selectedOptionIndex !== undefined && question.correctOptionIndex !== undefined) {
        return answer.selectedOptionIndex === question.correctOptionIndex ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
      }
    } else if (question.type === 'text') {
      return 'text-gray-700 dark:text-gray-300';
    }
    return 'text-gray-700 dark:text-gray-300';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Applications</CardTitle>
        <CardDescription>Review and manage submitted job applications.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No job applications found.
                </TableCell>
              </TableRow>
            ) : (
              jobApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.user_profile?.display_name || 'N/A'}</TableCell>
                  <TableCell>{application.user_profile?.email || 'N/A'}</TableCell>
                  <TableCell>{application.job_opening?.title || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(application.created_at), 'PPP')}</TableCell>
                  <TableCell>
                    <Select
                      value={application.status}
                      onValueChange={(value) => handleUpdateApplicationStatus(application.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Dialog onOpenChange={(open) => {
                      if (open) {
                        console.log('Job Application Questions:', application.job_opening?.questions);
                        console.log('Job Application Answers:', application.answers);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">View</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Application Details for {application.job_opening?.title || 'N/A'}</DialogTitle>
                          <DialogDescription>
                            Applicant: {application.user_profile?.display_name || 'N/A'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-4 py-4 text-sm">
                          <div><span className="font-medium">Applicant Name:</span> {application.user_profile?.first_name} {application.user_profile?.last_name} ({application.user_profile?.display_name})</div>
                          <div><span className="font-medium">Applicant Email:</span> {application.user_profile?.email}</div>
                          <div><span className="font-medium">Discord:</span> {application.user_profile?.discord_username || 'N/A'}</div>
                          <div><span className="font-medium">VATSIM/IVAO ID:</span> {application.user_profile?.vatsim_ivao_id || 'N/A'}</div>
                          <div><span className="font-medium">Current Rank:</span> {application.user_profile?.rank || 'N/A'}</div>
                          <div><span className="font-medium">Application Status:</span> {application.status.charAt(0).toUpperCase() + application.status.slice(1)}</div>
                          <div><span className="font-medium">Applied On:</span> {format(new Date(application.created_at), 'PPP p')}</div>

                          {application.job_opening?.questions && application.job_opening.questions.length > 0 ? (
                            <div className="col-span-full mt-4">
                              <h3 className="font-semibold text-base mb-2">Answers to Questions:</h3>
                              <div className="space-y-3">
                                {application.job_opening.questions.map((question, qIndex) => (
                                  <div key={question.id} className="border p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                                    <p className="font-medium text-sm mb-1">{qIndex + 1}. {question.questionText}</p>
                                    <p className={`text-sm ${getAnswerColor(question, application.answers)}`}>
                                      Answer: {getAnswerDisplay(question, application.answers)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="col-span-full mt-4 text-center text-muted-foreground">
                              No questions found for this job opening.
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => handleViewUserDetails(application.user_profile)}>
                            View Applicant Profile
                          </Button>
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

export default JobApplicationManagementTab;