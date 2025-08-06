import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { fetchEmailsForUserIds } from '@/utils/supabaseDataFetch';

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
  user_profile: { // Made non-nullable, properties can be null
    display_name: string | null;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    discord_username: string | null;
    vatsim_ivao_id: string | null;
    avatar_url: string | null;
    is_staff: boolean | null;
    rank: string | null;
  };
}

export const useJobApplicationsManagement = () => {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);

  const fetchJobApplications = useCallback(async () => {
    const { data, error } = await supabase
      .from('job_applications')
      .select("*,job_opening:job_openings(title,questions),user_profile:profiles!job_applications_user_id_fkey(display_name,first_name,last_name,discord_username,vatsim_ivao_id,avatar_url,is_staff,rank,type_ratings)") // Explicitly define foreign key
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching job applications: ' + error.message);
      console.error('Error fetching job applications:', error);
      return;
    }

    const allApplicantUserIds = new Set<string>();
    data.forEach(app => allApplicantUserIds.add(app.user_id));

    const userEmails = await fetchEmailsForUserIds(Array.from(allApplicantUserIds));

    const applicationsWithEmails = data.map(app => {
      const profileFromJoin = app.user_profile;
      return {
        ...app,
        user_profile: {
          ...(profileFromJoin || {}), // Ensure it's an object even if null
          email: userEmails[app.user_id] || null,
        },
      } as JobApplication; // Cast to JobApplication to satisfy type
    });
    setJobApplications(applicationsWithEmails);
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