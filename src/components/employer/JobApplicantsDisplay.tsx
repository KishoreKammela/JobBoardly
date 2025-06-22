'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { useEmployerActions } from '@/contexts/EmployerActionsContext/EmployerActionsContext';
import type {
  Job,
  Application,
  ApplicationStatus,
  ApplicationAnswer,
} from '@/types';
import { EmployerManagedApplicationStatuses } from '@/types';
import {
  AlertCircle,
  Loader2,
  UserCircle,
  Edit2,
  Filter,
  Ban,
  MessageSquareQuote,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { Separator } from '../ui/separator';

interface JobApplicantsDisplayProps {
  jobId: string;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  onConfirmAction: (() => Promise<void>) | null;
  confirmText: string;
}

const defaultModalState: ModalState = {
  isOpen: false,
  title: '',
  description: '',
  onConfirmAction: null,
  confirmText: 'Confirm',
};

export function JobApplicantsDisplay({ jobId }: JobApplicantsDisplayProps) {
  const { user, company } = useAuth();
  const { updateApplicationStatus } = useEmployerActions();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null | undefined>(undefined);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    Application[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNotesFor, setEditingNotesFor] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'All'>(
    'All'
  );
  const [modalState, setModalState] = useState<ModalState>(defaultModalState);
  const [isModalActionLoading, setIsModalActionLoading] = useState(false);

  useEffect(() => {
    const fetchJobAndApplicants = async () => {
      setIsLoading(true);
      setError(null);
      setJob(undefined);
      setAllApplications([]);
      setFilteredApplications([]);

      if (!user || user.role !== 'employer' || !user.uid) {
        setError('You must be logged in as an employer to view applicants.');
        setIsLoading(false);
        setJob(null);
        return;
      }

      if (
        company &&
        (company.status === 'suspended' || company.status === 'deleted')
      ) {
        setError(
          `Your company account is ${company.status}. Applicant management is disabled.`
        );
        setIsLoading(false);
        setJob(null);
        return;
      }

      try {
        const jobDocRef = doc(db, 'jobs', jobId);
        const jobDocSnap = await getDoc(jobDocRef);

        if (!jobDocSnap.exists()) {
          setError('Job not found.');
          setJob(null);
          setIsLoading(false);
          return;
        }
        const jobData = { id: jobDocSnap.id, ...jobDocSnap.data() } as Job;

        if (jobData.companyId !== user.companyId) {
          setError(
            'You do not have permission to view applicants for this job.'
          );
          setJob(null);
          setIsLoading(false);
          return;
        }

        const processedJobData: Job = {
          ...jobData,
          postedDate:
            jobData.postedDate instanceof Timestamp
              ? jobData.postedDate.toDate().toISOString().split('T')[0]
              : (jobData.postedDate as string),
          createdAt:
            jobData.createdAt instanceof Timestamp
              ? jobData.createdAt.toDate().toISOString()
              : (jobData.createdAt as Timestamp),
          updatedAt:
            jobData.updatedAt instanceof Timestamp
              ? jobData.updatedAt.toDate().toISOString()
              : (jobData.updatedAt as Timestamp),
        };
        setJob(processedJobData);

        if (processedJobData.status === 'suspended') {
          setAllApplications([]);
          setFilteredApplications([]);
          setIsLoading(false);
          return;
        }

        const appsQuery = query(
          collection(db, 'applications'),
          where('jobId', '==', jobId),
          orderBy('appliedAt', 'desc')
        );
        const appsSnapshot = await getDocs(appsQuery);
        const fetchedApplications = appsSnapshot.docs.map((d) => {
          const appData = d.data();
          return {
            id: d.id,
            ...appData,
            appliedAt:
              appData.appliedAt instanceof Timestamp
                ? appData.appliedAt.toDate().toISOString()
                : appData.appliedAt,
            updatedAt:
              appData.updatedAt instanceof Timestamp
                ? appData.updatedAt.toDate().toISOString()
                : appData.updatedAt,
          } as Application;
        });
        setAllApplications(fetchedApplications);
        setFilteredApplications(fetchedApplications);
      } catch (e: unknown) {
        console.error('Error fetching job and applicants:', e);
        let message = 'Failed to load job applicants. Please try again.';
        if (e instanceof Error) {
          message = `Failed to load job applicants: ${e.message}`;
        }
        setError(message);
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobAndApplicants();
  }, [jobId, user, company]);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredApplications(allApplications);
    } else {
      setFilteredApplications(
        allApplications.filter((app) => app.status === statusFilter)
      );
    }
  }, [statusFilter, allApplications]);

  const showConfirmationModal = (
    title: string,
    description: React.ReactNode,
    action: () => Promise<void>,
    confirmText = 'Confirm'
  ) => {
    setModalState({
      isOpen: true,
      title,
      description,
      onConfirmAction: action,
      confirmText,
    });
  };

  const executeConfirmedAction = async () => {
    if (modalState.onConfirmAction) {
      setIsModalActionLoading(true);
      try {
        await modalState.onConfirmAction();
      } catch (e: unknown) {
        // Specific errors handled in individual action functions
      } finally {
        setIsModalActionLoading(false);
        setModalState(defaultModalState);
      }
    }
  };

  const performStatusUpdate = async (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setAllApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === applicationId
            ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
            : app
        )
      );
      toast({
        title: 'Status Updated',
        description: 'Applicant status has been changed.',
      });
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
      console.error('Failed to update status:', err);
    }
  };

  const handleStatusChange = (
    applicationId: string,
    applicantName: string,
    newStatus: ApplicationStatus
  ) => {
    showConfirmationModal(
      `Change ${applicantName}'s Status?`,
      `Are you sure you want to change this applicant's status to "${newStatus}"?`,
      () => performStatusUpdate(applicationId, newStatus),
      `Set to ${newStatus}`
    );
  };

  const handleSaveNotes = async (applicationId: string) => {
    try {
      const appToUpdate = allApplications.find(
        (app) => app.id === applicationId
      );
      if (!appToUpdate) return;

      await updateApplicationStatus(
        applicationId,
        appToUpdate.status,
        currentNotes
      );
      setAllApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                employerNotes: currentNotes,
                updatedAt: new Date().toISOString(),
              }
            : app
        )
      );
      toast({
        title: 'Notes Saved',
        description: 'Employer notes have been updated.',
      });
      setEditingNotesFor(null);
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to save notes.',
        variant: 'destructive',
      });
      console.error('Failed to save notes:', err);
    }
  };

  const startEditingNotes = (app: Application) => {
    setEditingNotesFor(app.id);
    setCurrentNotes(app.employerNotes || '');
  };

  const formatAnswer = (answer: ApplicationAnswer['answer']): string => {
    if (typeof answer === 'boolean') {
      return answer ? 'Yes' : 'No';
    }
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return answer || 'N/A';
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
          {error ||
            'The job you are trying to view applicants for does not exist or you do not have permission to view its applicants.'}
          <Link
            href="/employer/posted-jobs"
            className="block mt-2 text-primary hover:underline"
          >
            Return to Posted Jobs
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (!job) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Fetching job details...</p>
      </div>
    );
  }

  const isManagementDisabled =
    job.status === 'suspended' ||
    company?.status === 'suspended' ||
    company?.status === 'deleted';

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold mb-1 font-headline">
          Job Applicants
        </h1>
        <h2 className="text-xl font-semibold mb-1 text-primary">{job.title}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Company: {job.company} - Location: {job.location}
        </p>
        {isManagementDisabled && (
          <Alert variant="destructive" className="mb-6">
            <Ban className="h-4 w-4" />
            <AlertTitle>Applicant Management Disabled</AlertTitle>
            <AlertDescription>
              This job or your company account is currently{' '}
              {job.status === 'suspended'
                ? 'suspended by an admin'
                : `in '${company?.status}' status`}
              . Applicant management actions are disabled.
            </AlertDescription>
          </Alert>
        )}
      </div>
      <Separator className="my-6" />
      {!isManagementDisabled && (
        <div>
          <div className="mb-6 p-4 border rounded-md bg-muted/30">
            <Label className="text-md font-semibold flex items-center gap-2 mb-3">
              <Filter className="h-5 w-5 text-primary" /> Filter by Status
            </Label>
            <RadioGroup
              defaultValue="All"
              onValueChange={(value: ApplicationStatus | 'All') =>
                setStatusFilter(value)
              }
              className="flex flex-wrap gap-x-6 gap-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="All" id="filter-all-apps" />
                <Label htmlFor="filter-all-apps">
                  All ({allApplications.length})
                </Label>
              </div>
              {EmployerManagedApplicationStatuses.map((statusVal) => (
                <div key={statusVal} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={statusVal}
                    id={`filter-${statusVal.toLowerCase().replace(/\s/g, '-')}`}
                  />
                  <Label
                    htmlFor={`filter-${statusVal.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {statusVal} (
                    {
                      allApplications.filter((a) => a.status === statusVal)
                        .length
                    }
                    )
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {allApplications.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Applicants Yet</AlertTitle>
              <AlertDescription>
                There are currently no applicants for this job posting.
              </AlertDescription>
            </Alert>
          ) : filteredApplications.length === 0 && statusFilter !== 'All' ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Applicants Match Filter</AlertTitle>
              <AlertDescription>
                No applicants found with status &quot;{statusFilter}&quot;.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {filteredApplications.map((app) => (
                <Card key={app.id} className="shadow-md">
                  <CardHeader className="flex flex-row items-start gap-4 pb-3">
                    <Avatar className="h-16 w-16 border">
                      <AvatarImage
                        src={
                          app.applicantAvatarUrl ||
                          `https://placehold.co/64x64.png`
                        }
                        alt={app.applicantName}
                        data-ai-hint="applicant photo"
                      />
                      <AvatarFallback>
                        {app.applicantName?.[0]?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Link
                        href={`/employer/candidates/${app.applicantId}`}
                        className="hover:underline"
                      >
                        <CardTitle className="text-xl font-headline text-primary">
                          {app.applicantName}
                        </CardTitle>
                      </Link>
                      <CardDescription>
                        {app.applicantHeadline || 'Job Seeker'}
                      </CardDescription>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied:{' '}
                        {app.appliedAt
                          ? new Date(
                              app.appliedAt as string
                            ).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        app.status === 'Hired'
                          ? 'default'
                          : app.status.startsWith('Rejected')
                            ? 'destructive'
                            : 'secondary'
                      }
                      className="text-sm px-3 py-1 whitespace-nowrap"
                    >
                      {app.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-4">
                    {editingNotesFor === app.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={currentNotes}
                          onChange={(e) => setCurrentNotes(e.target.value)}
                          placeholder="Add internal notes about this applicant..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(app.id)}
                          >
                            Save Notes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingNotesFor(null)}
                          >
                            Cancel
                          </Button>
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

                    {app.answers && app.answers.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="text-md font-semibold mb-2 flex items-center gap-2">
                          <MessageSquareQuote className="h-5 w-5 text-primary" />{' '}
                          Screening Question Answers
                        </h4>
                        <div className="space-y-3">
                          {app.answers.map((answerItem) => (
                            <div
                              key={answerItem.questionId}
                              className="text-sm"
                            >
                              <p className="font-medium text-foreground/90">
                                {answerItem.questionText}
                              </p>
                              <p className="text-muted-foreground pl-2">
                                - {formatAnswer(answerItem.answer)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t pt-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Label
                        htmlFor={`status-${app.id}`}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        Application Status:
                      </Label>
                      <Select
                        value={app.status}
                        onValueChange={(newStatus) =>
                          handleStatusChange(
                            app.id,
                            app.applicantName,
                            newStatus as ApplicationStatus
                          )
                        }
                      >
                        <SelectTrigger
                          id={`status-${app.id}`}
                          className="w-full sm:w-[200px] bg-background"
                        >
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          {EmployerManagedApplicationStatuses.map(
                            (statusVal) => (
                              <SelectItem key={statusVal} value={statusVal}>
                                {statusVal}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditingNotes(app)}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />{' '}
                        {app.employerNotes ? 'Edit Notes' : 'Add Notes'}
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/employer/candidates/${app.applicantId}`}>
                          <UserCircle className="mr-2 h-4 w-4" /> View Full
                          Profile
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          <AlertDialog
            open={modalState.isOpen}
            onOpenChange={(open) => {
              if (!open) {
                setModalState(defaultModalState);
                setIsModalActionLoading(false);
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{modalState.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {modalState.description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() =>
                    setModalState({ ...modalState, isOpen: false })
                  }
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={executeConfirmedAction}
                  disabled={isModalActionLoading}
                >
                  {isModalActionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {modalState.confirmText}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </>
  );
}
