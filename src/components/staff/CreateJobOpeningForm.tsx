import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, XCircle, Plus, Minus } from 'lucide-react';

interface CreateJobOpeningFormProps {
  onJobPosted: () => void;
}

interface Question {
  id: string;
  questionText: string;
  type: 'multiple-choice' | 'text'; // New field for question type
  options?: string[]; // Optional for text questions
  correctOptionIndex?: number; // Optional for text questions
}

const CreateJobOpeningForm: React.FC<CreateJobOpeningFormProps> = ({ onJobPosted }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [status, setStatus] = useState('open');
  const [imageFile, setImageFile] = useState<File | null>(null); // New state for image file
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), questionText: '', type: 'multiple-choice', options: ['', ''], correctOptionIndex: 0 }]); // Default to multiple-choice
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: string | string[] | number) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleQuestionTypeChange = (id: string, type: 'multiple-choice' | 'text') => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        if (type === 'text') {
          // Clear options and correctOptionIndex if changing to text type
          const { options, correctOptionIndex, ...rest } = q;
          return { ...rest, type };
        } else {
          // Ensure options and correctOptionIndex exist for multiple-choice
          return { ...q, type, options: q.options || ['', ''], correctOptionIndex: q.correctOptionIndex || 0 };
        }
      }
      return q;
    }));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, options: [...(q.options || []), ''] } : q
    ));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
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

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? {
        ...q,
        options: (q.options || []).map((opt, idx) => idx === optionIndex ? value : opt)
      } : q
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      showError('Title and Description are required.');
      return;
    }

    // Basic validation for questions
    for (const q of questions) {
      if (!q.questionText.trim()) {
        showError('All question texts must be filled.');
        return;
      }
      if (q.type === 'multiple-choice') {
        if (!q.options || q.options.length < 2) {
          showError('Each multiple-choice question must have at least two options.');
          return;
        }
        if (q.options.some(opt => !opt.trim())) {
          showError('All options for each multiple-choice question must be filled.');
          return;
        }
        if (q.correctOptionIndex === undefined || q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
          showError('A correct answer must be selected for each multiple-choice question.');
          return;
        }
      }
    }

    setLoading(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${imageFile.name}.${fileExt}`;
      const filePath = `job_opening_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('job-opening-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        showError('Error uploading image: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('job-opening-images').getPublicUrl(filePath);
      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from('job_openings').insert({
      title,
      description,
      requirements: requirements || null,
      responsibilities: responsibilities || null,
      status,
      image_url: imageUrl, // Include image URL
      questions: questions.length > 0 ? questions : null, // Store questions if any
    });

    if (error) {
      showError('Error creating job opening: ' + error.message);
      console.error('Error creating job opening:', error);
    } else {
      showSuccess('Job opening created successfully!');
      setTitle('');
      setDescription('');
      setRequirements('');
      setResponsibilities('');
      setStatus('open');
      setImageFile(null); // Clear image file
      setQuestions([]); // Clear questions after submission
      onJobPosted();
    }
    setLoading(false);
  };

  return (
    <Card className="mb-8 p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Create New Job Opening
        </CardTitle>
        <CardDescription>
          Fill in the details for a new position.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Virtual Pilot, Staff Member"
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief overview of the role."
              rows={3}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="requirements">Requirements (Optional)</Label>
            <Textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="List required skills, experience, etc."
              rows={3}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="responsibilities">Responsibilities (Optional)</Label>
            <Textarea
              id="responsibilities"
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              placeholder="Outline key duties and tasks."
              rows={3}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={loading}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="jobImage">Job Opening Image (Optional)</Label>
            <Input
              id="jobImage"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              className="w-full"
              disabled={loading}
            />
          </div>

          {/* Questions Section */}
          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="text-lg font-semibold flex items-center justify-between">
              Application Questions (Optional)
              <Button type="button" variant="outline" size="sm" onClick={addQuestion} disabled={loading}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </h3>
            {questions.map((q, qIndex) => (
              <div key={q.id} className="border p-4 rounded-md space-y-3 bg-gray-50 dark:bg-gray-700">
                <div className="flex justify-between items-center">
                  <Label htmlFor={`question-${q.id}`}>Question {qIndex + 1}</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(q.id)} disabled={loading}>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <Label htmlFor={`question-type-${q.id}`}>Question Type</Label>
                    <Select value={q.type} onValueChange={(value: 'multiple-choice' | 'text') => handleQuestionTypeChange(q.id, value)} disabled={loading}>
                      <SelectTrigger id={`question-type-${q.id}`}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="text">Text Answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor={`question-text-${q.id}`}>Question Text</Label>
                    <Input
                      id={`question-text-${q.id}`}
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(q.id, 'questionText', e.target.value)}
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
                          onChange={(e) => handleOptionChange(q.id, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          required
                          disabled={loading}
                        />
                        <input
                          type="radio"
                          name={`correct-option-${q.id}`}
                          checked={q.correctOptionIndex === optIndex}
                          onChange={() => handleQuestionChange(q.id, 'correctOptionIndex', optIndex)}
                          className="form-radio h-4 w-4 text-blue-600"
                          disabled={loading}
                        />
                        <Label htmlFor={`correct-option-${q.id}-${optIndex}`}>Correct</Label>
                        {(q.options || []).length > 2 && ( // Allow removing if more than 2 options
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(q.id, optIndex)} disabled={loading}>
                            <Minus className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => addOption(q.id)} disabled={loading}>
                      <Plus className="mr-2 h-4 w-4" /> Add Option
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Job Opening'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateJobOpeningForm;