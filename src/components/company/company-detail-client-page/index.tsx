// src/components/company/company-detail-client-page/index.tsx
'use client';
import React, { useEffect, useState } from 'react';
import type { Company, UserProfile, Job, UserRole } from '@/types';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
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
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { JobCard } from '@/components/JobCard';
import Link from 'next/link';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ADMIN_LIKE_ROLES_COMPANY_PAGE } from './_lib/constants';

type Props = {
  initialCompanyData: Company | null;
  initialRecruitersData: UserProfile[];
  initialJobsData: Job[];
};

export default function CompanyDetailClientPage({
  initialCompanyData,
  initialRecruitersData,
  initialJobsData,
}: Props) {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(initialCompanyData);
  const [recruiters] = useState<UserProfile[]>(initialRecruitersData);
  const [jobs] = useState<Job[]>(initialJobsData);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!company) {
      return;
    }

    const isPrivilegedViewer =
      user &&
      (ADMIN_LIKE_ROLES_COMPANY_PAGE.includes(user.role as UserRole) ||
        (user.role === 'employer' && user.companyId === company.id));

    if (company.status !== 'approved' && !isPrivilegedViewer) {
      setAccessDeniedReason(
        'This company profile is currently under review or not publicly visible.'
      );
      setCompany(null);
    }
  }, [company, user, authLoading]);

  useEffect(() => {
    if (accessDeniedReason && !authLoading) {
      toast({
        title: 'Access Denied',
        description: accessDeniedReason,
        variant: 'destructive',
      });
      if (user) {
        if (user.role === 'jobSeeker') router.replace('/companies');
        else if (user.role === 'employer')
          router.replace('/employer/posted-jobs');
        else if (ADMIN_LIKE_ROLES_COMPANY_PAGE.includes(user.role as UserRole))
          router.replace('/admin');
        else router.replace('/');
      } else {
        router.replace('/companies');
      }
    }
  }, [accessDeniedReason, authLoading, user, router, toast]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading company profile...</p>
      </div>
    );
  }

  if (accessDeniedReason && !authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Redirecting...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Company Not Found</AlertTitle>
          <AlertDescription>
            The company profile you are looking for does not exist or is not
            available.
          </AlertDescription>
          <Button variant="link" asChild className="mt-2 block">
            <Link href="/companies">Browse other companies</Link>
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
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
                  alt={`${company.name} company logo`}
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
              <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">
                {company.name}
              </h1>
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
            {recruiters.length > 0 ? (
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
                        alt={`${recruiter.name}, recruiter at ${company.name}`}
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
                  No recruiters publicly listed for this company yet.
                </p>
              </div>
            )}
          </section>
          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-6 font-headline text-center md:text-left">
              Open Positions at {company.name}
            </h2>
            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border rounded-md bg-muted/30">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {company.name} currently has no open positions listed on
                  JobBoardly.
                </p>
              </div>
            )}
          </section>
        </CardContent>
        <CardFooter className="p-6 border-t bg-muted/20 rounded-b-lg">
          <p className="text-xs text-muted-foreground text-center w-full">
            Joined JobBoardly on:{' '}
            {company.createdAt
              ? new Date(company.createdAt as string).toLocaleDateString()
              : 'N/A'}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
