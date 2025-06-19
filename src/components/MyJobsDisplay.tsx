'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Job } from '@/types';
import { JobCard } from '@/components/JobCard';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import {
  getDocs,
  Timestamp,
  collection,
  query as firestoreQuery,
  where,
  documentId,
} from 'firebase/firestore'; // Added documentId

type JobFilterType = 'all' | 'applied' | 'saved';

export function MyJobsDisplay() {
  const { user } = useAuth();
  const [allFetchedJobs, setAllFetchedJobs] = useState<Map<string, Job>>(
    new Map()
  );
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<JobFilterType>('all');

  useEffect(() => {
    const fetchJobsData = async () => {
      if (!user || user.role !== 'jobSeeker') {
        setIsLoading(false);
        setDisplayedJobs([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      const appliedIds = user.appliedJobIds || [];
      const savedIds = user.savedJobIds || [];
      const allUniqueIds = Array.from(new Set([...appliedIds, ...savedIds]));

      if (allUniqueIds.length === 0) {
        setAllFetchedJobs(new Map());
        setDisplayedJobs([]);
        setIsLoading(false);
        return;
      }

      try {
        // Firestore 'in' query limitation: max 30 elements.
        // If more IDs, split into multiple queries. For simplicity, assuming <30 for now.
        // A more robust solution would batch these requests.
        const jobsRef = collection(db, 'jobs');
        const jobsMap = new Map<string, Job>();

        // Batching requests to handle Firestore 'in' query limit of 30 elements.
        const batchSize = 30;
        for (let i = 0; i < allUniqueIds.length; i += batchSize) {
          const batchIds = allUniqueIds.slice(i, i + batchSize);
          if (batchIds.length > 0) {
            const q = firestoreQuery(
              jobsRef,
              where(documentId(), 'in', batchIds)
            );
            const querySnapshot = await getDocs(q); // Changed from db.getDocs(q)
            querySnapshot.forEach((docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                jobsMap.set(docSnap.id, {
                  id: docSnap.id,
                  ...data,
                  postedDate:
                    data.postedDate instanceof Timestamp
                      ? data.postedDate.toDate().toISOString().split('T')[0]
                      : data.postedDate,
                  createdAt:
                    data.createdAt instanceof Timestamp
                      ? data.createdAt.toDate().toISOString()
                      : data.createdAt,
                  updatedAt:
                    data.updatedAt instanceof Timestamp
                      ? data.updatedAt.toDate().toISOString()
                      : data.updatedAt,
                } as Job);
              }
            });
          }
        }
        setAllFetchedJobs(jobsMap);
      } catch (e) {
        console.error('Error fetching jobs details:', e);
        setError('Failed to load your jobs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobsData();
  }, [user]);

  useEffect(() => {
    // Apply filter when allFetchedJobs or filter changes
    if (!user || !allFetchedJobs.size) {
      setDisplayedJobs([]);
      return;
    }

    let jobsToShow: Job[] = [];
    const appliedIds = new Set(user.appliedJobIds || []);
    const savedIds = new Set(user.savedJobIds || []);

    switch (filter) {
      case 'applied':
        jobsToShow = Array.from(allFetchedJobs.values()).filter((job) =>
          appliedIds.has(job.id)
        );
        break;
      case 'saved':
        jobsToShow = Array.from(allFetchedJobs.values()).filter((job) =>
          savedIds.has(job.id)
        );
        break;
      case 'all':
      default:
        jobsToShow = Array.from(allFetchedJobs.values());
        break;
    }
    // Sort by most recently created (descending)
    jobsToShow.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
      return dateB - dateA;
    });
    setDisplayedJobs(jobsToShow);
  }, [allFetchedJobs, filter, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your jobs...</p>
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
          You must be logged in as a job seeker to view your jobs.
        </AlertDescription>
      </Alert>
    );
  }

  const noJobsBasedOnFilter =
    displayedJobs.length === 0 && allFetchedJobs.size > 0;
  const noJobsAtAll =
    displayedJobs.length === 0 &&
    allFetchedJobs.size === 0 &&
    user.appliedJobIds?.length === 0 &&
    user.savedJobIds?.length === 0;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <RadioGroup
          defaultValue="all"
          onValueChange={(value: JobFilterType) => setFilter(value)}
          className="flex gap-2 sm:gap-4 flex-wrap"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="filter-all" />
            <Label htmlFor="filter-all">All My Jobs</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="applied" id="filter-applied" />
            <Label htmlFor="filter-applied">
              Applied ({user.appliedJobIds?.length || 0})
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="saved" id="filter-saved" />
            <Label htmlFor="filter-saved">
              Saved ({user.savedJobIds?.length || 0})
            </Label>
          </div>
        </RadioGroup>
        <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0">
          <Link href="/jobs">
            <Search className="mr-2 h-4 w-4" /> Find More Jobs
          </Link>
        </Button>
      </div>

      {noJobsAtAll ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Jobs Yet</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            You haven&apos;t applied to or saved any jobs yet.
          </AlertDescription>
        </Alert>
      ) : noJobsBasedOnFilter ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Jobs Found</AlertTitle>
          <AlertDescription>
            No jobs match the current filter (&quot;{filter}&quot;).
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              showApplyButton={user.role === 'jobSeeker'} // Only show if seeker
              isApplied={user.appliedJobIds?.includes(job.id)}
              isSavedProp={user.savedJobIds?.includes(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
