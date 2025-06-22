'use client';
import type { Job, ApplicationStatus } from '@/types';
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
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  ExternalLink,
  Building,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
  Ban,
  Users,
  Clock,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { useJobSeekerActions } from '@/contexts/JobSeekerActionsContext/JobSeekerActionsContext';
import Link from 'next/link';
import { formatCurrencyINR } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import { format, isValid, parse } from 'date-fns';

interface JobCardProps {
  job: Job;
  applicationStatus?: ApplicationStatus | null;
  isSavedProp?: boolean;
  onWithdraw?: (jobId: string) => void;
}

export function JobCard({
  job,
  applicationStatus,
  isSavedProp,
  onWithdraw,
}: JobCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    saveJob,
    unsaveJob,
    isJobSaved: checkIsJobSavedContext,
  } = useJobSeekerActions();

  const [saved, setSaved] = useState(
    isSavedProp !== undefined ? isSavedProp : false
  );

  const isJobSeekerSuspended =
    user?.role === 'jobSeeker' && user.status === 'suspended';

  useEffect(() => {
    if (isSavedProp === undefined && user && user.role === 'jobSeeker') {
      setSaved(checkIsJobSavedContext(job.id));
    } else if (isSavedProp !== undefined) {
      setSaved(isSavedProp);
    }
  }, [user, job.id, checkIsJobSavedContext, isSavedProp]);

  const handleSaveToggle = async () => {
    if (isJobSeekerSuspended) {
      toast({
        title: 'Account Suspended',
        description:
          'Your account is currently suspended. You cannot save jobs.',
        variant: 'destructive',
      });
      return;
    }
    if (job.status !== 'approved') {
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
          'Cannot save or unsave a job that has an active or concluded application status.',
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
      await unsaveJob(job.id);
      setSaved(false);
      toast({
        title: 'Job Unsaved',
        description: `${job.title} removed from your saved jobs.`,
      });
    } else {
      await saveJob(job.id);
      setSaved(true);
      toast({
        title: 'Job Saved!',
        description: `${job.title} added to your saved jobs.`,
      });
    }
  };

  const handleWithdraw = () => {
    if (isJobSeekerSuspended) {
      toast({
        title: 'Account Suspended',
        description:
          'Your account is currently suspended. You cannot withdraw applications.',
        variant: 'destructive',
      });
      return;
    }
    if (onWithdraw) {
      onWithdraw(job.id);
    }
  };

  const companyLogo =
    job.companyLogoUrl ||
    `https://placehold.co/64x64.png?text=${job.company?.substring(0, 2).toUpperCase() || 'C'}`;

  let salaryDisplay = 'Not Disclosed';
  if (job.payTransparency !== false) {
    if (job.salaryMin && job.salaryMax) {
      salaryDisplay = `${formatCurrencyINR(job.salaryMin)} - ${formatCurrencyINR(job.salaryMax)} p.a.`;
    } else if (job.salaryMin) {
      salaryDisplay = `${formatCurrencyINR(job.salaryMin)} p.a.`;
    } else if (job.salaryMax) {
      salaryDisplay = `${formatCurrencyINR(job.salaryMax)} p.a.`;
    }
  }

  const applicationDeadlineDate = job.applicationDeadline
    ? typeof job.applicationDeadline === 'string' &&
      isValid(parse(job.applicationDeadline, 'yyyy-MM-dd', new Date()))
      ? parse(job.applicationDeadline, 'yyyy-MM-dd', new Date())
      : job.applicationDeadline instanceof Timestamp
        ? job.applicationDeadline.toDate()
        : null
    : null;

  const canCurrentlyApply =
    !applicationStatus && job.status === 'approved' && !isJobSeekerSuspended;
  const canCurrentlySave =
    !applicationStatus && job.status === 'approved' && !isJobSeekerSuspended;

  const finalApplicationStatuses: ApplicationStatus[] = [
    'Hired',
    'Rejected By Company',
    'Withdrawn by Applicant',
  ];
  const canCurrentlyWithdraw =
    applicationStatus &&
    !finalApplicationStatuses.includes(applicationStatus) &&
    !isJobSeekerSuspended;

  const renderApplicationStatusBadge = () => {
    if (
      !applicationStatus ||
      !finalApplicationStatuses.includes(applicationStatus)
    )
      return null;

    let variant: 'default' | 'destructive' | 'secondary' | 'outline' =
      'secondary';
    let icon = <CheckCircle className="mr-1.5 h-4 w-4" />;

    if (applicationStatus === 'Hired') {
      variant = 'default';
    } else if (applicationStatus.startsWith('Rejected')) {
      variant = 'destructive';
      icon = <AlertTriangle className="mr-1.5 h-4 w-4" />;
    } else if (applicationStatus === 'Withdrawn by Applicant') {
      variant = 'outline';
      icon = <RotateCcw className="mr-1.5 h-4 w-4" />;
    }

    return (
      <Badge variant={variant} className="py-1.5 px-2.5 text-sm">
        {icon} {applicationStatus}
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Image
            src={companyLogo}
            alt={`${job.company} logo`}
            width={48}
            height={48}
            className="rounded-md border object-contain p-0.5 bg-background"
            data-ai-hint="company logo"
          />
          <div>
            <CardTitle className="text-lg font-headline leading-tight hover:text-primary transition-colors">
              <Link href={`/jobs/${job.id}`}>{job.title}</Link>
            </CardTitle>
            <CardDescription className="text-sm flex items-center gap-1.5 mt-1">
              <Building className="h-3.5 w-3.5" />
              {job.companyId ? (
                <Link
                  href={`/companies/${job.companyId}`}
                  className="hover:underline"
                >
                  {job.company}
                </Link>
              ) : (
                job.company
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4 flex-grow">
        <div className="text-sm text-muted-foreground space-y-1.5">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary/80" /> {job.location}{' '}
            {job.isRemote && <Badge variant="outline">Remote</Badge>}
          </p>
          <p className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-primary/80" /> {job.type}
          </p>
          {salaryDisplay !== 'Not Disclosed' && (
            <p className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-primary/80" /> {salaryDisplay}
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary/80" /> {job.experienceLevel}
          </p>
          {job.industry && (
            <p className="flex items-center gap-1.5">
              <Building className="h-4 w-4 text-primary/80" /> {job.industry}
            </p>
          )}
        </div>
        <p className="text-sm text-foreground/90 line-clamp-3">
          {job.responsibilities}
        </p>
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {job.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge variant="secondary">+{job.skills.length - 4} more</Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between items-center pt-4 border-t gap-2">
        <div className="text-xs text-muted-foreground whitespace-nowrap space-y-0.5">
          <p>
            Posted:{' '}
            {job.postedDate
              ? typeof job.postedDate === 'string'
                ? new Date(job.postedDate).toLocaleDateString()
                : (job.postedDate as Timestamp).toDate().toLocaleDateString()
              : 'N/A'}
          </p>
          {applicationDeadlineDate && (
            <p className="flex items-center gap-1 text-destructive/90">
              <Clock className="h-3 w-3" /> Apply by:{' '}
              {format(applicationDeadlineDate, 'PP')}
            </p>
          )}
        </div>
        {user?.role === 'jobSeeker' && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveToggle}
              aria-pressed={saved}
              aria-label={saved ? 'Unsave job' : 'Save job'}
              disabled={!canCurrentlySave || !!applicationStatus}
              title={saved ? 'Unsave Job' : 'Save Job'}
            >
              <Bookmark
                className={`h-4 w-4 ${saved ? 'fill-primary text-primary' : ''}`}
              />
            </Button>

            {(() => {
              if (canCurrentlyWithdraw) {
                return (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWithdraw}
                    title="Withdraw Application"
                  >
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Withdraw
                  </Button>
                );
              }
              if (
                applicationStatus &&
                finalApplicationStatuses.includes(applicationStatus)
              ) {
                return renderApplicationStatusBadge();
              }
              if (canCurrentlyApply) {
                return (
                  <Button
                    size="sm"
                    asChild
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Link href={`/jobs/${job.id}`}>
                      Apply Now <ExternalLink className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                );
              }
              if (job.status !== 'approved') {
                return (
                  <Badge variant="outline" className="text-xs">
                    <Ban className="mr-1 h-3 w-3" /> Not Available
                  </Badge>
                );
              }
              return null;
            })()}
          </div>
        )}
        {!user && job.status === 'approved' && (
          <Button
            size="sm"
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link href={`/jobs/${job.id}`}>
              Apply Now <ExternalLink className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
