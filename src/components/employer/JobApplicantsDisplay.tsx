
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import type { Job, Application, ApplicationStatus } from '@/types';
import { EmployerManagedApplicationStatuses } from '@/types'; // Import the statuses
import { CandidateCard } from './CandidateCard'; // Still useful if we want to link to full candidate profile
import { AlertCircle, Loader2, UserCircle, Edit2, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface JobApplicantsDisplayProps {
  jobId: string;
}

export function JobApplicantsDisplay({ jobId }: JobApplicantsDisplayProps) {
  const { user, updateApplicationStatus } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null | undefined>(undefined);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNotesFor, setEditingNotesFor] = useState<string | null>(null); // applicationId
  const [currentNotes, setCurrentNotes] = useState<string>("");

  useEffect(() => {
    const fetchJobAndApplicants = async () => {
      setIsLoading(true);
      setError(null);
      setJob(undefined);
      setApplications([]);

      if (!user || user.role !== 'employer' || !user.uid) {
        setError("You must be logged in as an employer to view applicants.");
        setIsLoading(false);
        setJob(null);
        return;
      }

      try {
        const jobDocRef = doc(db, "jobs", jobId);
        const jobDocSnap = await getDoc(jobDocRef);

        if (!jobDocSnap.exists()) {
          setError("Job not found.");
          setJob(null);
          setIsLoading(false);
          return;
        }
        const jobData = { id: jobDocSnap.id, ...jobDocSnap.data() } as Job;

        if (jobData.postedById !== user.uid) {
          setError("You do not have permission to view applicants for this job.");
          setJob(null);
          setIsLoading(false);
          return;
        }
        
        const processedJobData: Job = {
            ...jobData,
            postedDate: jobData.postedDate instanceof Timestamp ? jobData.postedDate.toDate().toISOString().split('T')[0] : jobData.postedDate as string,
            createdAt: jobData.createdAt instanceof Timestamp ? jobData.createdAt.toDate().toISOString() : jobData.createdAt as Timestamp, // Keep as Timestamp if no conversion needed
            updatedAt: jobData.updatedAt instanceof Timestamp ? jobData.updatedAt.toDate().toISOString() : jobData.updatedAt as Timestamp, // Keep as Timestamp if no conversion needed
        };
        setJob(processedJobData);

        const appsQuery = query(collection(db, "applications"), where("jobId", "==", jobId), orderBy("appliedAt", "desc"));
        const appsSnapshot = await getDocs(appsQuery);
        const fetchedApplications = appsSnapshot.docs.map(d => {
            const appData = d.data();
            return {
                id: d.id,
                ...appData,
                appliedAt: appData.appliedAt instanceof Timestamp ? appData.appliedAt.toDate().toISOString() : appData.appliedAt,
                updatedAt: appData.updatedAt instanceof Timestamp ? appData.updatedAt.toDate().toISOString() : appData.updatedAt,
            } as Application;
        });
        setApplications(fetchedApplications);

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

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setApplications(prevApps => prevApps.map(app => app.id === applicationId ? { ...app, status: newStatus, updatedAt: new Date().toISOString() } : app));
      toast({ title: "Status Updated", description: "Applicant status has been changed." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
      console.error("Failed to update status:", err);
    }
  };
  
  const handleSaveNotes = async (applicationId: string) => {
    try {
      // We call updateApplicationStatus, if it also handles notes, great.
      // If not, we'd need a separate function or extend it.
      // For now, let's assume updateApplicationStatus can take notes.
      // The function signature in AuthContext would need to be:
      // updateApplicationStatus(applicationId: string, newStatus: ApplicationStatus, employerNotes?: string)
      // and it would update notes if provided.
      // Here, we're saving notes for an existing status, so we pass the current status.
      const appToUpdate = applications.find(app => app.id === applicationId);
      if (!appToUpdate) return;

      await updateApplicationStatus(applicationId, appToUpdate.status, currentNotes);
      setApplications(prevApps => prevApps.map(app => app.id === applicationId ? { ...app, employerNotes: currentNotes, updatedAt: new Date().toISOString() } : app));
      toast({ title: "Notes Saved", description: "Employer notes have been updated." });
      setEditingNotesFor(null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to save notes.", variant: "destructive" });
      console.error("Failed to save notes:", err);
    }
  };

  const startEditingNotes = (app: Application) => {
    setEditingNotesFor(app.id);
    setCurrentNotes(app.employerNotes || "");
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading applicants...</p>
      </div>
    );
  }
  
  if (error && job !== null) { 
     return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }
  
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
      
      {applications.length === 0 ? (
         <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Applicants Yet</AlertTitle>
            <AlertDescription>
            There are currently no applicants for this job posting.
            </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
            {applications.map(app => (
            <Card key={app.id} className="shadow-md">
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage src={app.applicantAvatarUrl || `https://placehold.co/64x64.png`} alt={app.applicantName} data-ai-hint="applicant photo" />
                    <AvatarFallback>{app.applicantName?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link href={`/employer/candidates/${app.applicantId}`} className="hover:underline">
                        <CardTitle className="text-xl font-headline text-primary">{app.applicantName}</CardTitle>
                    </Link>
                    <CardDescription>{app.applicantHeadline || "Job Seeker"}</CardDescription>
                    <p className="text-xs text-muted-foreground mt-1">
                        Applied: {app.appliedAt ? new Date(app.appliedAt as string).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                   <Badge variant={app.status === 'Hired' ? 'default' : app.status.startsWith('Rejected') ? 'destructive' : 'secondary'} className="text-sm px-3 py-1 whitespace-nowrap">{app.status}</Badge>
              </CardHeader>
              <CardContent className="pb-4">
                {editingNotesFor === app.id ? (
                  <div className="space-y-2">
                    <Textarea 
                      value={currentNotes}
                      onChange={(e) => setCurrentNotes(e.target.value)}
                      placeholder="Add internal notes about this applicant..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveNotes(app.id)}>Save Notes</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingNotesFor(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {app.employerNotes && (
                      <p className="text-sm text-muted-foreground italic bg-muted/30 p-2 rounded-md mb-2 whitespace-pre-wrap">
                        <strong>Notes:</strong> {app.employerNotes}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t pt-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Label htmlFor={`status-${app.id}`} className="text-sm font-medium whitespace-nowrap">Application Status:</Label>
                  <Select
                    value={app.status}
                    onValueChange={(newStatus) => handleStatusChange(app.id, newStatus as ApplicationStatus)}
                  >
                    <SelectTrigger id={`status-${app.id}`} className="w-full sm:w-[200px] bg-background">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      {EmployerManagedApplicationStatuses.map(statusVal => (
                        <SelectItem key={statusVal} value={statusVal}>{statusVal}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <Button variant="outline" size="sm" onClick={() => startEditingNotes(app)}>
                        <Edit2 className="mr-2 h-4 w-4"/> {app.employerNotes ? "Edit Notes" : "Add Notes"}
                    </Button>
                    <Button size="sm" asChild>
                        <Link href={`/employer/candidates/${app.applicantId}`}>
                            <UserCircle className="mr-2 h-4 w-4"/> View Full Profile
                        </Link>
                    </Button>
                </div>
              </CardFooter>
            </Card>
            ))}
        </div>
      )}
    </div>
  );
}
