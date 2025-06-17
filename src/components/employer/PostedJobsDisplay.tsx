
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import type { Job } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Edit3, Eye, Loader2, Users, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';

export function PostedJobsDisplay() {
  const { user } = useAuth();
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostedJobs = async () => {
      if (!user || user.role !== 'employer') {
        setIsLoading(false);
        setPostedJobs([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const jobsCollectionRef = collection(db, "jobs");
        const q = query(jobsCollectionRef, where("postedById", "==", user.id), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                postedDate: data.postedDate instanceof Timestamp ? data.postedDate.toDate().toISOString().split('T')[0] : data.postedDate,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            } as Job;
        });
        setPostedJobs(jobsData);
      } catch (e) {
        console.error("Error fetching posted jobs:", e);
        setError("Failed to load your posted jobs. Please try again.");
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
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
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
          You haven't posted any jobs yet.
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
      {postedJobs.map(job => (
        <Card key={job.id} className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-xl font-headline">{job.title}</CardTitle>
                    <CardDescription>
                        Posted on: {job.postedDate ? (typeof job.postedDate === 'string' ? job.postedDate : job.postedDate.toDate().toLocaleDateString()) : 'N/A'} - {job.location} ({job.type})
                    </CardDescription>
                </div>
                 <Badge variant={ (job.applicantIds?.length || 0) > 0 ? "default" : "secondary"}>
                    {job.applicantIds?.length || 0} Applicant(s)
                </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/employer/jobs/${job.id}/applicants`}>
                <Users className="mr-2 h-4 w-4" /> View Applicants ({job.applicantIds?.length || 0})
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild disabled>
              {/* Link to an edit job page - not implemented yet */}
              <Link href={`/employer/post-job?edit=${job.id}`}> 
                <Edit3 className="mr-2 h-4 w-4" /> Edit Job
              </Link>
            </Button>
            <Button size="sm" asChild disabled>
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
