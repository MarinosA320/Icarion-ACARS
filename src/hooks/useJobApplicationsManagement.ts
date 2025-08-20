import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { fetchProfilesData } from '@/utils/supabaseDataFetch';
import { sendNotification } from '@/utils/notificationService';

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
  job_opening_id: string; // Added this field for explicit fetching
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
    // Select job_opening_id directly instead of implicitly joining
    const { data, error } = await supabase
      .from('job_applications')
      .select('id,user_id,answers,status,created_at,job_opening_id')
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching job applications: ' + error.message);
      console.error('Error fetching job applications:', error);
      return;
    }

    const allApplicantUserIds = new Set<string>();
    const allJobOpeningIds = new Set<string>();

    data.forEach(app => {
      allApplicantUserIds.add(app.user_id);
      if (app.job_opening_id) {
        allJobOpeningIds.add(app.job_opening_id);
      }
    });

    // Fetch profiles including email
    const profilesMap = await fetchProfilesData(Array.from(allApplicantUserIds), true);

    // Fetch job openings separately
    let jobOpeningsMap: { [key: string]: { title: string; questions: Question[] | null; } } = {};
    if (allJobOpeningIds.size > 0) {
      const { data: jobData, error: jobError } = await supabase
        .from('job_openings')
        .select('id,title,questions')
        .in('id', Array.from(allJobOpeningIds));

      if (jobError) {
        console.error('Error fetching associated job openings:', jobError);
        showError('Error fetching job opening details.');
      } else {
        jobData.forEach(job => {
          jobOpeningsMap[job.id] = { title: job.title, questions: job.questions };
        });
      }
    }

    const applicationsWithProfilesAndJobs = data.map(app => ({
      ...app,
      user_profile: profilesMap[app.user_id] || null,
      job_opening: app.job_opening_id ? jobOpeningsMap[app.job_opening_id] || null : null, // Manually assign job_opening
    }));
    setJobApplications(applicationsWithProfilesAndJobs as JobApplication[]);
  }, []);

  const handleUpdateApplicationStatus = useCallback(async (applicationId: string, newStatus: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('You must be logged in to update application status.');
      return;
    }

    const { data: existingApplication, error: fetchError } = await supabase
      .from('job_applications')
      .select('user_id, job_opening_id') // Select job_opening_id directly
      .eq('id', applicationId)
      .single();

    if (fetchError || !existingApplication) {
      showError('Error fetching application details: ' + (fetchError?.message || 'Application not found.'));
      return;
    }

    // Fetch job title for notification if needed
    let jobTitle = 'a job opening';
    if (existingApplication.job_opening_id) {
      const { data: jobData, error: jobTitleError } = await supabase
        .from('job_openings')
        .select('title')
        .eq('id', existingApplication.job_opening_id)
        .single();
      if (jobData && !jobTitleError) {
        jobTitle = jobData.title;
      }
    }

    const { error } = await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    if (error) {
      showError('Error updating application status: ' + error.message);
    } else {
      showSuccess('Application status updated!');
      fetchJobApplications();

      // Send notification if status is accepted
      if (newStatus === 'accepted') {
        const notificationContent = `Congratulations! Your application for "${jobTitle}" has been accepted. Please check your email for further instructions.`;
        await sendNotification(existingApplication.user_id, 'job_accepted', notificationContent, user.id);
      }
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