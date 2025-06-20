'use client'; // This component handles client-side logic
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  doc,
  getDoc,
  collection,
  query as firestoreQuery, // Renamed to avoid conflict with React.query
  where,
  getDocs,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { JobCard } from '@/components/JobCard';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  params: { companyId: string };
};

export default function CompanyDetailClientPage({ params }: Props) {
  const companyId = params.companyId as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [recruiters, setRecruiters] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [isCompanyDataLoading, setIsCompanyDataLoading] = useState(true);
  const [areRecruitersLoading, setAreRecruitersLoading] = useState(true);
  const [areJobsLoading, setAreJobsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setError('No Company ID provided.');
      setIsCompanyDataLoading(false);
      setAreRecruitersLoading(false);
      setAreJobsLoading(false);
      return;
    }

    const fetchCompanyCoreDetails = async () => {
      setIsCompanyDataLoading(true);
      setError(null);
      setCompany(null);
      setRecruiters([]);
      setJobs([]);
      setAreRecruitersLoading(true); // Reset dependent loading states
      setAreJobsLoading(true); // Reset dependent loading states

      try {
        const companyDocRef = doc(db, 'companies', companyId);
        const companyDocSnap = await getDoc(companyDocRef);

        if (!companyDocSnap.exists()) {
          setError('Company not found or is not currently visible.');
          setCompany(null);
        } else {
          const companyDataFromDb = companyDocSnap.data() as Omit<
            Company,
            'id'
          >;
          if (companyDataFromDb.status !== 'approved') {
            setError(
              'This company profile is currently under review or not publicly visible.'
            );
            setCompany(null);
          } else {
            const processedCompanyData: Company = {
              id: companyDocSnap.id,
              ...companyDataFromDb,
              createdAt:
                companyDataFromDb.createdAt instanceof Timestamp
                  ? companyDataFromDb.createdAt.toDate().toISOString()
                  : companyDataFromDb.createdAt,
              updatedAt:
                companyDataFromDb.updatedAt instanceof Timestamp
                  ? companyDataFromDb.updatedAt.toDate().toISOString()
                  : companyDataFromDb.updatedAt,
            };
            setCompany(processedCompanyData);
          }
        }
      } catch (e: unknown) {
        console.error('Error fetching company core details:', e);
        setError(
          `Failed to load company details. Error: ${(e as Error).message}`
        );
        setCompany(null);
      } finally {
        setIsCompanyDataLoading(false);
      }
    };

    fetchCompanyCoreDetails();
  }, [companyId]);

  useEffect(() => {
    if (
      !company ||
      !company.id ||
      !company.recruiterUids ||
      company.recruiterUids.length === 0
    ) {
      setRecruiters([]);
      setAreRecruitersLoading(false);
      return;
    }

    const fetchRecruitersForCompany = async () => {
      setAreRecruitersLoading(true);
      try {
        const recruitersQueryLimit = 30;
        const fetchedRecruiters: UserProfile[] = [];
        for (
          let i = 0;
          i < company.recruiterUids.length;
          i += recruitersQueryLimit
        ) {
          const batchUids = company.recruiterUids.slice(
            i,
            i + recruitersQueryLimit
          );
          if (batchUids.length > 0) {
            const recruitersQuery = firestoreQuery(
              collection(db, 'users'),
              where('__name__', 'in', batchUids)
            );
            const recruitersSnap = await getDocs(recruitersQuery);
            recruitersSnap.docs.forEach((d) =>
              fetchedRecruiters.push({ uid: d.id, ...d.data() } as UserProfile)
            );
          }
        }
        setRecruiters(fetchedRecruiters);
      } catch (e: unknown) {
        console.error('Error fetching recruiters for company:', e);
        setRecruiters([]);
      } finally {
        setAreRecruitersLoading(false);
      }
    };

    fetchRecruitersForCompany();
  }, [company]);

  useEffect(() => {
    if (!company || !company.id) {
      setJobs([]);
      setAreJobsLoading(false);
      return;
    }

    const fetchJobsForCompany = async () => {
      setAreJobsLoading(true);
      try {
        const jobsQuery = firestoreQuery(
          collection(db, 'jobs'),
          where('companyId', '==', company.id),
          where('status', '==', 'approved'),
          orderBy('postedDate', 'desc')
        );
        const jobsSnap = await getDocs(jobsQuery);
        const fetchedJobs = jobsSnap.docs.map((d) => {
          const jobData = d.data();
          return {
            id: d.id,
            ...jobData,
            postedDate:
              jobData.postedDate instanceof Timestamp
                ? jobData.postedDate.toDate().toISOString().split('T')[0]
                : jobData.postedDate,
            createdAt:
              jobData.createdAt instanceof Timestamp
                ? jobData.createdAt.toDate().toISOString()
                : jobData.createdAt,
            updatedAt:
              jobData.updatedAt instanceof Timestamp
                ? jobData.updatedAt.toDate().toISOString()
                : jobData.updatedAt,
          } as Job;
        });
        setJobs(fetchedJobs);
      } catch (e: unknown) {
        console.error('Error fetching jobs for company:', e);
        setJobs([]);
      } finally {
        setAreJobsLoading(false);
      }
    };

    fetchJobsForCompany();
  }, [company]);

  if (isCompanyDataLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading company profile...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{error ? 'Error' : 'Profile Unavailable'}</AlertTitle>
          <AlertDescription>
            {error || 'This company profile is not currently available.'}
            <Button variant="link" asChild className="mt-2 block">
              <Link href="/companies">Browse other companies</Link>
            </Button>
          </AlertDescription>
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
            alt={`${company.name} corporate banner image`}
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
                About {company.name}
              </h2>
              <div className="prose prose-sm md:prose-base max-w-none text-foreground/90 whitespace-pre-wrap p-4 border rounded-md bg-background shadow-inner">
                {company.description}
              </div>
            </section>
          )}
          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4 font-headline text-center md:text-left">
              Our Recruiters
            </h2>
            {areRecruitersLoading ? (
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
            {areJobsLoading ? (
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
                  {company.name} currently has no approved open positions listed
                  on JobBoardly.
                </p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/jobs">Explore other jobs</Link>
                </Button>
              </div>
            )}
          </section>
        </CardContent>
        <CardFooter className="p-6 border-t bg-muted/20 rounded-b-lg">
          <p className="text-xs text-muted-foreground text-center w-full">
            Joined JobBoardly on:{' '}
            {company.createdAt
              ? typeof company.createdAt === 'string'
                ? new Date(company.createdAt).toLocaleDateString()
                : (company.createdAt as Timestamp)
                    ?.toDate()
                    .toLocaleDateString()
              : 'N/A'}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
