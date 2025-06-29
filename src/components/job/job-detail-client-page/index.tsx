// src/components/job/job-detail-client-page/index.tsx
'use client';
import { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import type {
  Job,
  ApplicationAnswer,
  UserRole,
  ApplicationStatus,
} from '@/types';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { useJobSeekerActions } from '@/contexts/JobSeekerActionsContext/JobSeekerActionsContext';
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
  Share2,
  CalendarDays,
  AlertTriangle,
  RotateCcw,
  Ban,
  Award,
  Sparkles as BenefitsIcon,
  Clock,
  Eye,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { formatCurrencyINR } from '@/lib/utils';
import Link from 'next/link';
import { ScreeningQuestionsModal } from '@/components/screening-questions-modal';
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
import { useRouter } from 'next/navigation';
import { format, isValid, parse } from 'date-fns';

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
  initialJobData: Job | null;
};

export default function JobDetailClientPage({ initialJobData }: Props) {
  const [jobData, setJobData] = useState<Job | null>(initialJobData);
  const [isLoading, setIsLoading] = useState(!initialJobData);
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

  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus | null>(null);
  const [saved, setSaved] = useState(false);
  const [showScreeningModal, setShowScreeningModal] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const isJobSeekerSuspended =
    user?.role === 'jobSeeker' && user.status === 'suspended';

  useEffect(() => {
    if (jobData) {
      let canView = false;
      if (jobData.status === 'approved') {
        canView = true;
      } else if (
        user?.role &&
        ADMIN_LIKE_ROLES.includes(user.role as UserRole)
      ) {
        canView = true;
      } else if (
        user?.role === 'employer' &&
        user.companyId === jobData.companyId
      ) {
        canView = true;
      }

      if (!canView) {
        let reason = 'You do not have permission to view this job posting.';
        if (jobData.status === 'pending') {
          reason = 'This job is pending review and not yet publicly available.';
        } else if (jobData.status === 'rejected') {
          reason = 'This job posting is not available (rejected).';
        } else if (jobData.status === 'suspended') {
          reason = 'This job is currently suspended.';
        }
        setAccessDeniedReason(reason);
        setJobData(null);
      } else {
        setAccessDeniedReason(null);
      }
    }
    setIsLoading(false);
  }, [jobData, user]);

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
    if (!jobData || !user || !applicationStatus) return;
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

  let salaryDisplay = 'Not Disclosed';
  if (jobData.payTransparency !== false) {
    if (jobData.salaryMin && jobData.salaryMax) {
      salaryDisplay = `${formatCurrencyINR(jobData.salaryMin)} - ${formatCurrencyINR(jobData.salaryMax)} p.a.`;
    } else if (jobData.salaryMin) {
      salaryDisplay = `${formatCurrencyINR(jobData.salaryMin)} p.a.`;
    } else if (jobData.salaryMax) {
      salaryDisplay = `${formatCurrencyINR(jobData.salaryMax)} p.a.`;
    }
  }

  const applicationDeadlineDate = jobData.applicationDeadline
    ? typeof jobData.applicationDeadline === 'string' &&
      isValid(parse(jobData.applicationDeadline, 'yyyy-MM-dd', new Date()))
      ? parse(jobData.applicationDeadline, 'yyyy-MM-dd', new Date())
      : jobData.applicationDeadline instanceof Timestamp
        ? jobData.applicationDeadline.toDate()
        : null
    : null;

  const isPrivilegedViewer =
    (user?.role && ADMIN_LIKE_ROLES.includes(user.role as UserRole)) ||
    (user?.role === 'employer' && user.companyId === jobData.companyId);

  const experienceYearsText = () => {
    const { minExperienceYears, maxExperienceYears } = jobData;

    if (
      (minExperienceYears === null || minExperienceYears === undefined) &&
      (maxExperienceYears === null || maxExperienceYears === undefined)
    ) {
      return null;
    }

    const min = minExperienceYears;
    const max = maxExperienceYears;

    if (
      min !== undefined &&
      min !== null &&
      (max === undefined || max === null)
    ) {
      return `From ${min} years`;
    }
    if (
      (min === undefined || min === null) &&
      max !== undefined &&
      max !== null
    ) {
      return `Up to ${max} years`;
    }
    if (
      min !== undefined &&
      min !== null &&
      max !== undefined &&
      max !== null
    ) {
      if (min === max) {
        return `${min} years`;
      }
      return `${min} - ${max} years`;
    }
    return null;
  };
  const experienceDisplay = experienceYearsText();

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
    const finalApplicationStatuses: ApplicationStatus[] = [
      'Hired',
      'Rejected By Company',
      'Withdrawn by Applicant',
    ];
    const canWithdraw =
      applicationStatus &&
      !finalApplicationStatuses.includes(applicationStatus);

    if (canWithdraw) {
      return (
        <div className="space-y-2">
          <p className="text-center text-sm text-muted-foreground">
            Current status:{' '}
            <Badge variant="secondary">{applicationStatus}</Badge>
          </p>
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
        </div>
      );
    }

    if (
      applicationStatus &&
      finalApplicationStatuses.includes(applicationStatus)
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
                {salaryDisplay !== 'Not Disclosed' && (
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
                {applicationDeadlineDate && (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1.5"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Apply by: {format(applicationDeadlineDate, 'PPP')}
                  </Badge>
                )}
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
                  Job Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <p>
                    <strong className="text-foreground/80">Industry:</strong>{' '}
                    {jobData.industry}
                  </p>
                  <p>
                    <strong className="text-foreground/80">Department:</strong>{' '}
                    {jobData.department}
                  </p>
                  {jobData.roleDesignation && (
                    <p>
                      <strong className="text-foreground/80">
                        Role/Designation:
                      </strong>{' '}
                      {jobData.roleDesignation}
                    </p>
                  )}
                  <p>
                    <strong className="text-foreground/80">
                      Experience Level:
                    </strong>{' '}
                    {jobData.experienceLevel}
                  </p>
                  {experienceDisplay && (
                    <p>
                      <strong className="text-foreground/80">
                        Years of Experience:
                      </strong>{' '}
                      {experienceDisplay}
                    </p>
                  )}
                  {jobData.educationQualification && (
                    <p>
                      <strong className="text-foreground/80">Education:</strong>{' '}
                      {jobData.educationQualification}
                    </p>
                  )}
                </div>
              </section>
              <Separator />
              <section>
                <h2 className="text-xl font-semibold mb-3 font-headline">
                  Job Responsibilities
                </h2>
                <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
                  {jobData.responsibilities || 'Responsibilities not detailed.'}
                </div>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3 font-headline">
                  Job Requirements
                </h2>
                <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
                  {jobData.requirements || 'Requirements not detailed.'}
                </div>
              </section>
              {jobData.skills && jobData.skills.length > 0 && (
                <section>
                  <Separator className="my-6" />
                  <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-1.5">
                    <Award />
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
              {jobData.benefits && (
                <section>
                  <Separator className="my-6" />
                  <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-1.5">
                    <BenefitsIcon />
                    Benefits
                  </h2>
                  <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
                    {jobData.benefits}
                  </div>
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
              {isPrivilegedViewer && jobData.status !== 'approved' && (
                <Alert
                  variant="default"
                  className="bg-primary/10 border-primary/20"
                >
                  <Eye className="h-5 w-5 text-primary" />
                  <AlertTitle className="font-semibold text-primary/90">
                    Preview Mode
                  </AlertTitle>
                  <AlertDescription className="text-primary/80">
                    This job is not public. Status:{' '}
                    <strong>{jobData.status.toUpperCase()}</strong>.
                  </AlertDescription>
                </Alert>
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
