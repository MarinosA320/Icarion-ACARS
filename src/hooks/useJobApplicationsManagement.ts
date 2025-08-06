import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { fetchProfilesData } from '@/utils/supabaseDataFetch'; // Import fetchProfilesData

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
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
    rank: string | null;
  } | null;
}

export const useJobApplicationsManagement = () => {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);

  const fetchJobApplications = useCallback(async () => {
    // Fetch job applications without direct profile join
    const { data, error } = await supabase
      .from('job_applications')
      .select('id,job_opening_id,user_id,answers,status,created_at,job_opening:job_openings(title,questions)')
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching job applications: ' + error.message);
      console.error('Error fetching job applications:', error);
      return;
    }

    const allApplicantUserIds = new Set<string>();
    data.forEach(app => allApplicantUserIds.add(app.user_id));

    const profilesMap = await fetchProfilesData(Array.from(allApplicantUserIds));

    const applicationsWithProfiles = data.map(app => ({
      ...app,
      user_profile: profilesMap[app.user_id] || null,
    }));
    setJobApplications(applicationsWithProfiles as JobApplication[]);
  }, []);

  const handleUpdateApplicationStatus = useCallback(async (applicationId: string, newStatus: string) => {
    const { error } = await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    if (error) {
      showError('Error updating application status: ' + error.message);
    } else {
      showSuccess('Application status updated!');
      fetchJobApplications();
    }
  }, [fetchJobApplications]);

  const handleDeleteApplication = useCallback(async (applicationId: string) => {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', applicationId);

    if (error) {
      showError('Error deleting application: ' + error.message);
    } else {
      showSuccess('Application deleted successfully!');
      fetchJobApplications();
    }
  }, [fetchJobApplications]);

  return {
    jobApplications,
    fetchJobApplications,
    handleUpdateApplicationStatus,
    handleDeleteApplication,
  };
};