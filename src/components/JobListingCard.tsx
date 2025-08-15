import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import JobApplicationForm from '@/components/JobApplicationForm';
import { showSuccess, showError } from '@/utils/toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Question {
  id: string;
  questionText: string;
  type: 'multiple-choice' | 'text';
  options?: string[];
  correctOptionIndex?: number;
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
  image_url: string | null;
  questions: Question[] | null;
}

interface JobListingCardProps {
  job: JobOpening;
}

const JobListingCard: React.FC<JobListingCardProps> = ({ job }) => {
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleApplicationSubmitted = () => {
    setIsApplicationDialogOpen(false);
  };

  return (
    <Card className="flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-xl">{job.title}</CardTitle>
        <CardDescription className={`font-semibold ${job.status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
          Status: {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between space-y-4">
        <div>
          {job.image_url && (
            <div className="mb-4">
              <img src={job.image_url} alt={job.title} className="w-full h-48 object-cover rounded-md" />
            </div>
          )}

          {/* Button to open Job Details Dialog */}
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-center px-4 py-2 text-sm font-medium text-icarion-blue-DEFAULT dark:text-icarion-gold-DEFAULT hover:bg-gray-100 dark:hover:bg-gray-700">
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-y-auto"> {/* Added overflow-y-auto here */}
              <DialogHeader>
                <DialogTitle>{job.title} Details</DialogTitle>
                <DialogDescription>
                  Comprehensive information about this job opening.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="p-4 border rounded-md mt-4"> {/* Removed flex-grow here */}
                <div className="space-y-4">
                  {job.description && (
                    <div>
                      <h3 className="font-semibold mb-1">Description:</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.description}</p>
                    </div>
                  )}
                  {job.requirements && (
                    <div>
                      <h3 className="font-semibold mb-1">Requirements:</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.requirements}</p>
                    </div>
                  )}
                  {job.responsibilities && (
                    <div>
                      <h3 className="font-semibold mb-1">Responsibilities:</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.responsibilities}</p>
                    </div>
                  )}

                  {job.questions && job.questions.length > 0 && (
                    <div>
                      <Separator className="my-4" />
                      <h3 className="font-semibold mb-2">Application Questions Preview:</h3>
                      <div className="space-y-4">
                        {job.questions.map((question, qIndex) => (
                          <div key={question.id} className="border p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                            <p className="font-medium text-sm mb-2">{qIndex + 1}. {question.questionText}</p>
                            {question.type === 'multiple-choice' && question.options && (
                              <div className="space-y-1">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                    <input type="radio" id={`job-${job.id}-q${qIndex}-opt${optIndex}`} name={`job-${job.id}-q${optIndex}`} className="form-radio h-4 w-4 text-blue-600" disabled />
                                    <label htmlFor={`job-${job.id}-q${qIndex}-opt${optIndex}`}>{option}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                            {question.type === 'text' && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                (Text answer expected)
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <DialogFooter className="mt-4">
                <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {job.status === 'open' && (
          <div className="mt-auto">
            <Separator />
            <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Apply Now</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Apply for: {job.title}</DialogTitle>
                  <DialogDescription>
                    Please fill out the questions below to apply for this position.
                  </DialogDescription>
                </DialogHeader>
                <JobApplicationForm
                  job={job}
                  onApplicationSubmitted={handleApplicationSubmitted}
                  onClose={() => setIsApplicationDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
        {job.status === 'closed' && (
          <div className="mt-auto">
            <Separator />
            <Button className="w-full" disabled>Application Closed</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobListingCard;