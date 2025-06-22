// src/components/employer/posted-jobs-display/index.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/Auth/AuthContext';
import type { Job } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Edit3,
  Eye,
  Loader2,
  Users,
  PlusCircle,
  Ban,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getJobsByPosterId } from '@/services/job.services';

interface JobWithApplicantCount extends Job {
  applicantCount: number;
}

export function PostedJobsDisplay() {
  const { user } = useAuth();
  const [postedJobs, setPostedJobs] = useState<JobWithApplicantCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostedJobs = async () => {
      if (!user || user.role !== 'employer' || !user.uid) {
        setIsLoading(false);
        setPostedJobs([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const jobsData = await getJobsByPosterId(user.uid);
        setPostedJobs(jobsData);
      } catch (e: unknown) {
        console.error('Error fetching posted jobs:', e);
        setError(
          (e as Error).message ||
            'Failed to load your posted jobs. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostedJobs();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your posted jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Jobs</AlertTitle>
        <AlertDescription>
          {error}
          {error.includes('firestore/failed-precondition') &&
            error.includes('index') && (
              <p className="mt-2">
                This query requires a composite index in Firestore. Please check
                the Firebase console or the error logs for a link to create it.
              </p>
            )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!user || user.role !== 'employer') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You must be logged in as an employer to view posted jobs.
        </AlertDescription>
      </Alert>
    );
  }

  if (postedJobs.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Jobs Posted</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          You haven&apos;t posted any jobs yet.
          <Button asChild size="sm">
            <Link href="/employer/post-job">
              <PlusCircle className="mr-2 h-4 w-4" /> Post Your First Job
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {postedJobs.map((job) => (
        <Card
          key={job.id}
          className={`shadow-md hover:shadow-lg transition-shadow ${job.status === 'suspended' ? 'opacity-70 bg-muted/50' : ''}`}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-headline">
                  {job.title}
                </CardTitle>
                <CardDescription>
                  Posted:{' '}
                  {job.postedDate
                    ? new Date(job.postedDate as string).toLocaleDateString()
                    : 'N/A'}{' '}
                  - {job.location} ({job.type})
                  <Badge
                    variant={
                      job.status === 'approved'
                        ? 'default'
                        : job.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                    }
                    className="ml-2 align-middle"
                  >
                    {job.status.toUpperCase()}
                  </Badge>
                  {job.status === 'suspended' && (
                    <Badge
                      variant="outline"
                      className="ml-2 align-middle border-orange-500 text-orange-600"
                    >
                      <Ban className="mr-1 h-3 w-3" /> INACTIVE (Admin
                      Suspended)
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <Badge
                variant={
                  (job.applicantCount || 0) > 0 ? 'default' : 'secondary'
                }
              >
                {job.applicantCount || 0} Applicant(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {job.responsibilities}
            </p>
            {job.status === 'rejected' && job.moderationReason && (
              <p className="text-xs text-destructive mt-1">
                Rejection Reason: {job.moderationReason}
              </p>
            )}
            {job.status === 'suspended' && (
              <p className="text-xs text-orange-600 mt-1">
                This job is currently suspended by an administrator and is not
                visible to job seekers. You cannot manage its applicants or edit
                it at this time.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={job.status === 'suspended'}
            >
              <Link href={`/employer/jobs/${job.id}/applicants`}>
                <Users className="mr-2 h-4 w-4" /> View Applicants (
                {job.applicantCount || 0})
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={job.status === 'suspended'}
            >
              <Link href={`/employer/post-job?edit=${job.id}`}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Job
              </Link>
            </Button>
            <Button
              size="sm"
              asChild
              variant={job.status === 'approved' ? 'default' : 'secondary'}
              className={
                job.status === 'approved'
                  ? ''
                  : 'bg-accent hover:bg-accent/90 text-accent-foreground'
              }
            >
              <Link
                href={`/jobs/${job.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Eye className="mr-2 h-4 w-4" />
                {job.status === 'approved'
                  ? 'View Public Posting'
                  : 'Preview Job Details'}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
