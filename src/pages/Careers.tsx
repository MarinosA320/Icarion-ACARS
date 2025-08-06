import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import JobListingCard from '@/components/JobListingCard';

interface JobOpening {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  application_link: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const Careers = () => {
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobOpenings();
  }, []);

  const fetchJobOpenings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('job_openings')
      .select('*')
      .eq('status', 'open') // Only show open positions
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching job openings: ' + error.message);
      console.error('Error fetching job openings:', error);
    } else {
      setJobOpenings(data as JobOpening[]);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Careers at Icarion VA</h1>
      <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
        Join our team and help us build the future of virtual aviation!
      </p>

      {loading && jobOpenings.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">Loading job openings...</p>
      ) : jobOpenings.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">No job openings available at the moment. Please check back later!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobOpenings.map((job) => (
            <JobListingCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Careers;