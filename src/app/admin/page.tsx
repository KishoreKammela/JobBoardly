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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Trash2,
  BarChart3,
  Users,
  FileText,
  ClipboardList,
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

interface ModalState {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  onConfirmAction: (() => Promise<void>) | null;
  confirmText: string;
  confirmVariant: 'default' | 'destructive';
}

const initialModalState: ModalState = {
  isOpen: false,
  title: '',
  description: '',
  onConfirmAction: null,
  confirmText: 'Confirm',
  confirmVariant: 'default',
};

interface PlatformStats {
  totalJobSeekers: number;
  totalCompanies: number;
  totalJobs: number;
  approvedJobs: number;
  totalApplications: number;
}

function getSortableValue<T>(
  item: T,
  key: keyof T | null
): string | number | null | boolean | undefined {
  if (!key) return null;
  const value = item[key as keyof T];
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  return value as string | number | null | boolean | undefined;
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
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(
    null
  );

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

  const [isPendingJobsLoading, setIsPendingJobsLoading] = useState(true);
  const [isPendingCompaniesLoading, setIsPendingCompaniesLoading] =
    useState(true);
  const [isAllCompaniesLoading, setIsAllCompaniesLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isAllJobsLoading, setIsAllJobsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const [specificActionLoading, setSpecificActionLoading] = useState<
    string | null
  >(null);

  const [modalState, setModalState] = useState<ModalState>(initialModalState);
  const [isModalActionLoading, setIsModalActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsPendingJobsLoading(true);
    setIsPendingCompaniesLoading(true);
    setIsAllCompaniesLoading(true);
    setIsUsersLoading(true);
    setIsAllJobsLoading(true);
    setIsStatsLoading(true);

    try {
      const jobSeekersCountSnap = await getCountFromServer(
        query(collection(db, 'users'), where('role', '==', 'jobSeeker'))
      );
      const companiesCountSnap = await getCountFromServer(
        collection(db, 'companies')
      );
      const totalJobsCountSnap = await getCountFromServer(
        collection(db, 'jobs')
      );
      const approvedJobsCountSnap = await getCountFromServer(
        query(collection(db, 'jobs'), where('status', '==', 'approved'))
      );
      const applicationsCountSnap = await getCountFromServer(
        collection(db, 'applications')
      );

      setPlatformStats({
        totalJobSeekers: jobSeekersCountSnap.data().count,
        totalCompanies: companiesCountSnap.data().count,
        totalJobs: totalJobsCountSnap.data().count,
        approvedJobs: approvedJobsCountSnap.data().count,
        totalApplications: applicationsCountSnap.data().count,
      });
      setIsStatsLoading(false);

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
      setIsPendingJobsLoading(false);

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
      setIsPendingCompaniesLoading(false);

      const allCompaniesQuery = query(
        collection(db, 'companies'),
        orderBy('createdAt', 'desc')
      );
      const allCompaniesSnapshot = await getDocs(allCompaniesQuery);
      const companiesData = await Promise.all(
        allCompaniesSnapshot.docs.map(async (companyDoc) => {
          const companyData = companyDoc.data();
          const company = {
            id: companyDoc.id,
            ...companyData,
            createdAt: (companyData.createdAt as Timestamp)
              ?.toDate()
              .toISOString(),
            updatedAt: (companyData.updatedAt as Timestamp)
              ?.toDate()
              .toISOString(),
          } as Company;

          const jobCountQuery = query(
            collection(db, 'jobs'),
            where('companyId', '==', company.id)
          );
          const jobCountSnap = await getCountFromServer(jobCountQuery);
          company.jobCount = jobCountSnap.data().count;

          const appCountQuery = query(
            collection(db, 'applications'),
            where('companyId', '==', company.id)
          );
          const appCountSnap = await getCountFromServer(appCountQuery);
          company.applicationCount = appCountSnap.data().count;

          return company;
        })
      );
      setAllCompanies(companiesData);
      setIsAllCompaniesLoading(false);

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
          const appCountQuery = query(
            collection(db, 'applications'),
            where('jobId', '==', job.id)
          );
          const applicantCountSnap = await getCountFromServer(appCountQuery);
          return {
            ...job,
            applicantCount: applicantCountSnap.data().count,
            createdAt: (job.createdAt as Timestamp)?.toDate().toISOString(),
            updatedAt: (job.updatedAt as Timestamp)?.toDate().toISOString(),
          } as JobWithApplicantCount;
        })
      );
      setAllJobs(jobsData);
      setIsAllJobsLoading(false);
    } catch (error: unknown) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: `Failed to load some admin data. ${(error as Error).message}`,
        variant: 'destructive',
      });
      setIsPendingJobsLoading(false);
      setIsPendingCompaniesLoading(false);
      setIsAllCompaniesLoading(false);
      setIsUsersLoading(false);
      setIsAllJobsLoading(false);
      setIsStatsLoading(false);
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

  const showConfirmationModal = (
    title: string,
    description: React.ReactNode,
    action: () => Promise<void>,
    confirmText = 'Confirm',
    confirmVariant: 'default' | 'destructive' = 'default'
  ) => {
    setModalState({
      isOpen: true,
      title,
      description,
      onConfirmAction: action,
      confirmText,
      confirmVariant,
    });
  };

  const executeConfirmedAction = async () => {
    if (modalState.onConfirmAction) {
      setIsModalActionLoading(true);
      try {
        await modalState.onConfirmAction();
      } catch (e: unknown) {
        console.error('Error executing confirmed action:', e);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred while performing action.',
          variant: 'destructive',
        });
      } finally {
        setIsModalActionLoading(false);
        setModalState(initialModalState);
      }
    }
  };

  const handleJobStatusUpdate = async (
    jobId: string,
    newStatus: 'approved' | 'rejected' | 'suspended',
    reason?: string
  ) => {
    setSpecificActionLoading(`job-${jobId}`);
    try {
      const jobUpdates: Record<string, unknown> = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };
      if (
        newStatus === 'rejected' ||
        newStatus === 'suspended' ||
        (newStatus === 'approved' && reason)
      ) {
        jobUpdates.moderationReason =
          reason ||
          `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} by admin`;
      } else {
        jobUpdates.moderationReason = null;
      }

      await updateDoc(doc(db, 'jobs', jobId), jobUpdates);

      if (newStatus !== 'pending') {
        setPendingJobs((prev) => prev.filter((job) => job.id !== jobId));
      }

      setAllJobs((prevJobs) =>
        prevJobs.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: newStatus,
                moderationReason: jobUpdates.moderationReason as string | null,
                updatedAt: new Date().toISOString(),
              }
            : j
        )
      );

      toast({
        title: 'Success',
        description: `Job ${jobId} status updated to ${newStatus}.`,
      });
    } catch (error: unknown) {
      console.error(`Error updating job ${jobId}:`, error);
      toast({
        title: 'Error',
        description: `Failed to update job ${jobId}. Error: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setSpecificActionLoading(null);
    }
  };

  const handleCompanyStatusUpdate = async (
    companyId: string,
    newStatus: 'approved' | 'rejected' | 'suspended' | 'active' | 'deleted',
    reason?: string
  ) => {
    setSpecificActionLoading(`company-${companyId}`);
    try {
      const companyDocRef = doc(db, 'companies', companyId);
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };
      if (
        newStatus === 'rejected' ||
        newStatus === 'suspended' ||
        newStatus === 'deleted' ||
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
                moderationReason: updateData.moderationReason as string | null,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
      if (newStatus !== 'pending') {
        setPendingCompanies((prev) => prev.filter((c) => c.id !== companyId));
      }

      toast({
        title: 'Success',
        description: `Company ${companyId} status updated to ${newStatus}.`,
      });

      if (newStatus === 'suspended' || newStatus === 'deleted') {
        toast({
          title: 'Note',
          description: `Associated recruiters' access will be limited based on the new company status ('${newStatus}').`,
          duration: 7000,
        });
      }
    } catch (error: unknown) {
      console.error(`Error updating company ${companyId}:`, error);
      toast({
        title: 'Error',
        description: `Failed to update company ${companyId}. Error: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setSpecificActionLoading(null);
    }
  };

  const handleUserStatusUpdate = async (
    userId: string,
    newStatus: 'active' | 'suspended' | 'deleted'
  ) => {
    if (!user || (user.role !== 'admin' && user.role !== 'superAdmin')) return;
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
        description:
          'Admins cannot suspend or delete other Admins or SuperAdmins. This can only be done by a SuperAdmin.',
        variant: 'destructive',
      });
      return;
    }

    setSpecificActionLoading(`user-${userId}`);
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
    } catch (e: unknown) {
      console.error('Error updating user status:', e);
      toast({
        title: 'Error',
        description: `Failed to update user status. Error: ${(e as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setSpecificActionLoading(null);
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 /> Platform Analytics
          </CardTitle>
          <CardDescription>
            Key metrics for JobBoardly at a glance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isStatsLoading ? (
            <div className="flex items-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              Loading platform statistics...
            </div>
          ) : platformStats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
              <div className="p-4 border rounded-lg shadow-sm bg-muted/30">
                <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">
                  {platformStats.totalJobSeekers}
                </p>
                <p className="text-xs text-muted-foreground">Job Seekers</p>
              </div>
              <div className="p-4 border rounded-lg shadow-sm bg-muted/30">
                <Building className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">
                  {platformStats.totalCompanies}
                </p>
                <p className="text-xs text-muted-foreground">Companies</p>
              </div>
              <div className="p-4 border rounded-lg shadow-sm bg-muted/30">
                <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{platformStats.totalJobs}</p>
                <p className="text-xs text-muted-foreground">Total Jobs</p>
              </div>
              <div className="p-4 border rounded-lg shadow-sm bg-muted/30">
                <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold">
                  {platformStats.approvedJobs}
                </p>
                <p className="text-xs text-muted-foreground">Approved Jobs</p>
              </div>
              <div className="p-4 border rounded-lg shadow-sm bg-muted/30">
                <ClipboardList className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">
                  {platformStats.totalApplications}
                </p>
                <p className="text-xs text-muted-foreground">Applications</p>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Statistics Unavailable</AlertTitle>
              <AlertDescription>
                Could not load platform statistics at this time.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

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
            {isPendingJobsLoading ? (
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
                          showConfirmationModal(
                            `Reject Job "${job.title}"?`,
                            'Are you sure you want to reject this job posting? It will not be visible to job seekers.',
                            async () =>
                              handleJobStatusUpdate(job.id, 'rejected'),
                            'Reject Job',
                            'destructive'
                          )
                        }
                        disabled={specificActionLoading === `job-${job.id}`}
                        aria-label={`Reject job ${job.title}`}
                        className="text-destructive"
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          showConfirmationModal(
                            `Approve Job "${job.title}"?`,
                            'Are you sure you want to approve this job posting? It will become publicly visible.',
                            async () =>
                              handleJobStatusUpdate(job.id, 'approved'),
                            'Approve Job'
                          )
                        }
                        disabled={specificActionLoading === `job-${job.id}`}
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
            {isPendingCompaniesLoading ? (
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
                          showConfirmationModal(
                            `Reject Company "${c.name}"?`,
                            'Are you sure you want to reject this company profile? It will not be publicly visible.',
                            async () =>
                              handleCompanyStatusUpdate(c.id, 'rejected'),
                            'Reject Company',
                            'destructive'
                          )
                        }
                        disabled={specificActionLoading === `company-${c.id}`}
                        aria-label={`Reject company ${c.name}`}
                        className="text-destructive"
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          showConfirmationModal(
                            `Approve Company "${c.name}"?`,
                            'Are you sure you want to approve this company profile? It will become publicly visible and operational.',
                            async () =>
                              handleCompanyStatusUpdate(c.id, 'approved'),
                            'Approve Company'
                          )
                        }
                        disabled={specificActionLoading === `company-${c.id}`}
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
              {isAllCompaniesLoading ? (
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
                                      c.status === 'suspended' ||
                                      c.status === 'deleted'
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
                              <Link href={`/companies/${c.id}`} target="_blank">
                                <Eye className="h-5 w-5" />
                              </Link>
                            </Button>
                            {c.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    showConfirmationModal(
                                      `Approve Company "${c.name}"?`,
                                      `Are you sure you want to approve ${c.name}? The company will become active.`,
                                      async () =>
                                        handleCompanyStatusUpdate(
                                          c.id,
                                          'approved'
                                        ),
                                      'Approve Company'
                                    )
                                  }
                                  disabled={
                                    specificActionLoading === `company-${c.id}`
                                  }
                                  aria-label={`Approve company ${c.name}`}
                                  className="text-green-600"
                                >
                                  <CheckCircle2 className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    showConfirmationModal(
                                      `Reject Company "${c.name}"?`,
                                      `Are you sure you want to reject ${c.name}?`,
                                      async () =>
                                        handleCompanyStatusUpdate(
                                          c.id,
                                          'rejected'
                                        ),
                                      'Reject Company',
                                      'destructive'
                                    )
                                  }
                                  disabled={
                                    specificActionLoading === `company-${c.id}`
                                  }
                                  aria-label={`Reject company ${c.name}`}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-5 w-5" />
                                </Button>
                              </>
                            )}
                            {c.status === 'approved' ||
                            c.status === 'active' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  showConfirmationModal(
                                    `Suspend Company "${c.name}"?`,
                                    `Are you sure you want to suspend ${c.name}? Recruiters from this company will have limited access.`,
                                    async () =>
                                      handleCompanyStatusUpdate(
                                        c.id,
                                        'suspended'
                                      ),
                                    'Suspend Company',
                                    'destructive'
                                  )
                                }
                                disabled={
                                  specificActionLoading === `company-${c.id}`
                                }
                                aria-label={`Suspend company ${c.name}`}
                                className="text-orange-600"
                              >
                                <Ban className="h-5 w-5" />
                              </Button>
                            ) : c.status === 'suspended' ||
                              c.status === 'rejected' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  showConfirmationModal(
                                    `Activate Company "${c.name}"?`,
                                    `Are you sure you want to reactivate ${c.name}? This will restore full access for its recruiters.`,
                                    async () =>
                                      handleCompanyStatusUpdate(c.id, 'active'),
                                    'Activate Company'
                                  )
                                }
                                disabled={
                                  specificActionLoading === `company-${c.id}`
                                }
                                aria-label={`Activate company ${c.name}`}
                                className="text-blue-600"
                              >
                                <CheckSquare className="h-5 w-5" />
                              </Button>
                            ) : null}
                            {c.status !== 'deleted' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  showConfirmationModal(
                                    `Delete Company "${c.name}"?`,
                                    `Are you sure you want to delete ${c.name}? This is a soft delete. Recruiters will lose access. This action cannot be easily undone.`,
                                    async () =>
                                      handleCompanyStatusUpdate(
                                        c.id,
                                        'deleted'
                                      ),
                                    'Delete Company',
                                    'destructive'
                                  )
                                }
                                disabled={
                                  specificActionLoading === `company-${c.id}`
                                }
                                aria-label={`Delete company ${c.name}`}
                                className="text-destructive"
                              >
                                <Trash2 className="h-5 w-5" />
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
              <CardDescription>
                Admins manage job status (approve, reject, suspend, activate).
                Job content editing is handled by employers via their dashboard.
              </CardDescription>
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
                            requestSort(
                              'title',
                              jobsSortConfig,
                              setJobsSortConfig
                            )
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
                            {job.status === 'approved' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  showConfirmationModal(
                                    `Suspend Job "${job.title}"?`,
                                    `Are you sure you want to suspend this job? It will be hidden from public view and recruiters won't be able to manage it or its applicants.`,
                                    async () =>
                                      handleJobStatusUpdate(
                                        job.id,
                                        'suspended'
                                      ),
                                    'Suspend Job',
                                    'destructive'
                                  )
                                }
                                disabled={
                                  specificActionLoading === `job-${job.id}`
                                }
                                aria-label={`Suspend job ${job.title}`}
                                className="text-orange-600"
                              >
                                <Ban className="h-5 w-5" />
                              </Button>
                            )}
                            {(job.status === 'suspended' ||
                              job.status === 'rejected') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  showConfirmationModal(
                                    `Activate Job "${job.title}"?`,
                                    `Are you sure you want to activate this job? It will become approved and publicly visible.`,
                                    async () =>
                                      handleJobStatusUpdate(job.id, 'approved'),
                                    'Activate Job'
                                  )
                                }
                                disabled={
                                  specificActionLoading === `job-${job.id}`
                                }
                                aria-label={`Activate job ${job.title}`}
                                className="text-blue-600"
                              >
                                <CheckSquare className="h-5 w-5" />
                              </Button>
                            )}
                            {job.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    showConfirmationModal(
                                      `Approve Job "${job.title}"?`,
                                      `Are you sure you want to approve this job posting? It will become publicly visible.`,
                                      async () =>
                                        handleJobStatusUpdate(
                                          job.id,
                                          'approved'
                                        ),
                                      'Approve Job'
                                    )
                                  }
                                  disabled={
                                    specificActionLoading === `job-${job.id}`
                                  }
                                  aria-label={`Approve job ${job.title}`}
                                  className="text-green-600"
                                >
                                  <CheckCircle2 className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    showConfirmationModal(
                                      `Reject Job "${job.title}"?`,
                                      'Are you sure you want to reject this job posting? It will not be visible to job seekers.',
                                      async () =>
                                        handleJobStatusUpdate(
                                          job.id,
                                          'rejected'
                                        ),
                                      'Reject Job',
                                      'destructive'
                                    )
                                  }
                                  disabled={
                                    specificActionLoading === `job-${job.id}`
                                  }
                                  aria-label={`Reject job ${job.title}`}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-5 w-5" />
                                </Button>
                              </>
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
                      {paginatedJobSeekers.map((u) => {
                        const isUserEffectivelyActive =
                          u.status === 'active' || u.status === undefined;
                        return (
                          <TableRow key={u.uid}>
                            <TableCell className="font-medium">
                              {u.name || 'N/A'}
                            </TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  isUserEffectivelyActive
                                    ? 'default'
                                    : u.status === 'deleted' ||
                                        u.status === 'suspended'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                                className={
                                  isUserEffectivelyActive &&
                                  u.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : u.status === 'deleted' ||
                                        u.status === 'suspended'
                                      ? 'bg-red-100 text-red-800'
                                      : '' // Let variant handle undefined or other statuses
                                }
                              >
                                {(u.status || 'ACTIVE').toUpperCase()}
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
                              {u.status !== 'deleted' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const currentStatusForAction =
                                        u.status === undefined
                                          ? 'active'
                                          : u.status;
                                      const newStatus =
                                        currentStatusForAction === 'active'
                                          ? 'suspended'
                                          : 'active';
                                      showConfirmationModal(
                                        `${newStatus === 'active' ? 'Activate' : 'Suspend'} User "${u.name || u.email}"?`,
                                        `Are you sure you want to ${newStatus} this user account?`,
                                        async () =>
                                          handleUserStatusUpdate(
                                            u.uid,
                                            newStatus
                                          ),
                                        `${newStatus === 'active' ? 'Activate' : 'Suspend'} User`,
                                        newStatus === 'suspended'
                                          ? 'destructive'
                                          : 'default'
                                      );
                                    }}
                                    disabled={
                                      specificActionLoading === `user-${u.uid}`
                                    }
                                    aria-label={`${isUserEffectivelyActive ? 'Suspend' : 'Activate'} user ${u.name || 'user'}`}
                                    className={
                                      isUserEffectivelyActive
                                        ? 'text-orange-600'
                                        : 'text-blue-600'
                                    }
                                  >
                                    {isUserEffectivelyActive ? (
                                      <Ban className="h-5 w-5" />
                                    ) : (
                                      <CheckSquare className="h-5 w-5" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      showConfirmationModal(
                                        `Delete User "${u.name || u.email}"?`,
                                        'Are you sure you want to delete this user account? They will not be able to log in. This action cannot be easily undone.',
                                        async () =>
                                          handleUserStatusUpdate(
                                            u.uid,
                                            'deleted'
                                          ),
                                        'Delete User',
                                        'destructive'
                                      )
                                    }
                                    disabled={
                                      specificActionLoading === `user-${u.uid}`
                                    }
                                    aria-label={`Delete user ${u.name || 'user'}`}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
                              {(u.status || 'ACTIVE').toUpperCase()}
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
                              onClick={() => {
                                const newStatus =
                                  u.status === 'active'
                                    ? 'suspended'
                                    : 'active';
                                showConfirmationModal(
                                  `${newStatus === 'active' ? 'Activate' : 'Suspend'} Admin User "${u.name || u.email}"?`,
                                  `Are you sure you want to ${newStatus} this platform user account?`,
                                  async () =>
                                    handleUserStatusUpdate(u.uid, newStatus),
                                  `${newStatus === 'active' ? 'Activate' : 'Suspend'} User`,
                                  newStatus === 'suspended'
                                    ? 'destructive'
                                    : 'default'
                                );
                              }}
                              disabled={
                                specificActionLoading === `user-${u.uid}` ||
                                user?.uid === u.uid ||
                                (user?.role === 'admin' &&
                                  (u.role === 'admin' ||
                                    u.role === 'superAdmin'))
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

      <AlertDialog
        open={modalState.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setModalState(initialModalState);
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
              onClick={() => setModalState({ ...modalState, isOpen: false })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeConfirmedAction}
              disabled={isModalActionLoading}
              className={
                modalState.confirmVariant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
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
  );
}
