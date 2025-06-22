// src/components/my-jobs-display/index.tsx
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/Auth/AuthContext';
import type { Job } from '@/types';
import { JobCard } from '@/components/JobCard';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useJobSeekerActions } from '@/contexts/JobSeekerActionsContext/JobSeekerActionsContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { JobFilterType } from './_lib/interfaces';
import {
  withdrawJobApplication,
  fetchJobsDataForDisplay,
} from './_lib/actions';

export function MyJobsDisplay() {
  const { user } = useAuth();
  const {
    userApplications,
    withdrawApplication: withdrawAppFromContext,
    isJobSaved,
  } = useJobSeekerActions();
  const { toast } = useToast();

  const [allFetchedJobsDetails, setAllFetchedJobsDetails] = useState<
    Map<string, Job>
  >(new Map());
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<JobFilterType>('all');

  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [jobToWithdraw, setJobToWithdraw] = useState<Job | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (user && user.role === 'jobSeeker') {
      fetchJobsDataForDisplay(
        user,
        userApplications,
        setAllFetchedJobsDetails,
        setIsLoading,
        setError
      );
    } else if (!user) {
      setIsLoading(false);
    }
  }, [user, userApplications]);

  useEffect(() => {
    if (!user || !allFetchedJobsDetails.size) {
      setDisplayedJobs([]);
      return;
    }

    let jobsToShow: Job[] = [];
    const savedJobIdsSet = new Set(user.savedJobIds || []);

    switch (filter) {
      case 'applied':
        jobsToShow = Array.from(allFetchedJobsDetails.values()).filter(
          (job) =>
            userApplications.has(job.id) &&
            userApplications.get(job.id)?.status === 'Applied'
        );
        break;
      case 'saved':
        jobsToShow = Array.from(allFetchedJobsDetails.values()).filter((job) =>
          savedJobIdsSet.has(job.id)
        );
        break;
      case 'withdrawn':
        jobsToShow = Array.from(allFetchedJobsDetails.values()).filter(
          (job) =>
            userApplications.has(job.id) &&
            userApplications.get(job.id)?.status === 'Withdrawn by Applicant'
        );
        break;
      case 'all':
      default:
        jobsToShow = Array.from(allFetchedJobsDetails.values());
        break;
    }

    jobsToShow.sort((a, b) => {
      const appA = userApplications.get(a.id);
      const appB = userApplications.get(b.id);
      const dateA = appA?.appliedAt
        ? new Date(appA.appliedAt as string).getTime()
        : a.createdAt
          ? new Date(a.createdAt as string).getTime()
          : 0;
      const dateB = appB?.appliedAt
        ? new Date(appB.appliedAt as string).getTime()
        : b.createdAt
          ? new Date(b.createdAt as string).getTime()
          : 0;
      return dateB - dateA;
    });
    setDisplayedJobs(jobsToShow);
  }, [allFetchedJobsDetails, filter, user, userApplications]);

  const handleWithdrawClick = (job: Job) => {
    setJobToWithdraw(job);
    setShowWithdrawConfirm(true);
  };

  const confirmWithdrawApplication = async () => {
    if (!jobToWithdraw || !user) return;
    setIsWithdrawing(true);
    await withdrawJobApplication({
      job: jobToWithdraw,
      user,
      withdrawAppFromContext,
      toast,
    });
    setIsWithdrawing(false);
    setShowWithdrawConfirm(false);
    setJobToWithdraw(null);
  };

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
    displayedJobs.length === 0 && allFetchedJobsDetails.size > 0;
  const noJobsAtAll =
    displayedJobs.length === 0 &&
    allFetchedJobsDetails.size === 0 &&
    userApplications.size === 0 &&
    (user.savedJobIds || []).length === 0;

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
            <Label htmlFor="filter-all">All My Interaction</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="applied" id="filter-applied" />
            <Label htmlFor="filter-applied">
              Applied (
              {
                Array.from(userApplications.values()).filter(
                  (app) => app.status === 'Applied'
                ).length
              }
              )
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="saved" id="filter-saved" />
            <Label htmlFor="filter-saved">
              Saved ({(user.savedJobIds || []).length})
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="withdrawn" id="filter-withdrawn" />
            <Label htmlFor="filter-withdrawn">
              Withdrawn (
              {
                Array.from(userApplications.values()).filter(
                  (app) => app.status === 'Withdrawn by Applicant'
                ).length
              }
              )
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
          {displayedJobs.map((job) => {
            const application = userApplications.get(job.id);
            return (
              <JobCard
                key={job.id}
                job={job}
                applicationStatus={application?.status || null}
                isSavedProp={isJobSaved(job.id)}
                onWithdraw={() => handleWithdrawClick(job)}
              />
            );
          })}
        </div>
      )}
      <AlertDialog
        open={showWithdrawConfirm}
        onOpenChange={setShowWithdrawConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Application Withdrawal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw your application for &quot;
              {jobToWithdraw?.title}&quot;? This action cannot be undone, and
              you will not be able to re-apply for this position.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isWithdrawing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmWithdrawApplication}
              disabled={isWithdrawing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isWithdrawing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Yes, Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
