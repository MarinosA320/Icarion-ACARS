import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import JobListingCard from '@/components/JobListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import DynamicBackground from '@/components/DynamicBackground'; // Import DynamicBackground

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

const careersBackgroundImages = [
  '/images/backgrounds/crew.avif', // New background image for Careers page
];

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

  const renderSkeletons = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))
  );

  return (
    <DynamicBackground images={careersBackgroundImages} interval={10000} className="min-h-screen flex flex-col items-center justify-center p-4 pt-24">
      {/* Darker overlay on top of the image for better text contrast and depth */}
      <div className="absolute inset-0 bg-black opacity-15"></div> {/* Adjusted opacity to 15% */}
      
      <div className="relative z-10 w-full max-w-5xl mx-auto text-white">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Careers at Icarion VA</h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
          Join our team and help us build the future of virtual aviation!
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderSkeletons()}
          </div>
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
    </DynamicBackground>
  );
};

export default Careers;