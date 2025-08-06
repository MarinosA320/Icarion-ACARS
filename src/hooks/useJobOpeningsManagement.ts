import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
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
  questions: Question[] | null;
}

export const useJobOpeningsManagement = () => {
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);

  const fetchJobOpenings = useCallback(async () => {
    const { data, error } = await supabase
      .from('job_openings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching job openings: ' + error.message);
      console.error('Error fetching job openings:', error);
    } else {
      setJobOpenings(data as JobOpening[]);
    }
  }, []);

  const handleCreateJobOpening = useCallback(async (newJob: Omit<JobOpening, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('job_openings').insert(newJob);
    if (error) {
      showError('Error creating job opening: ' + error.message);
    } else {
      showSuccess('Job opening created successfully!');
      fetchJobOpenings();
    }
  }, [fetchJobOpenings]);

  const handleUpdateJobOpening = useCallback(async (jobId: string, updatedFields: Partial<JobOpening>) => {
    const { error } = await supabase
      .from('job_openings')
      .update(updatedFields)
      .eq('id', jobId);

    if (error) {
      showError('Error updating job opening: ' + error.message);
    } else {
      showSuccess('Job opening updated successfully!');
      fetchJobOpenings();
    }
  }, [fetchJobOpenings]);

  const handleDeleteJobOpening = useCallback(async (jobId: string) => {
    const { error } = await supabase
      .from('job_openings')
      .delete()
      .eq('id', jobId);

    if (error) {
      showError('Error deleting job opening: ' + error.message);
    } else {
      showSuccess('Job opening deleted successfully!');
      fetchJobOpenings();
    }
  }, [fetchJobOpenings]);

  return {
    jobOpenings,
    fetchJobOpenings,
    handleCreateJobOpening,
    handleUpdateJobOpening,
    handleDeleteJobOpening,
  };
};