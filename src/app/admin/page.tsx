'use client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import type {
  Company,
  Job,
  LegalDocument,
  UserProfile,
  UserRole,
} from '@/types';
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { AlertCircle, Cpu, Gavel, Loader2, ShieldCheck } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import AdminAiFeatures from '@/components/admin/AdminAiFeatures';
import AdminCompaniesTable from '@/components/admin/AdminCompaniesTable';
import AdminDashboardOverview from '@/components/admin/AdminDashboardOverview';
import AdminJobSeekersTable from '@/components/admin/AdminJobSeekersTable';
import AdminJobsTable from '@/components/admin/AdminJobsTable';
import AdminLegalEditor from '@/components/admin/AdminLegalEditor';
import AdminPlatformUsersTable from '@/components/admin/AdminPlatformUsersTable';
import { ADMIN_LIKE_ROLES } from './_lib/constants';
import {
  initialModalState,
  type JobWithApplicantCount,
  type ModalState,
  type PlatformStats,
} from './_lib/interfaces';

export default function AdminPage() {
  const { user, loading } = useAuth();
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

  const [privacyPolicyContent, setPrivacyPolicyContent] = useState('');
  const [termsOfServiceContent, setTermsOfServiceContent] = useState('');
  const [isLegalContentLoaded, setIsLegalContentLoaded] = useState({
    privacy: false,
    terms: false,
  });
  const [isSavingLegal, setIsSavingLegal] = useState<
    'privacy' | 'terms' | null
  >(null);

  const fetchLegalContent = useCallback(async () => {
    if (user?.role !== 'superAdmin') return;
    try {
      const privacyDocRef = doc(db, 'legalContent', 'privacyPolicy');
      const privacyDocSnap = await getDoc(privacyDocRef);
      if (privacyDocSnap.exists()) {
        setPrivacyPolicyContent(
          (privacyDocSnap.data() as LegalDocument).content
        );
      }
      setIsLegalContentLoaded((prev) => ({ ...prev, privacy: true }));

      const termsDocRef = doc(db, 'legalContent', 'termsOfService');
      const termsDocSnap = await getDoc(termsDocRef);
      if (termsDocSnap.exists()) {
        setTermsOfServiceContent(
          (termsDocSnap.data() as LegalDocument).content
        );
      }
      setIsLegalContentLoaded((prev) => ({ ...prev, terms: true }));
    } catch (error: unknown) {
      console.error('Error fetching legal content:', error);
      toast({
        title: 'Error Fetching Legal Docs',
        description: 'Could not load legal documents for editing.',
        variant: 'destructive',
      });
    }
  }, [user?.role, toast]);

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
            ...data,
            id: d.id,
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
            ...data,
            id: d.id,
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
            ...companyData,
            id: companyDoc.id,
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
            ...data,
            uid: d.id,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
            lastActive: (data.lastActive as Timestamp)?.toDate().toISOString(),
            jobsAppliedCount: (data.appliedJobIds || []).length,
          } as UserProfile;
        })
      );

      const platformUsersQuery = query(
        collection(db, 'users'),
        where('role', 'in', ADMIN_LIKE_ROLES),
        orderBy('createdAt', 'desc')
      );
      const platformUsersSnapshot = await getDocs(platformUsersQuery);
      setAllPlatformUsers(
        platformUsersSnapshot.docs.map((d) => {
          const data = d.data();
          return {
            ...data,
            uid: d.id,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
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
          const jobData = jobDoc.data();
          const job = {
            ...jobData,
            id: jobDoc.id,
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
    } else if (!ADMIN_LIKE_ROLES.includes(user.role)) {
      router.replace(
        user.role === 'jobSeeker'
          ? '/jobs'
          : user.role === 'employer'
            ? '/employer/posted-jobs'
            : '/'
      );
    } else {
      fetchData();
      if (user.role === 'superAdmin') {
        fetchLegalContent();
      }
    }
  }, [user, loading, router, pathname, fetchData, fetchLegalContent]);

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
    if (user?.role === 'moderator' && newStatus === 'suspended') {
      toast({
        title: 'Permission Denied',
        description: 'Moderators cannot suspend jobs.',
        variant: 'destructive',
      });
      return;
    }
    if (
      (user?.role === 'supportAgent' || user?.role === 'dataAnalyst') &&
      newStatus !== 'pending' // Assuming they can't change from pending either.
    ) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to change job statuses.',
        variant: 'destructive',
      });
      return;
    }

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
    intendedStatus:
      | 'approved'
      | 'rejected'
      | 'suspended'
      | 'active'
      | 'deleted',
    reason?: string
  ) => {
    if (user?.role === 'supportAgent' || user?.role === 'dataAnalyst') {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to change company statuses.',
        variant: 'destructive',
      });
      return;
    }
    setSpecificActionLoading(`company-${companyId}`);

    let finalStatus: Company['status'] = intendedStatus;
    if (intendedStatus === 'active') {
      finalStatus = 'approved'; // 'active' intent means 'approved' for public visibility
    }

    try {
      const companyDocRef = doc(db, 'companies', companyId);
      const updateData: Record<string, unknown> = {
        status: finalStatus,
        updatedAt: serverTimestamp(),
      };
      if (
        finalStatus === 'rejected' ||
        finalStatus === 'suspended' ||
        finalStatus === 'deleted' ||
        (finalStatus === 'approved' && reason)
      ) {
        updateData.moderationReason =
          reason ||
          `${finalStatus.charAt(0).toUpperCase() + finalStatus.slice(1)} by admin`;
      } else {
        updateData.moderationReason = null;
      }

      await updateDoc(companyDocRef, updateData);

      setAllCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId
            ? {
                ...c,
                status: finalStatus,
                moderationReason: updateData.moderationReason as string | null,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
      if (finalStatus !== 'pending') {
        setPendingCompanies((prev) => prev.filter((c) => c.id !== companyId));
      }

      toast({
        title: 'Success',
        description: `Company ${companyId} status updated to ${finalStatus}.`,
      });

      if (finalStatus === 'suspended' || finalStatus === 'deleted') {
        toast({
          title: 'Note',
          description: `Associated recruiters' access will be limited based on the new company status ('${finalStatus}').`,
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
    if (!user) return;

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

    const isTargetListedAsJobSeeker = allJobSeekers.some(
      (js) => js.uid === userId
    );

    if (user.uid === userId) {
      if (!isTargetListedAsJobSeeker) {
        toast({
          title: 'Action Denied',
          description:
            'You cannot change your own status as a platform user. This action targets your admin/moderator account.',
          variant: 'destructive',
        });
        return;
      } else {
        toast({
          title: 'Caution: Self-Action',
          description:
            'You are attempting to modify your own job seeker record. Proceed with caution if this is intended.',
          variant: 'default',
          duration: 5000,
        });
      }
    }

    if (
      user.role === 'moderator' ||
      user.role === 'supportAgent' ||
      user.role === 'dataAnalyst'
    ) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to change user statuses.',
        variant: 'destructive',
      });
      return;
    }

    if (user.role === 'admin') {
      if (
        !isTargetListedAsJobSeeker &&
        targetUser.uid !== user.uid &&
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
    }

    setSpecificActionLoading(`user-${userId}`);
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      const updatedTime = new Date().toISOString();
      if (isTargetListedAsJobSeeker) {
        setAllJobSeekers((prev) =>
          prev.map((u) =>
            u.uid === userId
              ? { ...u, status: newStatus, updatedAt: updatedTime }
              : u
          )
        );
      } else {
        setAllPlatformUsers((prev) =>
          prev.map((u) =>
            u.uid === userId
              ? { ...u, status: newStatus, updatedAt: updatedTime }
              : u
          )
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

  const handleSaveLegalDocument = async (
    docId: 'privacyPolicy' | 'termsOfService',
    content: string
  ) => {
    if (user?.role !== 'superAdmin') {
      toast({
        title: 'Permission Denied',
        description: 'Only Super Admins can update legal documents.',
        variant: 'destructive',
      });
      return;
    }
    setIsSavingLegal(docId);
    try {
      const legalDocRef = doc(db, 'legalContent', docId);
      await setDoc(legalDocRef, {
        content: content,
        lastUpdated: serverTimestamp(),
      });
      toast({
        title: 'Success',
        description: `${docId === 'privacyPolicy' ? 'Privacy Policy' : 'Terms of Service'} updated successfully.`,
      });
    } catch (error: unknown) {
      console.error(`Error saving ${docId}:`, error);
      toast({
        title: 'Error Saving Document',
        description: `Could not save ${docId === 'privacyPolicy' ? 'Privacy Policy' : 'Terms of Service'}.`,
        variant: 'destructive',
      });
    } finally {
      setIsSavingLegal(null);
    }
  };

  if (loading || (!user && !loading)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  if (user && !ADMIN_LIKE_ROLES.includes(user.role)) {
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

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'superAdmin':
        return 'Super Admin';
      case 'supportAgent':
        return 'Support Agent';
      case 'dataAnalyst':
        return 'Data Analyst';
      case 'complianceOfficer':
        return 'Compliance Officer';
      case 'systemMonitor':
        return 'System Monitor';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'superAdmin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'moderator':
        return 'secondary';
      case 'supportAgent':
        return 'outline';
      case 'dataAnalyst':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const canPerformUserActions =
    user?.role === 'admin' || user?.role === 'superAdmin';
  const canModerateContent =
    canPerformUserActions || user?.role === 'moderator';
  const showQuickModeration = canModerateContent;
  const showPlatformUsersTab =
    user?.role === 'admin' ||
    user?.role === 'superAdmin' ||
    user?.role === 'dataAnalyst'; // Moderators cannot manage other platform users
  const showLegalContentTab = user?.role === 'superAdmin';

  const tabsConfig = [
    { value: 'companies', label: 'Companies', condition: true },
    { value: 'allJobs', label: 'All Jobs', condition: true },
    { value: 'jobSeekers', label: 'Job Seekers', condition: true },
    {
      value: 'platformUsers',
      label: 'Platform Users',
      condition: showPlatformUsersTab,
    },
    {
      value: 'legalContent',
      label: 'Legal Content',
      condition: showLegalContentTab,
    },
    {
      value: 'aiFeatures',
      label: 'AI Features',
      condition: user?.role === 'superAdmin',
    },
  ];

  const visibleTabs = tabsConfig.filter((tab) => tab.condition);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage platform users, jobs, and companies.{' '}
            {user?.role && (
              <Badge variant={getRoleBadgeVariant(user.role)} className="ml-2">
                {getRoleDisplayName(user.role)}
              </Badge>
            )}
          </p>
        </div>
      </div>
      <Separator />

      <AdminDashboardOverview
        platformStats={platformStats}
        isStatsLoading={isStatsLoading}
        pendingJobs={pendingJobs}
        isPendingJobsLoading={isPendingJobsLoading}
        pendingCompanies={pendingCompanies}
        isPendingCompaniesLoading={isPendingCompaniesLoading}
        canModerateContent={canModerateContent}
        specificActionLoading={specificActionLoading}
        handleJobStatusUpdate={handleJobStatusUpdate}
        handleCompanyStatusUpdate={handleCompanyStatusUpdate}
        showConfirmationModal={showConfirmationModal}
        showQuickModeration={showQuickModeration}
        canViewAnalytics={
          user?.role !== 'supportAgent' &&
          user?.role !== 'complianceOfficer' &&
          user?.role !== 'systemMonitor'
        }
      />

      <Tabs defaultValue="companies" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
          {visibleTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.value === 'legalContent' && (
                <Gavel className="mr-2 h-4 w-4" />
              )}
              {tab.value === 'aiFeatures' && <Cpu className="mr-2 h-4 w-4" />}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="companies">
          <AdminCompaniesTable
            companies={allCompanies}
            isLoading={isAllCompaniesLoading}
            showConfirmationModal={showConfirmationModal}
            handleCompanyStatusUpdate={handleCompanyStatusUpdate}
            specificActionLoading={specificActionLoading}
            canModerateContent={canModerateContent}
          />
        </TabsContent>

        <TabsContent value="allJobs">
          <AdminJobsTable
            jobs={allJobs}
            isLoading={isAllJobsLoading}
            currentUserRole={user?.role}
            showConfirmationModal={showConfirmationModal}
            handleJobStatusUpdate={handleJobStatusUpdate}
            specificActionLoading={specificActionLoading}
            canModerateContent={canModerateContent}
          />
        </TabsContent>

        <TabsContent value="jobSeekers">
          <AdminJobSeekersTable
            jobSeekers={allJobSeekers}
            isLoading={isUsersLoading}
            showConfirmationModal={showConfirmationModal}
            handleUserStatusUpdate={handleUserStatusUpdate}
            specificActionLoading={specificActionLoading}
            canPerformUserActions={canPerformUserActions}
          />
        </TabsContent>

        {showPlatformUsersTab && (
          <TabsContent value="platformUsers">
            <AdminPlatformUsersTable
              platformUsers={allPlatformUsers}
              isLoading={isUsersLoading}
              currentUser={user}
              showConfirmationModal={showConfirmationModal}
              handleUserStatusUpdate={handleUserStatusUpdate}
              specificActionLoading={specificActionLoading}
              getRoleDisplayName={getRoleDisplayName}
              getRoleBadgeVariant={getRoleBadgeVariant}
            />
          </TabsContent>
        )}
        {showLegalContentTab && (
          <TabsContent value="legalContent">
            <AdminLegalEditor
              privacyPolicyContent={privacyPolicyContent}
              termsOfServiceContent={termsOfServiceContent}
              onPrivacyPolicyChange={setPrivacyPolicyContent}
              onTermsOfServiceChange={setTermsOfServiceContent}
              onSaveLegalDocument={handleSaveLegalDocument}
              isContentLoaded={isLegalContentLoaded}
              isSaving={isSavingLegal}
            />
          </TabsContent>
        )}
        {user?.role === 'superAdmin' && (
          <TabsContent value="aiFeatures">
            <AdminAiFeatures />
          </TabsContent>
        )}
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
