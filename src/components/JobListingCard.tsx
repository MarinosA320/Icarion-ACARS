import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import JobApplicationForm from '@/components/JobApplicationForm'; // New import
import { showSuccess, showError } from '@/utils/toast'; // Import toast for feedback

interface Question {
  id: string;
  questionText: string;
  type: 'multiple-choice' | 'text'; // New field for question type
  options?: string[]; // Optional for text questions
  correctOptionIndex?: number; // This will not be displayed to the public
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
  image_url: string | null; // Added image_url field
  questions: Question[] | null; // Added questions field
}

interface JobListingCardProps {
  job: JobOpening;
}

const JobListingCard: React.FC<JobListingCardProps> = ({ job }) => {
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

  const handleApplicationSubmitted = () => {
    // Optionally, you could refresh the job listings or show a different state
    // For now, the toast message from JobApplicationForm is sufficient.
    setIsApplicationDialogOpen(false); // Close dialog on successful submission
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{job.title}</CardTitle>
        <CardDescription className={`font-semibold ${job.status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
          Status: {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {job.image_url && (
          <div className="mb-4">
            <img src={job.image_url} alt={job.title} className="w-full h-48 object-cover rounded-md" />
          </div>
        )}
        <div>
          <h3 className="font-semibold mb-1">Description:</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.description}</p>
        </div>
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
                          <input type="radio" id={`job-${job.id}-q${qIndex}-opt${optIndex}`} name={`job-${job.id}-q${qIndex}`} className="form-radio h-4 w-4 text-blue-600" disabled />
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

        {job.status === 'open' && (
          <>
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
          </>
        )}
        {job.status === 'closed' && (
          <>
            <Separator />
            <Button className="w-full" disabled>Application Closed</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default JobListingCard;