'use client';
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
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  ExternalLink,
  Building,
  CheckCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useJobSeekerActions } from '@/contexts/JobSeekerActionsContext';
import Link from 'next/link';
import { formatCurrencyINR } from '@/lib/utils';
import type { Timestamp } from 'firebase/firestore';

interface JobCardProps {
  job: Job;
  showApplyButton?: boolean;
  isApplied?: boolean;
  isSavedProp?: boolean;
}

export function JobCard({
  job,
  showApplyButton = true,
  isApplied,
  isSavedProp,
}: JobCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { applyForJob, hasAppliedForJob, saveJob, unsaveJob, isJobSaved } =
    useJobSeekerActions();

  const [applied, setApplied] = useState(
    isApplied !== undefined ? isApplied : false
  );
  const [saved, setSaved] = useState(
    isSavedProp !== undefined ? isSavedProp : false
  );
  const isJobSeekerSuspended =
    user?.role === 'jobSeeker' && user.status === 'suspended';

  useEffect(() => {
    if (user && user.role === 'jobSeeker') {
      if (isApplied === undefined) {
        setApplied(hasAppliedForJob(job.id));
      }
      if (isSavedProp === undefined) {
        setSaved(isJobSaved(job.id));
      }
    }
  }, [user, job.id, hasAppliedForJob, isJobSaved, isApplied, isSavedProp]);

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

  const handleApply = async () => {
    if (isJobSeekerSuspended) {
      toast({
        title: 'Account Suspended',
        description:
          'Your account is currently suspended. You cannot apply for jobs.',
        variant: 'destructive',
      });
      return;
    }
    if (!user || user.role !== 'jobSeeker') {
      toast({
        title: 'Login Required',
        description: 'Please log in as a job seeker to apply.',
        variant: 'destructive',
      });
      return;
    }
    if (user.role === 'employer') {
      toast({
        title: 'Action Not Allowed',
        description: 'Employers cannot apply for jobs.',
        variant: 'destructive',
      });
      return;
    }

    await applyForJob(job);
    setApplied(true);
    toast({
      title: 'Applied!',
      description: `You've applied for ${job.title} at ${job.company}.`,
    });
  };

  const companyLogo =
    job.companyLogoUrl ||
    `https://placehold.co/64x64.png?text=${job.company?.substring(0, 2).toUpperCase() || 'C'}`;
  const salaryDisplay =
    job.salaryMin && job.salaryMax
      ? `${formatCurrencyINR(job.salaryMin)} - ${formatCurrencyINR(job.salaryMax)} p.a.`
      : job.salaryMin
        ? `${formatCurrencyINR(job.salaryMin)} p.a.`
        : job.salaryMax
          ? `${formatCurrencyINR(job.salaryMax)} p.a.`
          : 'Not Disclosed';

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
          {(job.salaryMin || job.salaryMax) && (
            <p className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-primary/80" /> {salaryDisplay}
            </p>
          )}
        </div>
        <p className="text-sm text-foreground/90 line-clamp-3">
          {job.description}
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
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          Posted:{' '}
          {job.postedDate
            ? typeof job.postedDate === 'string'
              ? new Date(job.postedDate).toLocaleDateString()
              : (job.postedDate as Timestamp).toDate().toLocaleDateString()
            : 'N/A'}
        </p>
        {showApplyButton && user?.role === 'jobSeeker' && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveToggle}
              aria-pressed={saved}
              aria-label={saved ? 'Unsave job' : 'Save job'}
              disabled={isJobSeekerSuspended}
            >
              <Bookmark
                className={`h-4 w-4 ${saved ? 'fill-primary text-primary' : ''}`}
              />
            </Button>
            {applied ? (
              <Button
                size="sm"
                disabled
                variant="outline"
                className="text-green-600 border-green-600"
              >
                <CheckCircle className="mr-1.5 h-4 w-4" /> Applied
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleApply}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isJobSeekerSuspended}
              >
                Apply Now <ExternalLink className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        {showApplyButton && !user && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={handleApply}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Apply Now <ExternalLink className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
