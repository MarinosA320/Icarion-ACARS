import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { showSuccess, showError } from '@/utils/toast';
import { PlusCircle, XCircle, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // Import supabase for image deletion

interface Question {
  id: string;
  questionText: string;
  type: 'multiple-choice' | 'text'; // New field for question type
  options?: string[]; // Optional for text questions
  correctOptionIndex?: number; // Optional for text questions
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

interface JobOpeningManagementTabProps {
  jobOpenings: JobOpening[];
  handleUpdateJobOpening: (jobId: string, updatedFields: Partial<JobOpening>) => Promise<void>;
  handleDeleteJobOpening: (jobId: string) => Promise<void>;
  fetchJobOpenings: () => Promise<void>; // To refresh list after create/edit
}

const JobOpeningManagementTab: React.FC<JobOpeningManagementTabProps> = ({
  jobOpenings,
  handleUpdateJobOpening,
  handleDeleteJobOpening,
  fetchJobOpenings,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editRequirements, setEditRequirements] = useState('');
  const [editResponsibilities, setEditResponsibilities] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null); // State for new image file
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null); // State for current image URL
  const [editQuestions, setEditQuestions] = useState<Question[]>([]); // State for editing questions
  const [loading, setLoading] = useState(false);

  const addEditQuestion = () => {
    setEditQuestions([...editQuestions, { id: Date.now().toString(), questionText: '', type: 'multiple-choice', options: ['', ''], correctOptionIndex: 0 }]); // Default to multiple-choice
  };

  const removeEditQuestion = (id: string) => {
    setEditQuestions(editQuestions.filter(q => q.id !== id));
  };

  const handleEditQuestionChange = (id: string, field: keyof Question, value: string | string[] | number) => {
    setEditQuestions(editQuestions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleEditQuestionTypeChange = (id: string, type: 'multiple-choice' | 'text') => {
    setEditQuestions(editQuestions.map(q => {
      if (q.id === id) {
        if (type === 'text') {
          const { options, correctOptionIndex, ...rest } = q;
          return { ...rest, type };
        } else {
          return { ...q, type, options: q.options || ['', ''], correctOptionIndex: q.correctOptionIndex || 0 };
        }
      }
      return q;
    }));
  };

  const addEditOption = (questionId: string) => {
    setEditQuestions(editQuestions.map(q =>
      q.id === questionId ? { ...q, options: [...(q.options || []), ''] } : q
    ));
  };

  const removeEditOption = (questionId: string, optionIndex: number) => {
    setEditQuestions(editQuestions.map(q => {
      if (q.id === questionId) {
        const newOptions = (q.options || []).filter((_, idx) => idx !== optionIndex);
        let newCorrectIndex = q.correctOptionIndex;
        if (newCorrectIndex === optionIndex) {
          newCorrectIndex = 0; // Reset if the correct option was removed
        } else if (newCorrectIndex !== undefined && newCorrectIndex > optionIndex) {
          newCorrectIndex--; // Adjust if correct option index shifts
        }
        return { ...q, options: newOptions, correctOptionIndex: newCorrectIndex };
      }
      return q;
    }));
  };

  const handleEditOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setEditQuestions(editQuestions.map(q =>
      q.id === questionId ? {
        ...q,
        options: (q.options || []).map((opt, idx) => idx === optionIndex ? value : opt)
      } : q
    ));
  };

  const handleEditClick = (job: JobOpening) => {
    setSelectedJob(job);
    setEditTitle(job.title);
    setEditDescription(job.description);
    setEditRequirements(job.requirements || '');
    setEditResponsibilities(job.responsibilities || '');
    setEditStatus(job.status);
    setEditImageFile(null); // Clear any previously selected file
    setEditImageUrl(job.image_url); // Set current image URL
    setEditQuestions(job.questions || []); // Populate questions for editing
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    // Basic validation for questions
    for (const q of editQuestions) {
      if (!q.questionText.trim()) {
        showError('All question texts must be filled.');
        setLoading(false);
        return;
      }
      if (q.type === 'multiple-choice') {
        if (!q.options || q.options.length < 2) {
          showError('Each multiple-choice question must have at least two options.');
          setLoading(false);
          return;
        }
        if (q.options.some(opt => !opt.trim())) {
          showError('All options for each multiple-choice question must be filled.');
          setLoading(false);
          return;
        }
        if (q.correctOptionIndex === undefined || q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
          showError('A correct answer must be selected for each multiple-choice question.');
          setLoading(false);
          return;
        }
      }
    }

    setLoading(true);

    let newImageUrl = editImageUrl;
    if (editImageFile) {
      // Delete old image if it exists and is different
      if (selectedJob.image_url && selectedJob.image_url !== newImageUrl) {
        const oldUrlParts = selectedJob.image_url.split('/');
        const oldFilePath = oldUrlParts.slice(oldUrlParts.indexOf('job-opening-images') + 1).join('/');
        await supabase.storage.from('job-opening-images').remove([oldFilePath]);
      }

      const fileExt = editImageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${editImageFile.name}.${fileExt}`;
      const filePath = `job_opening_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('job-opening-images')
        .upload(filePath, editImageFile);

      if (uploadError) {
        showError('Error uploading image: ' + uploadError.message);
        setLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('job-opening-images').getPublicUrl(filePath);
      newImageUrl = publicUrlData.publicUrl;
    } else if (editImageUrl === null && selectedJob.image_url) {
      // If image was present but now explicitly removed (e.g., by clearing input)
      const oldUrlParts = selectedJob.image_url.split('/');
      const oldFilePath = oldUrlParts.slice(oldUrlParts.indexOf('job-opening-images') + 1).join('/');
      await supabase.storage.from('job-opening-images').remove([oldFilePath]);
    }


    const updatedFields: Partial<JobOpening> = {
      title: editTitle,
      description: editDescription,
      requirements: editRequirements || null,
      responsibilities: editResponsibilities || null,
      status: editStatus,
      image_url: newImageUrl, // Save new image URL
      questions: editQuestions.length > 0 ? editQuestions : null, // Save questions
    };

    await handleUpdateJobOpening(selectedJob.id, updatedFields);
    setLoading(false);
    setIsEditDialogOpen(false);
    fetchJobOpenings(); // Refresh the list
  };

  const handleDeleteJob = async (jobId: string, imageUrl: string | null) => {
    setLoading(true);
    if (imageUrl) {
      const urlParts = imageUrl.split('/');
      const filePathInStorage = urlParts.slice(urlParts.indexOf('job-opening-images') + 1).join('/');
      const { error: storageError } = await supabase.storage
        .from('job-opening-images')
        .remove([filePathInStorage]);

      if (storageError) {
        showError('Error deleting image from storage: ' + storageError.message);
        setLoading(false);
        return;
      }
    }
    await handleDeleteJobOpening(jobId);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Job Openings</CardTitle>
        <CardDescription>Create, edit, or remove job postings for the careers page.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobOpenings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No job openings found.
                </TableCell>
              </TableRow>
            ) : (
              jobOpenings.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${job.status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(job.created_at), 'PPP')}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(job)}>
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the job opening.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteJob(job.id, job.image_url)}>
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

      {selectedJob && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job Opening</DialogTitle>
              <DialogDescription>
                Make changes to the job opening details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editTitle">Job Title</Label>
                <Input
                  id="editTitle"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editRequirements">Requirements</Label>
                <Textarea
                  id="editRequirements"
                  value={editRequirements}
                  onChange={(e) => setEditRequirements(e.target.value)}
                  rows={3}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editResponsibilities">Responsibilities</Label>
                <Textarea
                  id="editResponsibilities"
                  value={editResponsibilities}
                  onChange={(e) => setEditResponsibilities(e.target.value)}
                  rows={3}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus} disabled={loading}>
                  <SelectTrigger id="editStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editJobImage">Job Opening Image (Optional)</Label>
                {editImageUrl && (
                  <div className="mb-2">
                    <img src={editImageUrl} alt="Current Job" className="max-h-32 object-contain rounded-md" />
                    <Button variant="ghost" size="sm" onClick={() => setEditImageUrl(null)} className="text-red-500 hover:text-red-600 mt-1">Remove Image</Button>
                  </div>
                )}
                <Input
                  id="editJobImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full"
                  disabled={loading}
                />
              </div>

              {/* Multiple Choice Questions Section for Editing */}
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="text-lg font-semibold flex items-center justify-between">
                  Application Questions (Optional)
                  <Button type="button" variant="outline" size="sm" onClick={addEditQuestion} disabled={loading}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                  </Button>
                </h3>
                {editQuestions.map((q, qIndex) => (
                  <div key={q.id} className="border p-4 rounded-md space-y-3 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`edit-question-${q.id}`}>Question {qIndex + 1}</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeEditQuestion(q.id)} disabled={loading}>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-1">
                        <Label htmlFor={`edit-question-type-${q.id}`}>Question Type</Label>
                        <Select value={q.type} onValueChange={(value: 'multiple-choice' | 'text') => handleEditQuestionTypeChange(q.id, value)} disabled={loading}>
                          <SelectTrigger id={`edit-question-type-${q.id}`}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                            <SelectItem value="text">Text Answer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor={`edit-question-text-${q.id}`}>Question Text</Label>
                        <Input
                          id={`edit-question-text-${q.id}`}
                          value={q.questionText}
                          onChange={(e) => handleEditQuestionChange(q.id, 'questionText', e.target.value)}
                          placeholder="Enter question text"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {q.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        <Label>Options:</Label>
                        {(q.options || []).map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => handleEditOptionChange(q.id, optIndex, e.target.value)}
                              placeholder={`Option ${optIndex + 1}`}
                              required
                              disabled={loading}
                            />
                            <input
                              type="radio"
                              name={`edit-correct-option-${q.id}`}
                              checked={q.correctOptionIndex === optIndex}
                              onChange={() => handleEditQuestionChange(q.id, 'correctOptionIndex', optIndex)}
                              className="form-radio h-4 w-4 text-blue-600"
                              disabled={loading}
                            />
                            <Label htmlFor={`edit-correct-option-${q.id}-${optIndex}`}>Correct</Label>
                            {(q.options || []).length > 2 && ( // Allow removing if more than 2 options
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeEditOption(q.id, optIndex)} disabled={loading}>
                                <Minus className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => addEditOption(q.id)} disabled={loading}>
                          <Plus className="mr-2 h-4 w-4" /> Add Option
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
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
    </Card>
  );
};

export default JobOpeningManagementTab;