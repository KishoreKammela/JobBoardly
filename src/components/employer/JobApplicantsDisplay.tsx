
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import type { Job, UserProfile } from '@/types';
import { CandidateCard } from './CandidateCard';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

interface JobApplicantsDisplayProps {
  jobId: string;
}

export function JobApplicantsDisplay({ jobId }: JobApplicantsDisplayProps) {
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null | undefined>(undefined); // undefined for loading, null for not found/unauthorized
  const [applicants, setApplicants] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobAndApplicants = async () => {
      setIsLoading(true);
      setError(null);
      setJob(undefined);
      setApplicants([]);

      if (!user || user.role !== 'employer' || !user.uid) {
        setError("You must be logged in as an employer to view applicants.");
        setIsLoading(false);
        setJob(null); // Explicitly set to null to trigger unauthorized message
        return;
      }

      try {
        // Fetch the job details
        const jobDocRef = doc(db, "jobs", jobId);
        const jobDocSnap = await getDoc(jobDocRef);

        if (!jobDocSnap.exists()) {
          setError("Job not found.");
          setJob(null);
          setIsLoading(false);
          return;
        }

        const jobData = { id: jobDocSnap.id, ...jobDocSnap.data() } as Job;

        // Verify ownership
        if (jobData.postedById !== user.uid) {
          setError("You do not have permission to view applicants for this job.");
          setJob(null); // Mark as unauthorized
          setIsLoading(false);
          return;
        }
        
        // Convert Firestore Timestamps to string for dates if necessary
        const processedJobData: Job = {
            ...jobData,
            postedDate: jobData.postedDate instanceof Timestamp ? jobData.postedDate.toDate().toISOString().split('T')[0] : jobData.postedDate as string,
            createdAt: jobData.createdAt instanceof Timestamp ? jobData.createdAt.toDate().toISOString() : jobData.createdAt as Timestamp,
            updatedAt: jobData.updatedAt instanceof Timestamp ? jobData.updatedAt.toDate().toISOString() : jobData.updatedAt as Timestamp,
        };
        setJob(processedJobData);

        // Fetch applicant profiles
        if (jobData.applicantIds && jobData.applicantIds.length > 0) {
          const applicantPromises = jobData.applicantIds.map(applicantId =>
            getDoc(doc(db, "users", applicantId))
          );
          const applicantDocsSnaps = await Promise.all(applicantPromises);
          
          const fetchedApplicants = applicantDocsSnaps
            .filter(snap => snap.exists())
            .map(snap => ({ uid: snap.id, ...snap.data() } as UserProfile));
          setApplicants(fetchedApplicants);
        } else {
          setApplicants([]);
        }

      } catch (e: any) {
        console.error("Error fetching job and applicants:", e);
        setError(e.message || "Failed to load job applicants. Please try again.");
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobAndApplicants();
  }, [jobId, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading applicants...</p>
      </div>
    );
  }
  
  // This error state is for general fetch errors, not specific "Job Not Found or Unauthorized" from business logic
  if (error && job !== null) { 
     return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }
  
  // This specifically handles the case where the job is not found or user is not authorized
  // which is determined by setting job to `null` after checks.
  if (job === null) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Job Not Found or Unauthorized</AlertTitle>
        <AlertDescription>
          {error || "The job you are trying to view applicants for does not exist or you do not have permission to view its applicants."}
           <Link href="/employer/posted-jobs" className="block mt-2 text-primary hover:underline">Return to Posted Jobs</Link>
        </AlertDescription>
      </Alert>
    );
  }
  
  // If job is still undefined here, it means loading finished but something unexpected happened.
  // This should ideally not be reached if logic above is correct.
  if (!job) {
     return (
       <Alert variant="default">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>Information</AlertTitle>
         <AlertDescription>Preparing applicant data...</AlertDescription>
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
            <CandidateCard key={applicant.uid} candidate={applicant} />
            ))}
        </div>
      )}
    </div>
  );
}
