
"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Job } from '@/types';
import { JobCard } from '@/components/JobCard';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search } from 'lucide-react';

export function AppliedJobsDisplay() {
  const { user } = useAuth();
  const [appliedJobsDetails, setAppliedJobsDetails] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppliedJobsDetails = async () => {
      if (!user || user.role !== 'jobSeeker' || !user.appliedJobIds || user.appliedJobIds.length === 0) {
        setIsLoading(false);
        setAppliedJobsDetails([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const jobPromises = user.appliedJobIds.map(jobId => getDoc(doc(db, "jobs", jobId)));
        const jobDocs = await Promise.all(jobPromises);
        
        const jobsData = jobDocs
          .filter(docSnap => docSnap.exists())
          .map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              postedDate: data.postedDate instanceof Timestamp ? data.postedDate.toDate().toISOString().split('T')[0] : data.postedDate,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
              updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            } as Job;
          });
        setAppliedJobsDetails(jobsData);
      } catch (e) {
        console.error("Error fetching applied jobs details:", e);
        setError("Failed to load your applied jobs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppliedJobsDetails();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your applied jobs...</p>
      </div>
    );
  }
  
  if (error) {
     return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
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

  if (appliedJobsDetails.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Applied Jobs</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          You haven't applied to any jobs yet.
          <Button asChild size="sm">
            <Link href="/jobs">
                 <Search className="mr-2 h-4 w-4" /> Explore Jobs & Apply
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {appliedJobsDetails.map(job => (
        <JobCard key={job.id} job={job} showApplyButton={false} />
      ))}
    </div>
  );
}
