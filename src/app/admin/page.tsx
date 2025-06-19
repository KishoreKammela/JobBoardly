
'use client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Briefcase,
  Building,
  Eye,
  ChevronsUpDown,
  ExternalLink,
  Ban,
  CheckSquare,
  Edit3,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  orderBy,
  serverTimestamp,
  getCountFromServer,
} from 'firebase/firestore';
import type { Job, UserProfile, Company } from '@/types';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 10;

type SortDirection = 'asc' | 'desc';

interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

interface JobWithApplicantCount extends Job {
  applicantCount: number;
}

function getSortableValue<T>(
  item: T,
  key: keyof T | null
): string | number | null | boolean {
  if (!key) return null;
  const value = item[key as keyof T]; // Type assertion for safety
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  return value as string | number | null | boolean;
}

export default function AdminPage() {
  const {
    user,
    loading,
    updateUserProfile: updateUserProfileInAuthContext,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);

  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [allJobSeekers, setAllJobSeekers] = useState<UserProfile[]>([]);
  const [allPlatformUsers, setAllPlatformUsers] = useState<UserProfile[]>([]);
  const [allJobs, setAllJobs] = useState<JobWithApplicantCount[]>([]);

  const [companiesSearchTerm, setCompaniesSearchTerm] = useState('');
  const [jobSeekersSearchTerm, setJobSeekersSearchTerm] = useState('');
  const [platformUsersSearchTerm, setPlatformUsersSearchTerm] = useState('');
  const [jobsSearchTerm, setJobsSearchTerm] = useState('');

  const debouncedCompaniesSearchTerm = useDebounce(companiesSearchTerm, 300);
  const debouncedJobSeekersSearchTerm = useDebounce(jobSeekersSearchTerm, 300);
  const debouncedPlatformUsersSearchTerm = useDebounce(
    platformUsersSearchTerm,
    300
  );
  const debouncedJobsSearchTerm = useDebounce(jobsSearchTerm, 300);

  const [companiesCurrentPage, setCompaniesCurrentPage] = useState(1);
  const [jobSeekersCurrentPage, setJobSeekersCurrentPage] = useState(1);
  const [platformUsersCurrentPage, setPlatformUsersCurrentPage] = useState(1);
  const [jobsCurrentPage, setJobsCurrentPage] = useState(1);

  const [companiesSortConfig, setCompaniesSortConfig] = useState<
    SortConfig<Company>
  >({ key: 'createdAt', direction: 'desc' });
  const [jobSeekersSortConfig, setJobSeekersSortConfig] = useState<
    SortConfig<UserProfile>
  >({ key: 'createdAt', direction: 'desc' });
  const [platformUsersSortConfig, setPlatformUsersSortConfig] = useState<
    SortConfig<UserProfile>
  >({ key: 'createdAt', direction: 'desc' });
  const [jobsSortConfig, setJobsSortConfig] = useState<
    SortConfig<JobWithApplicantCount>
  >({ key: 'createdAt', direction: 'desc' });

  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [isCompaniesLoading, setIsCompaniesLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isAllJobsLoading, setIsAllJobsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsJobsLoading(true);
    setIsCompaniesLoading(true);
    setIsUsersLoading(true);
    setIsAllJobsLoading(true);

    try {
      // Fetch pending jobs (for approval card)
      const pendingJobsQuery = query(
        collection(db, 'jobs'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const pendingJobsSnapshot = await getDocs(pendingJobsQuery);
      setPendingJobs(
        pendingJobsSnapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
          } as Job;
        })
      );
      setIsJobsLoading(false);

      // Fetch pending companies (for approval card)
      const pendingCompaniesQuery = query(
        collection(db, 'companies'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const pendingCompaniesSnapshot = await getDocs(pendingCompaniesQuery);
      setPendingCompanies(
        pendingCompaniesSnapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
          } as Company;
        })
      );

      // Fetch all companies (for manage companies tab)
      const allCompaniesQuery = query(
        collection(db, 'companies'),
        orderBy('createdAt', 'desc')
      );
      const allCompaniesSnapshot = await getDocs(allCompaniesQuery);
      const companiesData = await Promise.all(
        allCompaniesSnapshot.docs.map(async (companyDoc) => {
          const company = {
            id: companyDoc.id,
            ...companyDoc.data(),
          } as Company;
          company.jobCount = (
            await getCountFromServer(
              query(
                collection(db, 'jobs'),
                where('companyId', '==', company.id)
              )
            )
          ).data().count;
          company.applicationCount = (
            await getCountFromServer(
              query(
                collection(db, 'applications'),
                where('companyId', '==', company.id)
              )
            )
          ).data().count;
          company.createdAt = (company.createdAt as Timestamp)
            ?.toDate()
            .toISOString();
          return company;
        })
      );
      setAllCompanies(companiesData);
      setIsCompaniesLoading(false);

      // Fetch all job seekers
      const jobSeekersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'jobSeeker'),
        orderBy('createdAt', 'desc')
      );
      const jobSeekersSnapshot = await getDocs(jobSeekersQuery);
      setAllJobSeekers(
        jobSeekersSnapshot.docs.map((d) => {
          const data = d.data();
          return {
            uid: d.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            lastActive: (data.lastActive as Timestamp)?.toDate().toISOString(),
            jobsAppliedCount: (data.appliedJobIds || []).length,
          } as UserProfile;
        })
      );

      // Fetch all platform users (admins/superAdmins)
      const platformUsersQuery = query(
        collection(db, 'users'),
        where('role', 'in', ['admin', 'superAdmin']),
        orderBy('createdAt', 'desc')
      );
      const platformUsersSnapshot = await getDocs(platformUsersQuery);
      setAllPlatformUsers(
        platformUsersSnapshot.docs.map((d) => {
          const data = d.data();
          return {
            uid: d.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            lastActive: (data.lastActive as Timestamp)?.toDate().toISOString(),
          } as UserProfile;
        })
      );
      setIsUsersLoading(false);

      // Fetch all jobs (for manage all jobs tab)
      const allJobsQuery = query(
        collection(db, 'jobs'),
        orderBy('createdAt', 'desc')
      );
      const allJobsSnapshot = await getDocs(allJobsQuery);
      const jobsData = await Promise.all(
        allJobsSnapshot.docs.map(async (jobDoc) => {
          const job = {
            id: jobDoc.id,
            ...jobDoc.data(),
          } as Job;
          const applicantCount = (
            await getCountFromServer(
              query(
                collection(db, 'applications'),
                where('jobId', '==', job.id)
              )
            )
          ).data().count;
          return {
            ...job,
            applicantCount,
            createdAt: (job.createdAt as Timestamp)?.toDate().toISOString(),
            updatedAt: (job.updatedAt as Timestamp)?.toDate().toISOString(),
          } as JobWithApplicantCount;
        })
      );
      setAllJobs(jobsData);
      setIsAllJobsLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: `Failed to load some admin data. ${(error as Error).message}`,
        variant: 'destructive',
      });
      setIsJobsLoading(false);
      setIsCompaniesLoading(false);
      setIsUsersLoading(false);
      setIsAllJobsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(
        `/auth/admin/login?redirect=${encodeURIComponent(pathname)}`
      );
    } else if (user.role !== 'admin' && user.role !== 'superAdmin') {
      router.replace(
        user.role === 'jobSeeker'
          ? '/jobs'
          : user.role === 'employer'
            ? '/employer/posted-jobs'
            : '/'
      );
    } else {
      fetchData();
    }
  }, [user, loading, router, pathname, fetchData]);

  const handleJobStatusUpdate = async (
    jobId: string,
    newStatus: 'approved' | 'rejected' | 'suspended',
    reason?: string
  ) => {
    setActionLoading(`job-${jobId}`);
    try {
      const jobUpdates: { [key: string]: unknown } = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };
      if (
        newStatus === 'rejected' ||
        newStatus === 'suspended' ||
        (newStatus === 'approved' && reason) // reason might be for approval context from pending
      ) {
        jobUpdates.moderationReason =
          reason || `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} by admin`;
      } else {
        jobUpdates.moderationReason = null;
      }

      await updateDoc(doc(db, 'jobs', jobId), jobUpdates);

      // Update pending jobs list
      if (newStatus === 'approved' || newStatus === 'rejected') {
        setPendingJobs((prev) => prev.filter((job) => job.id !== jobId));
      }

      // Update all jobs list
      setAllJobs((prevJobs) =>
        prevJobs.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: newStatus,
                moderationReason: jobUpdates.moderationReason as string,
              }
            : j
        )
      );

      toast({
        title: 'Success',
        description: `Job ${jobId} status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error(`Error updating job ${jobId}:`, error);
      toast({
        title: 'Error',
        description: `Failed to update job ${jobId}. Error: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompanyStatusUpdate = async (
    companyId: string,
    newStatus: 'approved' | 'rejected' | 'suspended' | 'active',
    reason?: string
  ) => {
    setActionLoading(`company-${companyId}`);
    try {
      const companyDocRef = doc(db, 'companies', companyId);
      const updateData: { [key: string]: unknown } = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };
      if (
        newStatus === 'rejected' ||
        newStatus === 'suspended' ||
        (newStatus === 'approved' && reason)
      ) {
        updateData.moderationReason =
          reason ||
          `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} by admin`;
      } else {
        updateData.moderationReason = null;
      }

      await updateDoc(companyDocRef, updateData);

      setAllCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId
            ? {
                ...c,
                status: newStatus,
                moderationReason: updateData.moderationReason as string,
              }
            : c
        )
      );
      if (newStatus === 'approved' || newStatus === 'rejected') {
        setPendingCompanies((prev) => prev.filter((c) => c.id !== companyId));
      }

      toast({
        title: 'Success',
        description: `Company ${companyId} status updated to ${newStatus}.`,
      });

      if (newStatus === 'suspended') {
        toast({
          title: 'Note',
          description: `Suspending associated recruiters must be done manually via User Management or via backend logic (not yet implemented).`,
          duration: 7000,
        });
      }
    } catch (error) {
      console.error(`Error updating company ${companyId}:`, error);
      toast({
        title: 'Error',
        description: `Failed to update company ${companyId}. Error: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserStatusUpdate = async (
    userId: string,
    newStatus: 'active' | 'suspended'
  ) => {
    if (user?.role !== 'admin' && user?.role !== 'superAdmin') return;
    const targetUser = [...allJobSeekers, ...allPlatformUsers].find(
      (u) => u.uid === userId
    );

    if (!targetUser) {
      toast({
        title: 'Error',
        description: 'User not found.',
        variant: 'destructive',
      });
      return;
    }

    if (user.uid === userId) {
      toast({
        title: 'Action Denied',
        description: 'You cannot change your own status.',
        variant: 'destructive',
      });
      return;
    }
    if (
      user.role === 'admin' &&
      (targetUser.role === 'admin' || targetUser.role === 'superAdmin')
    ) {
      toast({
        title: 'Action Denied',
        description: 'Admins cannot suspend other Admins or SuperAdmins.',
        variant: 'destructive',
      });
      return;
    }
    if (targetUser.role === 'superAdmin' && user.role !== 'superAdmin') {
      toast({
        title: 'Action Denied',
        description: 'Only SuperAdmins can manage other SuperAdmins.',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(`user-${userId}`);
    try {
      await updateUserProfileInAuthContext({ uid: userId, status: newStatus });
      if (targetUser.role === 'jobSeeker') {
        setAllJobSeekers((prev) =>
          prev.map((u) => (u.uid === userId ? { ...u, status: newStatus } : u))
        );
      } else {
        setAllPlatformUsers((prev) =>
          prev.map((u) => (u.uid === userId ? { ...u, status: newStatus } : u))
        );
      }
      toast({
        title: 'Success',
        description: `User ${userId} status updated to ${newStatus}.`,
      });
    } catch (e) {
      console.error('Error updating user status:', e);
      toast({
        title: 'Error',
        description: `Failed to update user status. Error: ${(e as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const requestSort = <T,>(
    key: keyof T,
    config: SortConfig<T>,
    setConfig: React.Dispatch<React.SetStateAction<SortConfig<T>>>
  ) => {
    let direction: SortDirection = 'asc';
    if (config.key === key && config.direction === 'asc') {
      direction = 'desc';
    }
    setConfig({ key, direction });
  };

  const useSortedItems = <T,>(
    items: T[],
    config: SortConfig<T>,
    searchTerm: string,
    searchKeys: (keyof T)[]
  ) => {
    return useMemo(() => {
      let sortableItems = [...items];
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        sortableItems = sortableItems.filter((item) =>
          searchKeys.some((key) => {
            const value = item[key];
            return (
              typeof value === 'string' &&
              value.toLowerCase().includes(lowerSearchTerm)
            );
          })
        );
      }
      if (config.key !== null) {
        sortableItems.sort((a, b) => {
          const valA = getSortableValue(a, config.key);
          const valB = getSortableValue(b, config.key);
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          if (valA < valB) return config.direction === 'asc' ? -1 : 1;
          if (valA > valB) return config.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
      return sortableItems;
    }, [items, config, searchTerm, searchKeys]);
  };

  const sortedCompanies = useSortedItems(
    allCompanies,
    companiesSortConfig,
    debouncedCompaniesSearchTerm,
    ['name', 'websiteUrl']
  );
  const sortedJobSeekers = useSortedItems(
    allJobSeekers,
    jobSeekersSortConfig,
    debouncedJobSeekersSearchTerm,
    ['name', 'email']
  );
  const sortedPlatformUsers = useSortedItems(
    allPlatformUsers,
    platformUsersSortConfig,
    debouncedPlatformUsersSearchTerm,
    ['name', 'email']
  );
  const sortedJobs = useSortedItems(
    allJobs,
    jobsSortConfig,
    debouncedJobsSearchTerm,
    ['title', 'company']
  );

  const usePaginatedItems = <T,>(items: T[], currentPage: number) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const paginatedCompanies = usePaginatedItems(
    sortedCompanies,
    companiesCurrentPage
  );
  const paginatedJobSeekers = usePaginatedItems(
    sortedJobSeekers,
    jobSeekersCurrentPage
  );
  const paginatedPlatformUsers = usePaginatedItems(
    sortedPlatformUsers,
    platformUsersCurrentPage
  );
  const paginatedJobs = usePaginatedItems(sortedJobs, jobsCurrentPage);

  const totalCompaniesPages = Math.ceil(
    sortedCompanies.length / ITEMS_PER_PAGE
  );
  const totalJobSeekersPages = Math.ceil(
    sortedJobSeekers.length / ITEMS_PER_PAGE
  );
  const totalPlatformUsersPages = Math.ceil(
    sortedPlatformUsers.length / ITEMS_PER_PAGE
  );
  const totalJobsPages = Math.ceil(sortedJobs.length / ITEMS_PER_PAGE);

  const renderSortIcon = <T,>(key: keyof T, config: SortConfig<T>) => {
    if (config.key !== key)
      return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return config.direction === 'asc' ? '🔼' : '🔽';
  };

  if (loading || (!user && !loading)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  if (user && user.role !== 'admin' && user.role !== 'superAdmin') {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. Redirecting...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage platform users, jobs, and companies.{' '}
            {user?.role === 'superAdmin' && (
              <Badge variant="destructive" className="ml-2">
                Super Admin
              </Badge>
            )}
          </p>
        </div>
      </div>
      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase /> Pending Job Approvals ({pendingJobs.length})
            </CardTitle>
            <CardDescription>
              Review and approve or reject newly posted jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isJobsLoading ? (
              <div className="flex items-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />{' '}
                Loading...
              </div>
            ) : pendingJobs.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Pending Jobs</AlertTitle>
                <AlertDescription>
                  No job postings awaiting approval.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {pendingJobs.map((job) => (
                  <Card key={job.id} className="shadow-sm">
                    <CardHeader className="pb-2">
                      <Link
                        href={`/jobs/${job.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary hover:underline"
                      >
                        <CardTitle className="text-md">{job.title}</CardTitle>
                      </Link>
                      <CardDescription className="text-xs">
                        Company: {job.company} | Posted:{' '}
                        {new Date(job.createdAt as string).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleJobStatusUpdate(job.id, 'rejected')
                        }
                        disabled={actionLoading === `job-${job.id}`}
                        aria-label={`Reject job ${job.title}`}
                        className="text-destructive"
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleJobStatusUpdate(job.id, 'approved')
                        }
                        disabled={actionLoading === `job-${job.id}`}
                        aria-label={`Approve job ${job.title}`}
                        className="text-green-600"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building /> Pending Company Approvals ({pendingCompanies.length})
            </CardTitle>
            <CardDescription>
              Review and approve or reject new company profiles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCompaniesLoading ? (
              <div className="flex items-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />{' '}
                Loading...
              </div>
            ) : pendingCompanies.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Pending Companies</AlertTitle>
                <AlertDescription>
                  No new company profiles awaiting approval.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {pendingCompanies.map((c) => (
                  <Card key={c.id} className="shadow-sm">
                    <CardHeader className="pb-2">
                      <Link
                        href={`/companies/${c.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary hover:underline"
                      >
                        <CardTitle className="text-md">{c.name}</CardTitle>
                      </Link>
                      <CardDescription className="text-xs">
                        Registered:{' '}
                        {new Date(c.createdAt as string).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleCompanyStatusUpdate(c.id, 'rejected')
                        }
                        disabled={actionLoading === `company-${c.id}`}
                        aria-label={`Reject company ${c.name}`}
                        className="text-destructive"
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleCompanyStatusUpdate(c.id, 'approved')
                        }
                        disabled={actionLoading === `company-${c.id}`}
                        aria-label={`Approve company ${c.name}`}
                        className="text-green-600"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="companies">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="allJobs">All Jobs</TabsTrigger>
          <TabsTrigger value="jobSeekers">Job Seekers</TabsTrigger>
          <TabsTrigger value="platformUsers">Platform Users</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Manage Companies ({sortedCompanies.length})</CardTitle>
              <Input
                placeholder="Search companies by name or website..."
                value={companiesSearchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCompaniesSearchTerm(e.target.value)
                }
                className="max-w-sm mt-2"
                aria-label="Search companies"
              />
            </CardHeader>
            <CardContent>
              {isCompaniesLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />{' '}
                  Loading companies...
                </div>
              ) : paginatedCompanies.length === 0 ? (
                <p className="text-muted-foreground">No companies found.</p>
              ) : (
                <>
                  <Table>
                    <TableCaption>A list of all companies.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'name',
                              companiesSortConfig,
                              setCompaniesSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by company name"
                        >
                          Name {renderSortIcon('name', companiesSortConfig)}
                        </TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'status',
                              companiesSortConfig,
                              setCompaniesSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by company status"
                        >
                          Status {renderSortIcon('status', companiesSortConfig)}
                        </TableHead>
                        <TableHead>Jobs Posted</TableHead>
                        <TableHead>Apps Received</TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'createdAt',
                              companiesSortConfig,
                              setCompaniesSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by company creation date"
                        >
                          Created At{' '}
                          {renderSortIcon('createdAt', companiesSortConfig)}
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCompanies.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">
                            {c.name}
                          </TableCell>
                          <TableCell>
                            <a
                              href={
                                c.websiteUrl?.startsWith('http')
                                  ? c.websiteUrl
                                  : `https://${c.websiteUrl}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {c.websiteUrl || 'N/A'}{' '}
                              {c.websiteUrl && (
                                <ExternalLink className="h-3 w-3" />
                              )}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                c.status === 'approved' || c.status === 'active'
                                  ? 'default'
                                  : c.status === 'rejected' ||
                                      c.status === 'suspended'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {c.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{c.jobCount ?? 'N/A'}</TableCell>
                          <TableCell>{c.applicationCount ?? 'N/A'}</TableCell>
                          <TableCell>
                            {c.createdAt
                              ? new Date(
                                  c.createdAt as string
                                ).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              aria-label={`View company ${c.name}`}
                            >
                              <Link
                                href={`/companies/${c.id}`}
                                target="_blank"
                              >
                                <Eye className="h-5 w-5" />
                              </Link>
                            </Button>
                            {c.status !== 'approved' &&
                              c.status !== 'active' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleCompanyStatusUpdate(c.id, 'approved')
                                  }
                                  disabled={actionLoading === `company-${c.id}`}
                                  aria-label={`Approve company ${c.name}`}
                                  className="text-green-600"
                                >
                                  <CheckCircle2 className="h-5 w-5" />
                                </Button>
                              )}
                            {c.status !== 'rejected' &&
                              c.status !== 'pending' && ( // Can't reject if pending from here, use main card
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleCompanyStatusUpdate(c.id, 'rejected')
                                  }
                                  disabled={actionLoading === `company-${c.id}`}
                                  aria-label={`Reject company ${c.name}`}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-5 w-5" />
                                </Button>
                              )}
                            {c.status !== 'suspended' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleCompanyStatusUpdate(c.id, 'suspended')
                                }
                                disabled={actionLoading === `company-${c.id}`}
                                aria-label={`Suspend company ${c.name}`}
                                className="text-orange-600"
                              >
                                <Ban className="h-5 w-5" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleCompanyStatusUpdate(c.id, 'active')
                                }
                                disabled={actionLoading === `company-${c.id}`}
                                aria-label={`Activate company ${c.name}`}
                                className="text-blue-600"
                              >
                                <CheckSquare className="h-5 w-5" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalCompaniesPages > 1 && (
                    <div className="mt-4 flex justify-center items-center gap-2">
                      <Button
                        onClick={() =>
                          setCompaniesCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={companiesCurrentPage === 1}
                        variant="outline"
                        aria-label="Previous page of companies"
                      >
                        Previous
                      </Button>
                      <span>
                        Page {companiesCurrentPage} of {totalCompaniesPages}
                      </span>
                      <Button
                        onClick={() =>
                          setCompaniesCurrentPage((p) =>
                            Math.min(totalCompaniesPages, p + 1)
                          )
                        }
                        disabled={companiesCurrentPage === totalCompaniesPages}
                        variant="outline"
                        aria-label="Next page of companies"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allJobs">
          <Card>
            <CardHeader>
              <CardTitle>Manage All Jobs ({sortedJobs.length})</CardTitle>
              <Input
                placeholder="Search jobs by title or company..."
                value={jobsSearchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setJobsSearchTerm(e.target.value)
                }
                className="max-w-sm mt-2"
                aria-label="Search all jobs"
              />
            </CardHeader>
            <CardContent>
              {isAllJobsLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />{' '}
                  Loading jobs...
                </div>
              ) : paginatedJobs.length === 0 ? (
                <p className="text-muted-foreground">No jobs found.</p>
              ) : (
                <>
                  <Table>
                    <TableCaption>A list of all jobs.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          onClick={() =>
                            requestSort('title', jobsSortConfig, setJobsSortConfig)
                          }
                          className="cursor-pointer"
                          aria-label="Sort by job title"
                        >
                          Job Title {renderSortIcon('title', jobsSortConfig)}
                        </TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'status',
                              jobsSortConfig,
                              setJobsSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by job status"
                        >
                          Status {renderSortIcon('status', jobsSortConfig)}
                        </TableHead>
                        <TableHead>Applicants</TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'createdAt',
                              jobsSortConfig,
                              setJobsSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by job creation date"
                        >
                          Created At{' '}
                          {renderSortIcon('createdAt', jobsSortConfig)}
                        </TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'updatedAt',
                              jobsSortConfig,
                              setJobsSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by job update date"
                        >
                          Updated At{' '}
                          {renderSortIcon('updatedAt', jobsSortConfig)}
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">
                            {job.title}
                          </TableCell>
                          <TableCell>{job.company}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                job.status === 'approved'
                                  ? 'default'
                                  : job.status === 'pending'
                                    ? 'secondary'
                                    : 'destructive'
                              }
                            >
                              {job.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{job.applicantCount}</TableCell>
                          <TableCell>
                            {job.createdAt
                              ? new Date(
                                  job.createdAt as string
                                ).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {job.updatedAt
                              ? new Date(
                                  job.updatedAt as string
                                ).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              aria-label={`View job ${job.title}`}
                            >
                              <Link href={`/jobs/${job.id}`} target="_blank">
                                <Eye className="h-5 w-5" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              aria-label={`Edit job ${job.title}`}
                            >
                              <Link href={`/employer/post-job?edit=${job.id}`}>
                                <Edit3 className="h-5 w-5" />
                              </Link>
                            </Button>
                            {job.status !== 'suspended' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleJobStatusUpdate(job.id, 'suspended')
                                }
                                disabled={actionLoading === `job-${job.id}`}
                                aria-label={`Suspend job ${job.title}`}
                                className="text-orange-600"
                              >
                                <Ban className="h-5 w-5" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleJobStatusUpdate(job.id, 'approved')
                                } // Activating sets to approved
                                disabled={actionLoading === `job-${job.id}`}
                                aria-label={`Activate job ${job.title}`}
                                className="text-blue-600"
                              >
                                <CheckSquare className="h-5 w-5" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalJobsPages > 1 && (
                    <div className="mt-4 flex justify-center items-center gap-2">
                      <Button
                        onClick={() =>
                          setJobsCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={jobsCurrentPage === 1}
                        variant="outline"
                        aria-label="Previous page of jobs"
                      >
                        Previous
                      </Button>
                      <span>
                        Page {jobsCurrentPage} of {totalJobsPages}
                      </span>
                      <Button
                        onClick={() =>
                          setJobsCurrentPage((p) =>
                            Math.min(totalJobsPages, p + 1)
                          )
                        }
                        disabled={jobsCurrentPage === totalJobsPages}
                        variant="outline"
                        aria-label="Next page of jobs"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobSeekers">
          <Card>
            <CardHeader>
              <CardTitle>
                Manage Job Seekers ({sortedJobSeekers.length})
              </CardTitle>
              <Input
                placeholder="Search job seekers by name or email..."
                value={jobSeekersSearchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setJobSeekersSearchTerm(e.target.value)
                }
                className="max-w-sm mt-2"
                aria-label="Search job seekers"
              />
            </CardHeader>
            <CardContent>
              {isUsersLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />{' '}
                  Loading job seekers...
                </div>
              ) : paginatedJobSeekers.length === 0 ? (
                <p className="text-muted-foreground">No job seekers found.</p>
              ) : (
                <>
                  <Table>
                    <TableCaption>A list of all job seeker users.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'name',
                              jobSeekersSortConfig,
                              setJobSeekersSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by job seeker name"
                        >
                          Name {renderSortIcon('name', jobSeekersSortConfig)}
                        </TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'email',
                              jobSeekersSortConfig,
                              setJobSeekersSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by job seeker email"
                        >
                          Email {renderSortIcon('email', jobSeekersSortConfig)}
                        </TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'status',
                              jobSeekersSortConfig,
                              setJobSeekersSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by job seeker status"
                        >
                          Status{' '}
                          {renderSortIcon('status', jobSeekersSortConfig)}
                        </TableHead>
                        <TableHead>Profile Searchable</TableHead>
                        <TableHead>Jobs Applied</TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'lastActive',
                              jobSeekersSortConfig,
                              setJobSeekersSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by job seeker last active date"
                        >
                          Last Active{' '}
                          {renderSortIcon('lastActive', jobSeekersSortConfig)}
                        </TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'createdAt',
                              jobSeekersSortConfig,
                              setJobSeekersSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by job seeker joined date"
                        >
                          Joined{' '}
                          {renderSortIcon('createdAt', jobSeekersSortConfig)}
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedJobSeekers.map((u) => (
                        <TableRow key={u.uid}>
                          <TableCell className="font-medium">
                            {u.name || 'N/A'}
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                u.status === 'active'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className={
                                u.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {u.status?.toUpperCase() || 'ACTIVE'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {u.isProfileSearchable ? (
                              <CheckCircle2 className="text-green-500 h-5 w-5" />
                            ) : (
                              <XCircle className="text-red-500 h-5 w-5" />
                            )}
                          </TableCell>
                          <TableCell>{u.jobsAppliedCount ?? 'N/A'}</TableCell>
                          <TableCell>
                            {u.lastActive
                              ? new Date(
                                  u.lastActive as string
                                ).toLocaleString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {u.createdAt
                              ? new Date(
                                  u.createdAt as string
                                ).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link
                                href={`/employer/candidates/${u.uid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`View profile of ${u.name || 'user'}`}
                              >
                                <Eye className="h-5 w-5" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleUserStatusUpdate(
                                  u.uid,
                                  u.status === 'active' ? 'suspended' : 'active'
                                )
                              }
                              disabled={
                                actionLoading === `user-${u.uid}` ||
                                user?.uid === u.uid
                              }
                              aria-label={`${u.status === 'active' ? 'Suspend' : 'Activate'} user ${u.name || 'user'}`}
                              className={
                                u.status === 'active'
                                  ? 'text-orange-600'
                                  : 'text-blue-600'
                              }
                            >
                              {u.status === 'active' ? (
                                <Ban className="h-5 w-5" />
                              ) : (
                                <CheckSquare className="h-5 w-5" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalJobSeekersPages > 1 && (
                    <div className="mt-4 flex justify-center items-center gap-2">
                      <Button
                        onClick={() =>
                          setJobSeekersCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={jobSeekersCurrentPage === 1}
                        variant="outline"
                        aria-label="Previous page of job seekers"
                      >
                        Previous
                      </Button>
                      <span>
                        Page {jobSeekersCurrentPage} of {totalJobSeekersPages}
                      </span>
                      <Button
                        onClick={() =>
                          setJobSeekersCurrentPage((p) =>
                            Math.min(totalJobSeekersPages, p + 1)
                          )
                        }
                        disabled={
                          jobSeekersCurrentPage === totalJobSeekersPages
                        }
                        variant="outline"
                        aria-label="Next page of job seekers"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platformUsers">
          <Card>
            <CardHeader>
              <CardTitle>
                Manage Platform Users ({sortedPlatformUsers.length})
              </CardTitle>
              <Input
                placeholder="Search admins by name or email..."
                value={platformUsersSearchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPlatformUsersSearchTerm(e.target.value)
                }
                className="max-w-sm mt-2"
                aria-label="Search platform users"
              />
            </CardHeader>
            <CardContent>
              {isUsersLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />{' '}
                  Loading platform users...
                </div>
              ) : paginatedPlatformUsers.length === 0 ? (
                <p className="text-muted-foreground">
                  No platform users (Admins/SuperAdmins) found.
                </p>
              ) : (
                <>
                  <Table>
                    <TableCaption>
                      A list of platform administrators.
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'name',
                              platformUsersSortConfig,
                              setPlatformUsersSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by platform user name"
                        >
                          Name {renderSortIcon('name', platformUsersSortConfig)}
                        </TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'email',
                              platformUsersSortConfig,
                              setPlatformUsersSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by platform user email"
                        >
                          Email{' '}
                          {renderSortIcon('email', platformUsersSortConfig)}
                        </TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'role',
                              platformUsersSortConfig,
                              setPlatformUsersSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by platform user role"
                        >
                          Role {renderSortIcon('role', platformUsersSortConfig)}
                        </TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'status',
                              platformUsersSortConfig,
                              setPlatformUsersSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by platform user status"
                        >
                          Status{' '}
                          {renderSortIcon('status', platformUsersSortConfig)}
                        </TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'lastActive',
                              platformUsersSortConfig,
                              setPlatformUsersSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by platform user last active date"
                        >
                          Last Active{' '}
                          {renderSortIcon(
                            'lastActive',
                            platformUsersSortConfig
                          )}
                        </TableHead>
                        <TableHead
                          onClick={() =>
                            requestSort(
                              'createdAt',
                              platformUsersSortConfig,
                              setPlatformUsersSortConfig
                            )
                          }
                          className="cursor-pointer"
                          aria-label="Sort by platform user joined date"
                        >
                          Joined{' '}
                          {renderSortIcon('createdAt', platformUsersSortConfig)}
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPlatformUsers.map((u) => (
                        <TableRow key={u.uid}>
                          <TableCell className="font-medium">
                            {u.name || 'N/A'}
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                u.role === 'superAdmin'
                                  ? 'destructive'
                                  : 'default'
                              }
                            >
                              {u.role.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                u.status === 'active'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className={
                                u.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {u.status?.toUpperCase() || 'ACTIVE'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {u.lastActive
                              ? new Date(
                                  u.lastActive as string
                                ).toLocaleString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {u.createdAt
                              ? new Date(
                                  u.createdAt as string
                                ).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleUserStatusUpdate(
                                  u.uid,
                                  u.status === 'active' ? 'suspended' : 'active'
                                )
                              }
                              disabled={
                                actionLoading === `user-${u.uid}` ||
                                user?.uid === u.uid ||
                                (user?.role === 'admin' &&
                                  u.role === 'superAdmin') ||
                                (user?.role === 'admin' &&
                                  u.role === 'admin' &&
                                  u.uid !== user.uid &&
                                  user.role !== 'superAdmin')
                              }
                              aria-label={`${u.status === 'active' ? 'Suspend' : 'Activate'} user ${u.name || 'user'}`}
                              className={
                                u.status === 'active'
                                  ? 'text-orange-600'
                                  : 'text-blue-600'
                              }
                            >
                              {u.status === 'active' ? (
                                <Ban className="h-5 w-5" />
                              ) : (
                                <CheckSquare className="h-5 w-5" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalPlatformUsersPages > 1 && (
                    <div className="mt-4 flex justify-center items-center gap-2">
                      <Button
                        onClick={() =>
                          setPlatformUsersCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={platformUsersCurrentPage === 1}
                        variant="outline"
                        aria-label="Previous page of platform users"
                      >
                        Previous
                      </Button>
                      <span>
                        Page {platformUsersCurrentPage} of{' '}
                        {totalPlatformUsersPages}
                      </span>
                      <Button
                        onClick={() =>
                          setPlatformUsersCurrentPage((p) =>
                            Math.min(totalPlatformUsersPages, p + 1)
                          )
                        }
                        disabled={
                          platformUsersCurrentPage === totalPlatformUsersPages
                        }
                        variant="outline"
                        aria-label="Next page of platform users"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
