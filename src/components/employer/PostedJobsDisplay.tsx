
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { mockJobs } from '@/lib/mockData';
import type { Job } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Edit3, Eye, Loader2, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function PostedJobsDisplay() {
  const { user } = useAuth();
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (user && user.role === 'employer') {
      const jobs = mockJobs.filter(job => job.postedById === user.id);
      setPostedJobs(jobs);
    } else {
      setPostedJobs([]);
    }
    setIsLoading(false);
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your posted jobs...</p>
      </div>
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
        <AlertDescription>
          You haven't posted any jobs yet. 
          <Link href="/employer/post-job" className="font-semibold text-primary hover:underline ml-1">Post your first job now!</Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {postedJobs.map(job => (
        <Card key={job.id} className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-xl font-headline">{job.title}</CardTitle>
                    <CardDescription>Posted on: {new Date(job.postedDate).toLocaleDateString()} - {job.location} ({job.type})</CardDescription>
                </div>
                 <Badge variant={ (job.applicantIds?.length || 0) > 0 ? "default" : "secondary"}>
                    {job.applicantIds?.length || 0} Applicant(s)
                </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/employer/jobs/${job.id}/applicants`}>
                <Users className="mr-2 h-4 w-4" /> View Applicants
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
                {/* Link to an edit job page - not implemented yet */}
              <Link href={`/employer/post-job?edit=${job.id}`}> 
                <Edit3 className="mr-2 h-4 w-4" /> Edit Job
              </Link>
            </Button>
            <Button size="sm" asChild>
                {/* Link to the public job view page - not implemented yet */}
              <Link href={`/jobs/${job.id}`} target="_blank"> 
                <Eye className="mr-2 h-4 w-4" /> View Posting
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
