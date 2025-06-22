'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/Auth/AuthContext';
import type { Company, UserProfile, Job } from '@/types';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Users,
  Link as LinkIcon,
  Building,
  Loader2,
  Mail,
  ExternalLink,
  ShieldAlert,
  Edit,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { JobCard } from '@/components/JobCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { fetchCompanyAndRelatedData } from './_lib/actions';

export default function CompanyProfilePreviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [companyDetails, setCompanyDetails] = useState<Company | null>(null);
  const [recruiters, setRecruiters] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingRecruiters, setIsFetchingRecruiters] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast({
        title: 'Login Required',
        description:
          'Please log in as an employer to preview your company profile.',
        variant: 'destructive',
      });
      router.replace('/employer/login?redirect=/employer/profile/preview');
      return;
    }

    if (user.role !== 'employer' || !user.companyId) {
      const reason =
        'This preview is only available for employers associated with a company.';
      toast({
        title: 'Access Denied',
        description: reason,
        variant: 'destructive',
      });
      if (user.role === 'jobSeeker') router.replace('/jobs');
      else router.replace('/');
      setIsLoading(false);
      return;
    }
    fetchCompanyAndRelatedData({
      companyId: user.companyId,
      setCompanyDetails,
      setRecruiters,
      setJobs,
      setError,
      setIsLoading,
      setIsFetchingRecruiters,
    });
  }, [user, authLoading, router, toast]);

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading company profile preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Error Loading Preview</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button variant="link" asChild className="mt-2 block">
            <Link href="/profile">Go to My Profile</Link>
          </Button>
        </Alert>
      </div>
    );
  }

  if (!companyDetails) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-xl text-muted-foreground">
          Company details not available for preview. This might happen if your
          company profile is not yet set up or an error occurred.
        </p>
        <Button variant="link" asChild className="mt-2 block">
          <Link href="/profile">Go to My Profile</Link>
        </Button>
      </div>
    );
  }

  const company = companyDetails;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 p-4 border border-primary/30 bg-primary/5 rounded-lg text-center flex flex-col sm:flex-row justify-between items-center gap-3">
        <div>
          <p className="text-lg font-semibold text-primary">
            This is a preview of your Company&apos;s public profile.
          </p>
          <p className="text-sm text-muted-foreground">
            This is how job seekers and other users will see your company.
          </p>
        </div>
        <Button asChild variant="default" size="sm">
          <Link href="/profile">
            <Edit className="mr-2 h-4 w-4" /> Edit Company Profile
          </Link>
        </Button>
      </div>

      {company.bannerImageUrl ? (
        <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-lg overflow-hidden shadow-lg mb-[-50px] md:mb-[-75px] z-0">
          <Image
            src={company.bannerImageUrl}
            alt={`${company.name} banner`}
            fill
            style={{ objectFit: 'cover' }}
            priority
            data-ai-hint="company banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      ) : (
        <div className="w-full h-32 md:h-48 rounded-lg bg-muted flex items-center justify-center shadow-lg mb-4">
          <Building className="h-16 w-16 md:h-24 md:w-24 text-muted-foreground" />
        </div>
      )}

      <Card className="shadow-xl relative z-10 max-w-5xl mx-auto overflow-hidden">
        <CardHeader
          className={`p-6 ${company.bannerImageUrl ? 'pt-20 md:pt-24' : 'pt-6'} text-center bg-card`}
        >
          <div className="flex flex-col items-center gap-4 -mt-16 md:-mt-20">
            {company.logoUrl ? (
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-md bg-background">
                <AvatarImage
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  data-ai-hint="company logo"
                  className="object-contain"
                />
                <AvatarFallback className="text-3xl md:text-4xl">
                  {company.name?.[0]?.toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-md">
                <Building className="h-12 w-12 md:h-16 md:w-16 text-primary" />
              </div>
            )}
            <div className="mt-2">
              <CardTitle className="text-3xl md:text-4xl font-bold font-headline text-primary">
                {company.name}
              </CardTitle>
              {company.websiteUrl && (
                <a
                  href={
                    company.websiteUrl.startsWith('http')
                      ? company.websiteUrl
                      : `https://${company.websiteUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 mt-1"
                >
                  <LinkIcon className="h-3.5 w-3.5" /> Visit Website{' '}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {company.description && (
            <section>
              <h2 className="text-2xl font-semibold mb-3 font-headline text-center md:text-left">
                About Us
              </h2>
              <div className="prose prose-sm md:prose-base max-w-none text-foreground/90 whitespace-pre-wrap p-4 border rounded-md bg-background shadow-inner">
                {company.description}
              </div>
            </section>
          )}
          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4 font-headline text-center md:text-left">
              Our Recruiters ({recruiters.length})
            </h2>
            {isFetchingRecruiters ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((idx) => (
                  <Card key={idx} className="text-center p-4 shadow-sm">
                    <Skeleton className="h-20 w-20 rounded-full mx-auto mb-3" />
                    <Skeleton className="h-5 w-3/4 mx-auto mb-1" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </Card>
                ))}
              </div>
            ) : recruiters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recruiters.map((recruiter) => (
                  <Card
                    key={recruiter.uid}
                    className="text-center p-4 shadow-sm hover:shadow-md transition-shadow bg-card hover:border-primary/50"
                  >
                    <Avatar className="h-20 w-20 mx-auto mb-3 border-2 border-primary/30">
                      <AvatarImage
                        src={
                          recruiter.avatarUrl ||
                          `https://placehold.co/80x80.png`
                        }
                        alt={recruiter.name}
                        data-ai-hint="recruiter headshot"
                      />
                      <AvatarFallback className="text-2xl">
                        {recruiter.name?.[0]?.toUpperCase() || 'R'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-foreground">
                      {recruiter.name}
                    </p>
                    {recruiter.email && (
                      <a
                        href={`mailto:${recruiter.email}`}
                        className="text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1"
                      >
                        <Mail className="h-3 w-3" /> Contact
                      </a>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border rounded-md bg-muted/30">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No recruiters listed for this company yet.
                </p>
              </div>
            )}
          </section>
          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-6 font-headline text-center md:text-left">
              Open Positions ({jobs.length})
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((idx) => (
                  <Card key={idx} className="shadow-sm flex flex-col h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-3/4 rounded" />
                          <Skeleton className="h-4 w-1/2 rounded" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-4 flex-grow">
                      <Skeleton className="h-4 w-full rounded" />
                      <Skeleton className="h-4 w-5/6 rounded" />
                    </CardContent>
                    <CardFooter className="pt-4 border-t">
                      <div className="flex justify-between items-center w-full">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-8 w-20 rounded-md" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border rounded-md bg-muted/30">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  This company currently has no approved open positions listed
                  on JobBoardly.
                </p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/employer/post-job">Post a Job</Link>
                </Button>
              </div>
            )}
          </section>
        </CardContent>
        <CardFooter className="p-6 border-t bg-muted/20 rounded-b-lg">
          <p className="text-xs text-muted-foreground text-center w-full">
            Company Profile Status:{' '}
            <span className="font-semibold">
              {company.status.toUpperCase()}
            </span>
            {company.status === 'pending' && ' (Awaiting admin approval)'}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
