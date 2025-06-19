
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
  CheckCircle,
  XCircle,
  Users,
  Briefcase,
  Building,
  Eye,
  Search as SearchIcon,
  ChevronsUpDown,
  ExternalLink,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState, useMemo, useCallback } from 'react';
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

function getSortableValue<T>(item: T, key: keyof T | null): any {
  if (!key) return null;
  const value = item[key];
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  return value;
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

  const [companiesSearchTerm, setCompaniesSearchTerm] = useState('');
  const [jobSeekersSearchTerm, setJobSeekersSearchTerm] = useState('');
  const [platformUsersSearchTerm, setPlatformUsersSearchTerm] = useState('');

  const debouncedCompaniesSearchTerm = useDebounce(companiesSearchTerm, 300);
  const debouncedJobSeekersSearchTerm = useDebounce(jobSeekersSearchTerm, 300);
  const debouncedPlatformUsersSearchTerm = useDebounce(
    platformUsersSearchTerm,
    300
  );

  const [companiesCurrentPage, setCompaniesCurrentPage] = useState(1);
  const [jobSeekersCurrentPage, setJobSeekersCurrentPage] = useState(1);
  const [platformUsersCurrentPage, setPlatformUsersCurrentPage] = useState(1);

  const [companiesSortConfig, setCompaniesSortConfig] = useState<
    SortConfig<Company>
  >({ key: 'createdAt', direction: 'desc' });
  const [jobSeekersSortConfig, setJobSeekersSortConfig] = useState<
    SortConfig<UserProfile>
  >({ key: 'createdAt', direction: 'desc' });
  const [platformUsersSortConfig, setPlatformUsersSortConfig] = useState<
    SortConfig<UserProfile>
  >({ key: 'createdAt', direction: 'desc' });

  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [isCompaniesLoading, setIsCompaniesLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsJobsLoading(true);
    setIsCompaniesLoading(true);
    setIsUsersLoading(true);

    try {
      // Fetch Pending Jobs
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      setPendingJobs(
        jobsSnapshot.docs.map(
          (d) =>
            ({
              id: d.id,
              ...d.data(),
              createdAt: (d.data().createdAt as Timestamp)
                ?.toDate()
                .toISOString(),
            }) as Job
        )
      );
      setIsJobsLoading(false);

      // Fetch Pending Companies
      const pendingCompaniesQuery = query(
        collection(db, 'companies'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const pendingCompaniesSnapshot = await getDocs(pendingCompaniesQuery);
      setPendingCompanies(
        pendingCompaniesSnapshot.docs.map(
          (d) =>
            ({
              id: d.id,
              ...d.data(),
              createdAt: (d.data().createdAt as Timestamp)
                ?.toDate()
                .toISOString(),
            }) as Company
        )
      );

      // Fetch All Companies
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
          // Approximated counts - real counts need aggregation or denormalization
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

      // Fetch All Job Seekers
      const jobSeekersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'jobSeeker'),
        orderBy('createdAt', 'desc')
      );
      const jobSeekersSnapshot = await getDocs(jobSeekersQuery);
      setAllJobSeekers(
        jobSeekersSnapshot.docs.map(
          (d) =>
            ({
              uid: d.id,
              ...d.data(),
              createdAt: (d.data().createdAt as Timestamp)
                ?.toDate()
                .toISOString(),
              lastActive: (d.data().lastActive as Timestamp)
                ?.toDate()
                .toISOString(),
              jobsAppliedCount: (d.data().appliedJobIds || []).length,
            }) as UserProfile
        )
      );

      // Fetch All Platform Users (Admins, SuperAdmins)
      const platformUsersQuery = query(
        collection(db, 'users'),
        where('role', 'in', ['admin', 'superAdmin']),
        orderBy('createdAt', 'desc')
      );
      const platformUsersSnapshot = await getDocs(platformUsersQuery);
      setAllPlatformUsers(
        platformUsersSnapshot.docs.map(
          (d) =>
            ({
              uid: d.id,
              ...d.data(),
              createdAt: (d.data().createdAt as Timestamp)
                ?.toDate()
                .toISOString(),
              lastActive: (d.data().lastActive as Timestamp)
                ?.toDate()
                .toISOString(),
            }) as UserProfile
        )
      );
      setIsUsersLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load some admin data.',
        variant: 'destructive',
      });
      setIsJobsLoading(false);
      setIsCompaniesLoading(false);
      setIsUsersLoading(false);
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
    newStatus: 'approved' | 'rejected',
    reason?: string
  ) => {
    setActionLoading(`job-${jobId}`);
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status: newStatus,
        moderationReason:
          newStatus === 'rejected' ? reason || 'Rejected by admin' : null,
        updatedAt: serverTimestamp(),
      });
      setPendingJobs((prev) => prev.filter((job) => job.id !== jobId));
      toast({
        title: 'Success',
        description: `Job ${jobId} status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error(`Error updating job ${jobId}:`, error);
      toast({
        title: 'Error',
        description: `Failed to update job ${jobId}.`,
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
      const updateData: any = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };
      if (newStatus === 'rejected' || newStatus === 'suspended') {
        updateData.moderationReason =
          reason ||
          `${newStatus === 'rejected' ? 'Rejected' : 'Suspended'} by admin`;
      } else {
        updateData.moderationReason = null;
      }
      await updateDoc(companyDocRef, updateData);

      // Update local state for all companies and pending companies
      setAllCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId
            ? {
                ...c,
                status: newStatus,
                moderationReason: updateData.moderationReason,
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
        description: `Failed to update company ${companyId}.`,
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
      await updateUserProfileInAuthContext({ uid: userId, status: newStatus }); // Use context function for consistency
      // Update local state for relevant user list
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
        description: 'Failed to update user status.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Generic sort request handler
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

  // Generic memoized sorted items
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

  // Generic paginated items
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

  const totalCompaniesPages = Math.ceil(
    sortedCompanies.length / ITEMS_PER_PAGE
  );
  const totalJobSeekersPages = Math.ceil(
    sortedJobSeekers.length / ITEMS_PER_PAGE
  );
  const totalPlatformUsersPages = Math.ceil(
    sortedPlatformUsers.length / ITEMS_PER_PAGE
  );

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
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleJobStatusUpdate(job.id, 'rejected')
                        }
                        disabled={actionLoading === `job-${job.id}`}
                        aria-label={`Reject job ${job.title}`}
                      >
                        <XCircle className="mr-1 h-4 w-4 text-destructive" />{' '}
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleJobStatusUpdate(job.id, 'approved')
                        }
                        disabled={actionLoading === `job-${job.id}`}
                        aria-label={`Approve job ${job.title}`}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Approve
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
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCompanyStatusUpdate(c.id, 'rejected')
                        }
                        disabled={actionLoading === `company-${c.id}`}
                        aria-label={`Reject company ${c.name}`}
                      >
                        <XCircle className="mr-1 h-4 w-4 text-destructive" />{' '}
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleCompanyStatusUpdate(c.id, 'approved')
                        }
                        disabled={actionLoading === `company-${c.id}`}
                        aria-label={`Approve company ${c.name}`}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Approve
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="companies">Companies</TabsTrigger>
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
                onChange={(e) => setCompaniesSearchTerm(e.target.value)}
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
                              href={c.websiteUrl}
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
                                c.status === 'approved'
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
                            {c.status !== 'approved' && (
                              <Button
                                size="xs"
                                onClick={() =>
                                  handleCompanyStatusUpdate(c.id, 'approved')
                                }
                                disabled={actionLoading === `company-${c.id}`}
                                aria-label={`Approve company ${c.name}`}
                              >
                                Approve
                              </Button>
                            )}
                            {c.status !== 'rejected' &&
                              c.status !== 'pending' && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() =>
                                    handleCompanyStatusUpdate(c.id, 'rejected')
                                  }
                                  disabled={actionLoading === `company-${c.id}`}
                                  aria-label={`Reject company ${c.name}`}
                                >
                                  Reject
                                </Button>
                              )}
                            {c.status !== 'suspended' ? (
                              <Button
                                size="xs"
                                variant="destructive"
                                onClick={() =>
                                  handleCompanyStatusUpdate(c.id, 'suspended')
                                }
                                disabled={actionLoading === `company-${c.id}`}
                                aria-label={`Suspend company ${c.name}`}
                              >
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() =>
                                  handleCompanyStatusUpdate(c.id, 'active')
                                }
                                disabled={actionLoading === `company-${c.id}`}
                                aria-label={`Activate company ${c.name}`}
                              >
                                Activate
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

        <TabsContent value="jobSeekers">
          <Card>
            <CardHeader>
              <CardTitle>
                Manage Job Seekers ({sortedJobSeekers.length})
              </CardTitle>
              <Input
                placeholder="Search job seekers by name or email..."
                value={jobSeekersSearchTerm}
                onChange={(e) => setJobSeekersSearchTerm(e.target.value)}
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
                              <CheckCircle className="text-green-500 h-5 w-5" />
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
                            <Button variant="outline" size="xs" asChild>
                              <Link
                                href={`/employer/candidates/${u.uid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="mr-1 h-3 w-3" /> Profile
                              </Link>
                            </Button>
                            <Button
                              variant={
                                u.status === 'active'
                                  ? 'destructive'
                                  : 'default'
                              }
                              size="xs"
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
                              aria-label={`${u.status === 'active' ? 'Suspend' : 'Activate'} user ${u.name}`}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Activate'}
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
                onChange={(e) => setPlatformUsersSearchTerm(e.target.value)}
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
                              variant={
                                u.status === 'active'
                                  ? 'destructive'
                                  : 'default'
                              }
                              size="xs"
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
                              aria-label={`${u.status === 'active' ? 'Suspend' : 'Activate'} user ${u.name}`}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Activate'}
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
