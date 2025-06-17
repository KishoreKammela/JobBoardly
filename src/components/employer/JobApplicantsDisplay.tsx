
"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockJobs, mockJobSeekerProfiles } from '@/lib/mockData';
import type { Job, UserProfile } from '@/types';
import { CandidateCard } from './CandidateCard';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

interface JobApplicantsDisplayProps {
  jobId: string;
}

export function JobApplicantsDisplay({ jobId }: JobApplicantsDisplayProps) {
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null | undefined>(undefined); // undefined for loading, null for not found
  const [applicants, setApplicants] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const foundJob = mockJobs.find(j => j.id === jobId);
    
    if (foundJob) {
      setJob(foundJob);
      if (user && user.role === 'employer' && foundJob.postedById === user.id) {
        // In a real app, applicantIds would be used to fetch full profiles.
        // For mock, we'll just show some from mockJobSeekerProfiles if applicantIds exist.
        // Or, show all seekers if applicantIds is empty/for demo.
        const applicantProfiles = foundJob.applicantIds && foundJob.applicantIds.length > 0
            ? mockJobSeekerProfiles.filter(seeker => foundJob.applicantIds!.includes(seeker.id))
            : []; // Or show a subset of mockJobSeekerProfiles for demo if empty: mockJobSeekerProfiles.slice(0,2)
        setApplicants(applicantProfiles);

      } else if (user && user.role === 'employer' && foundJob.postedById !== user.id) {
        // Employer trying to access applicants for a job not theirs
        setJob(null); // Mark as not found or unauthorized
        setApplicants([]);
      } else {
        // Non-employer or other issue
        setApplicants([]);
      }
    } else {
      setJob(null); // Job not found
      setApplicants([]);
    }
    setIsLoading(false);
  }, [jobId, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading applicants...</p>
      </div>
    );
  }

  if (!user || user.role !== 'employer') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You must be logged in as an employer to view job applicants.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (job === undefined) { // Still loading initial job check
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }


  if (!job) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Job Not Found or Unauthorized</AlertTitle>
        <AlertDescription>
          The job you are trying to view applicants for does not exist or you do not have permission to view its applicants.
           <Link href="/employer/posted-jobs" className="block mt-2 text-primary hover:underline">Return to Posted Jobs</Link>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1">Applicants for: <span className="text-primary">{job.title}</span></h2>
      <p className="text-muted-foreground mb-6">Company: {job.company} - Location: {job.location}</p>
      
      {applicants.length === 0 ? (
         <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Applicants Yet</AlertTitle>
            <AlertDescription>
            There are currently no applicants for this job posting.
            </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applicants.map(applicant => (
            <CandidateCard key={applicant.id} candidate={applicant} />
            ))}
        </div>
      )}
    </div>
  );
}
