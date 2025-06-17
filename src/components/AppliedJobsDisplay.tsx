
"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockJobs } from '@/lib/mockData';
import type { Job } from '@/types';
import { JobCard } from '@/components/JobCard';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AppliedJobsDisplay() {
  const { user } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (user && user.role === 'jobSeeker' && user.appliedJobIds) {
      // Simulate fetching full job details for applied job IDs
      const jobs = mockJobs.filter(job => user.appliedJobIds!.includes(job.id));
      setAppliedJobs(jobs);
    } else {
      setAppliedJobs([]);
    }
    setIsLoading(false);
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your applied jobs...</p>
      </div>
    );
  }

  if (!user || user.role !== 'jobSeeker') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You must be logged in as a job seeker to view applied jobs.
        </AlertDescription>
      </Alert>
    );
  }

  if (appliedJobs.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Applied Jobs</AlertTitle>
        <AlertDescription>
          You haven't applied to any jobs yet. Start exploring and applying!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {appliedJobs.map(job => (
        <JobCard key={job.id} job={job} showApplyButton={false} /> // Hide apply button as it's already applied
      ))}
    </div>
  );
}
