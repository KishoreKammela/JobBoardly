'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Job,
  ApplicationAnswer,
  ScreeningQuestion,
  UserRole,
  ApplicationStatus,
} from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useJobSeekerActions } from '@/contexts/JobSeekerActionsContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import Image from 'next/image';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  ExternalLink,
  Building,
  CheckCircle,
  Loader2,
  AlertCircle,
  Share2,
  CalendarDays,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  Ban,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { formatCurrencyINR } from '@/lib/utils';
import Link from 'next/link';
import { ScreeningQuestionsModal } from '@/components/ScreeningQuestionsModal';
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
import { useRouter, usePathname } from 'next/navigation';

const ADMIN_LIKE_ROLES: UserRole[] = [
  'admin',
  'superAdmin',
  'moderator',
  'supportAgent',
  'dataAnalyst',
  'complianceOfficer',
  'systemMonitor',
];

type Props = {
  jobId?: string;
};

export default function JobDetailClientPage({ jobId: jobIdFromProps }: Props) {
  const [jobData, setJobData] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(
    null
  );

  const { user, loading: authLoading } = useAuth();
  const {
    applyForJob,
    getApplicationStatus,
    saveJob,
    unsaveJob,
    isJobSaved,
    withdrawApplication,
    userApplications,
  } = useJobSeekerActions();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus | null>(null);
  const [saved, setSaved] = useState(false);
  const [showScreeningModal, setShowScreeningModal] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const isJobSeekerSuspended =
    user?.role === 'jobSeeker' && user.status === 'suspended';

  useEffect(() => {
    if (jobIdFromProps) {
      setError(null);
      setAccessDeniedReason(null);
    }

    if (!jobIdFromProps) {
      setError('No job ID provided. Please ensure the URL is correct.');
      setIsLoading(false);
      setJobData(null);
      setAccessDeniedReason(null);
      return;
    }

    setIsLoading(true);
    setJobData(null);

    const fetchJobDetails = async () => {
      try {
        const jobDocRef = doc(db, 'jobs', jobIdFromProps);
        const jobDocSnap = await getDoc(jobDocRef);

        if (!jobDocSnap.exists()) {
          setError('Job not found.');
          setJobData(null);
          return;
        }

        const data = jobDocSnap.data() as Omit<Job, 'id'>;
        const fetchedJobData: Job = {
          id: jobDocSnap.id,
          ...data,
          postedDate:
            data.postedDate instanceof Timestamp
              ? data.postedDate.toDate().toISOString().split('T')[0]
              : (data.postedDate as string),
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toISOString()
              : (data.createdAt as string),
          updatedAt:
            data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate().toISOString()
              : (data.updatedAt as string),
          screeningQuestions: data.screeningQuestions || [],
        };

        let canView = false;
        if (fetchedJobData.status === 'approved') {
          canView = true;
        } else if (
          user?.role &&
          ADMIN_LIKE_ROLES.includes(user.role as UserRole)
        ) {
          canView = true;
        } else if (
          user?.role === 'employer' &&
          user.companyId === fetchedJobData.companyId
        ) {
          canView = true;
        }

        if (!canView) {
          let reason = 'You do not have permission to view this job posting.';
          if (fetchedJobData.status === 'pending') {
            reason =
              'This job is pending review and not yet publicly available.';
          } else if (fetchedJobData.status === 'rejected') {
            reason = 'This job posting is not available (rejected).';
          } else if (fetchedJobData.status === 'suspended') {
            reason = 'This job is currently suspended.';
          }
          setAccessDeniedReason(reason);
          setJobData(null);
        } else {
          setJobData(fetchedJobData);
          setAccessDeniedReason(null);
        }
      } catch (e: unknown) {
        console.error('Error fetching job details:', e);
        setError(
          `Failed to load job details: ${(e as Error).message || 'Unknown error'}`
        );
        setJobData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobIdFromProps, user?.role, user?.companyId]);

  useEffect(() => {
    if (accessDeniedReason && !isLoading && !authLoading) {
      toast({
        title: 'Access Denied',
        description: accessDeniedReason,
        variant: 'destructive',
      });
      if (user) {
        if (user.role === 'jobSeeker') router.replace('/jobs');
        else if (user.role === 'employer')
          router.replace('/employer/posted-jobs');
        else if (ADMIN_LIKE_ROLES.includes(user.role as UserRole))
          router.replace('/admin');
        else router.replace('/');
      } else {
        router.replace('/jobs');
      }
    }
  }, [accessDeniedReason, isLoading, authLoading, user, router, toast]);

  useEffect(() => {
    if (authLoading || !jobData || !user || user.role !== 'jobSeeker') {
      setApplicationStatus(null);
      setSaved(false);
      return;
    }
    setApplicationStatus(getApplicationStatus(jobData.id));
    setSaved(isJobSaved(jobData.id));
  }, [
    jobData,
    user,
    authLoading,
    getApplicationStatus,
    isJobSaved,
    userApplications,
  ]);

  const handleApply = async (answers?: ApplicationAnswer[]) => {
    if (!jobData) return;
    if (isJobSeekerSuspended) {
      toast({
        title: 'Account Suspended',
        description:
          'Your account is currently suspended. You cannot apply for jobs.',
        variant: 'destructive',
      });
      return;
    }
    if (jobData.status !== 'approved') {
      toast({
        title: 'Cannot Apply',
        description:
          'This job is not currently approved for applications. You might be previewing it.',
        variant: 'destructive',
      });
      return;
    }
    if (user && user.role === 'jobSeeker') {
      try {
        await applyForJob(jobData, answers);
        setShowScreeningModal(false);
        toast({
          title: 'Applied!',
          description: `You've applied for ${jobData.title} at ${jobData.company}.`,
        });
      } catch (e: unknown) {
        const errorApply = e as Error;
        if (
          errorApply.message !==
          'Already applied or application process started.'
        ) {
          toast({
            title: 'Application Failed',
            description:
              errorApply.message || 'Could not submit your application.',
            variant: 'destructive',
          });
        }
        setShowScreeningModal(false);
      }
    } else if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in as a job seeker to apply.',
        variant: 'destructive',
      });
    } else if (user.role === 'employer') {
      toast({
        title: 'Action Not Allowed',
        description: 'Employers cannot apply for jobs.',
        variant: 'destructive',
      });
    }
  };

  const handleInitiateApply = () => {
    if (!jobData) return;
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in as a job seeker to apply.',
        variant: 'destructive',
      });
      return;
    }
    if (isJobSeekerSuspended) {
      toast({
        title: 'Account Suspended',
        description:
          'Your account is currently suspended. You cannot apply for jobs.',
        variant: 'destructive',
      });
      return;
    }
    if (jobData.status !== 'approved') {
      toast({
        title: 'Cannot Apply',
        description:
          'This job is not currently approved for applications. You might be previewing it.',
        variant: 'destructive',
      });
      return;
    }
    const currentAppStatus = getApplicationStatus(jobData.id);
    if (currentAppStatus) {
      toast({
        title: 'Application Status',
        description: `Your application status for this job is: ${currentAppStatus}. You cannot re-apply.`,
        variant: 'default',
      });
      return;
    }

    if (jobData.screeningQuestions && jobData.screeningQuestions.length > 0) {
      setShowScreeningModal(true);
    } else {
      handleApply();
    }
  };

  const handleWithdrawApplication = async () => {
    if (!jobData || !user || applicationStatus !== 'Applied') return;
    if (isJobSeekerSuspended) {
      toast({
        title: 'Account Suspended',
        description:
          'Your account is currently suspended. You cannot withdraw applications.',
        variant: 'destructive',
      });
      return;
    }
    setIsWithdrawing(true);
    try {
      await withdrawApplication(jobData.id);
      toast({
        title: 'Application Withdrawn',
        description: `Your application for ${jobData.title} has been withdrawn.`,
      });
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to withdraw application.',
        variant: 'destructive',
      });
    } finally {
      setIsWithdrawing(false);
      setShowWithdrawConfirm(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!jobData) return;
    if (isJobSeekerSuspended) {
      toast({
        title: 'Account Suspended',
        description:
          'Your account is currently suspended. You cannot save jobs.',
        variant: 'destructive',
      });
      return;
    }
    if (jobData.status !== 'approved') {
      toast({
        title: 'Cannot Save',
        description: 'This job is not currently approved and cannot be saved.',
        variant: 'destructive',
      });
      return;
    }
    if (applicationStatus) {
      toast({
        title: 'Action Not Allowed',
        description:
          'Cannot save or unsave a job with an active or concluded application.',
        variant: 'default',
      });
      return;
    }
    if (!user || user.role !== 'jobSeeker') {
      toast({
        title: 'Login Required',
        description: 'Please log in as a job seeker to save jobs.',
        variant: 'destructive',
      });
      return;
    }
    if (saved) {
      await unsaveJob(jobData.id);
      setSaved(false);
      toast({
        title: 'Job Unsaved',
        description: `${jobData.title} removed from your saved jobs.`,
      });
    } else {
      await saveJob(jobData.id);
      setSaved(true);
      toast({
        title: 'Job Saved!',
        description: `${jobData.title} added to your saved jobs.`,
      });
    }
  };

  const handleShare = () => {
    if (!jobData) return;
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied!',
      description: 'Job link copied to clipboard.',
    });
  };

  if (!jobIdFromProps && !isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Job</AlertTitle>
          <AlertDescription>
            No job ID provided. Please ensure the URL is correct.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading job details...</p>
      </div>
    );
  }

  if (accessDeniedReason && !isLoading && !authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Redirecting...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Job</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-xl text-muted-foreground">
          Job details are unavailable. The job may have been removed or an error
          occurred.
        </p>
        <Button variant="link" asChild className="mt-2 block">
          <Link href="/jobs">Browse other jobs</Link>
        </Button>
      </div>
    );
  }

  const companyLogo =
    jobData.companyLogoUrl ||
    `https://placehold.co/100x100.png?text=${jobData.company?.substring(0, 2).toUpperCase() || 'C'}`;
  const salaryDisplay =
    jobData.salaryMin && jobData.salaryMax
      ? `${formatCurrencyINR(jobData.salaryMin)} - ${formatCurrencyINR(jobData.salaryMax)} p.a.`
      : jobData.salaryMin
        ? `${formatCurrencyINR(jobData.salaryMin)} p.a.`
        : jobData.salaryMax
          ? `${formatCurrencyINR(jobData.salaryMax)} p.a.`
          : 'Not Disclosed';

  const isPrivilegedViewer =
    (user?.role && ADMIN_LIKE_ROLES.includes(user.role as UserRole)) ||
    (user?.role === 'employer' && user.companyId === jobData.companyId);

  const renderJobSeekerActions = () => {
    if (!user || user.role !== 'jobSeeker') return null;
    if (jobData.status !== 'approved') {
      return (
        <Badge
          variant="outline"
          className="w-full text-center justify-center py-2.5 text-md"
        >
          <Ban className="mr-2 h-5 w-5" /> This job is not currently open for
          applications.
        </Badge>
      );
    }

    if (applicationStatus === 'Applied') {
      return (
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={() => setShowWithdrawConfirm(true)}
          disabled={isJobSeekerSuspended || isWithdrawing}
        >
          {isWithdrawing ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-5 w-5" />
          )}
          Withdraw Application
        </Button>
      );
    }

    if (
      applicationStatus === 'Withdrawn by Applicant' ||
      applicationStatus === 'Rejected By Company' ||
      applicationStatus === 'Hired'
    ) {
      let badgeVariant: 'default' | 'destructive' | 'secondary' | 'outline' =
        'secondary';
      let icon = <CheckCircle className="mr-2 h-5 w-5" />;
      if (applicationStatus === 'Hired') badgeVariant = 'default';
      if (applicationStatus.startsWith('Rejected'))
        badgeVariant = 'destructive';
      if (applicationStatus === 'Withdrawn by Applicant') {
        badgeVariant = 'outline';
        icon = <RotateCcw className="mr-2 h-5 w-5" />;
      }
      return (
        <Badge
          variant={badgeVariant}
          className="w-full text-center justify-center py-2.5 text-md"
        >
          {icon} {applicationStatus}
        </Badge>
      );
    }
    return (
      <Button
        size="lg"
        onClick={handleInitiateApply}
        className="w-full"
        disabled={isJobSeekerSuspended}
      >
        Apply Now <ExternalLink className="ml-2 h-5 w-5" />
      </Button>
    );
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {isJobSeekerSuspended && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Account Suspended</AlertTitle>
          <AlertDescription>
            Your account is currently suspended. Applying for and saving jobs is
            disabled.
          </AlertDescription>
        </Alert>
      )}
      <Card className="shadow-xl">
        <CardHeader className="bg-muted/30 p-6 rounded-t-lg">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Image
              src={companyLogo}
              alt={`${jobData.company} company logo`}
              width={100}
              height={100}
              className="rounded-lg border-2 border-primary/20 object-contain p-1 bg-background"
              data-ai-hint="company logo"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold font-headline text-primary mb-1">
                {jobData.title}
              </h1>
              <div className="flex items-center gap-2 text-lg text-foreground mb-1">
                <Building className="h-5 w-5 text-muted-foreground" />
                {jobData.companyId ? (
                  <Link
                    href={`/companies/${jobData.companyId}`}
                    className="hover:underline"
                  >
                    {jobData.company}
                  </Link>
                ) : (
                  <span>{jobData.company}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>{jobData.location}</span>
                {jobData.isRemote && (
                  <Badge variant="outline" className="ml-2">
                    Remote
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  {jobData.type}
                </Badge>
                {(jobData.salaryMin || jobData.salaryMax) && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1.5"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    {salaryDisplay}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Posted:{' '}
                  {new Date(jobData.postedDate as string).toLocaleDateString()}
                </Badge>
                {isPrivilegedViewer && jobData.status !== 'approved' && (
                  <Badge
                    variant={
                      jobData.status === 'pending' ? 'secondary' : 'destructive'
                    }
                    className="ml-2 align-middle"
                  >
                    Status: {jobData.status.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3 font-headline">
                  Job Description
                </h2>
                <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
                  {jobData.description}
                </div>
              </section>

              {jobData.skills && jobData.skills.length > 0 && (
                <section>
                  <Separator className="my-6" />
                  <h2 className="text-xl font-semibold mb-3 font-headline">
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {jobData.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="default"
                        className="text-sm px-3 py-1"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}
              {isPrivilegedViewer &&
                jobData.screeningQuestions &&
                jobData.screeningQuestions.length > 0 && (
                  <section>
                    <Separator className="my-6" />
                    <h2 className="text-xl font-semibold mb-3 font-headline">
                      Screening Questions (For Internal Review)
                    </h2>
                    <ul className="space-y-3 list-disc list-inside text-sm text-foreground/90 pl-4">
                      {jobData.screeningQuestions.map(
                        (q: ScreeningQuestion) => (
                          <li key={q.id}>
                            {q.questionText}{' '}
                            <Badge variant="outline" className="text-xs ml-1">
                              Type:{' '}
                              {q.type === 'yesNo' ? 'Yes/No' : 'Text Answer'}
                              {q.isRequired && ', Required'}
                            </Badge>
                          </li>
                        )
                      )}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      These questions are presented to applicants during the
                      application process.
                    </p>
                  </section>
                )}
            </div>
            <aside className="w-full sm:w-64 space-y-4">
              {renderJobSeekerActions()}
              {(!user || user.role !== 'jobSeeker') &&
                jobData.status === 'approved' && (
                  <Button
                    size="lg"
                    onClick={handleInitiateApply}
                    className="w-full"
                  >
                    Apply Now <ExternalLink className="ml-2 h-5 w-5" />
                  </Button>
                )}
              {user &&
                user.role === 'jobSeeker' &&
                jobData.status === 'approved' &&
                !applicationStatus && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleSaveToggle}
                    className="w-full"
                    disabled={isJobSeekerSuspended}
                  >
                    <Bookmark
                      className={`mr-2 h-5 w-5 ${saved ? 'fill-primary text-primary' : ''}`}
                    />
                    {saved ? 'Job Saved' : 'Save Job'}
                  </Button>
                )}
              {user &&
                user.role !== 'jobSeeker' &&
                jobData.status !== 'approved' &&
                isPrivilegedViewer && (
                  <div className="p-3 border rounded-md text-center bg-accent/10">
                    <HelpCircle className="mx-auto h-8 w-8 text-accent mb-2" />
                    <p className="text-sm text-accent-foreground font-medium">
                      This is a preview for{' '}
                      {user.role === 'employer'
                        ? 'your company'
                        : 'administrative'}{' '}
                      purposes.
                    </p>
                  </div>
                )}
              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
                className="w-full"
              >
                <Share2 className="mr-2 h-5 w-5" /> Share Job
              </Button>
            </aside>
          </div>
        </CardContent>
        <CardFooter className="p-6 border-t bg-muted/20 rounded-b-lg">
          <p className="text-xs text-muted-foreground">
            JobBoardly is not responsible for the content of job postings.
            Please research companies thoroughly.
          </p>
        </CardFooter>
      </Card>
      {showScreeningModal && jobData && (
        <ScreeningQuestionsModal
          isOpen={showScreeningModal}
          onClose={() => setShowScreeningModal(false)}
          questions={jobData.screeningQuestions || []}
          onSubmit={handleApply}
          jobTitle={jobData.title}
        />
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
              {jobData.title}&quot;? This action cannot be undone, and you will
              not be able to re-apply for this position.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isWithdrawing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdrawApplication}
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
