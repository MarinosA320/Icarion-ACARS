import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';

interface Question {
  id: string;
  questionText: string;
  type: 'multiple-choice' | 'text'; // New field for question type
  options?: string[]; // Optional for text questions
}

interface JobOpening {
  id: string;
  title: string;
  questions: Question[] | null;
}

interface JobApplicationFormProps {
  job: JobOpening;
  onApplicationSubmitted: () => void;
  onClose: () => void;
}

interface Answer {
  questionId: string;
  selectedOptionIndex?: number; // For multiple choice
  textAnswer?: string; // For text answers
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ job, onApplicationSubmitted, onClose }) => {
  const [answers, setAnswers] = useState<Answer[]>(
    job.questions?.map(q => ({
      questionId: q.id,
      ...(q.type === 'multiple-choice' ? { selectedOptionIndex: undefined } : { textAnswer: '' })
    })) || []
  );
  const [loading, setLoading] = useState(false);

  const handleAnswerChange = (questionId: string, value: string | number | undefined, type: 'multiple-choice' | 'text') => {
    setAnswers(prevAnswers =>
      prevAnswers.map(ans => {
        if (ans.questionId === questionId) {
          if (type === 'multiple-choice') {
            return { ...ans, selectedOptionIndex: value as number };
          } else { // type === 'text'
            return { ...ans, textAnswer: value as string };
          }
        }
        return ans;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('You must be logged in to apply.');
      setLoading(false);
      return;
    }

    // Validate all questions have been answered
    const allQuestionsAnswered = job.questions?.every(q => {
      const answer = answers.find(ans => ans.questionId === q.id);
      if (!answer) return false; // No answer found for this question

      if (q.type === 'multiple-choice') {
        return answer.selectedOptionIndex !== undefined;
      } else { // type === 'text'
        return answer.textAnswer !== undefined && answer.textAnswer.trim() !== '';
      }
    });

    if (job.questions && job.questions.length > 0 && !allQuestionsAnswered) {
      showError('Please answer all questions before submitting.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('job_applications').insert({
      job_opening_id: job.id,
      user_id: user.id,
      answers: answers,
      status: 'submitted',
    });

    if (error) {
      showError('Error submitting application: ' + error.message);
      console.error('Error submitting application:', error);
    } else {
      showSuccess('Application submitted successfully!');
      onApplicationSubmitted();
      onClose();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      {job.questions && job.questions.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Application Questions:</h3>
          {job.questions.map((question, qIndex) => (
            <div key={question.id} className="border p-4 rounded-md bg-gray-50 dark:bg-gray-700">
              <Label className="font-medium text-base mb-2 block">{qIndex + 1}. {question.questionText}</Label>
              {question.type === 'multiple-choice' && question.options && (
                <div className="space-y-2 mt-2">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`question-${question.id}-option-${optIndex}`}
                        name={`question-${question.id}`}
                        value={optIndex}
                        checked={answers.find(ans => ans.questionId === question.id)?.selectedOptionIndex === optIndex}
                        onChange={() => handleAnswerChange(question.id, optIndex, 'multiple-choice')}
                        className="form-radio h-4 w-4 text-blue-600"
                        required
                        disabled={loading}
                      />
                      <Label htmlFor={`question-${question.id}-option-${optIndex}`} className="text-sm">{option}</Label>
                    </div>
                  ))}
                </div>
              )}
              {question.type === 'text' && (
                <Textarea
                  id={`question-${question.id}-text-answer`}
                  value={answers.find(ans => ans.questionId === question.id)?.textAnswer || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value, 'text')}
                  placeholder="Type your answer here..."
                  rows={4}
                  required
                  disabled={loading}
                  className="mt-2"
                />
              )}
            </div>
          ))}
        </div>
      )}
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default JobApplicationForm;