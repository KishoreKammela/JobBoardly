// src/app/admin/page.tsx
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
import type { Company, UserProfile } from '@/types';
import { AlertCircle, Cpu, Gavel, Loader2, ShieldCheck } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import AdminAiFeatures from '@/components/admin/AdminAiFeatures';
import AdminDashboardOverview from '@/components/admin/AdminDashboardOverview';
import AdminLegalEditor from '@/components/admin/AdminLegalEditor';
import { AdminCompaniesTable } from '@/components/admin/admin-companies-table';
import { AdminJobSeekersTable } from '@/components/admin/admin-job-seekers-table';
import { AdminJobsTable } from '@/components/admin/admin-jobs-table';
import { AdminPlatformUsersTable } from '@/components/admin/admin-platform-users-table';
import {
  getAllCompaniesForAdmin,
  getAllJobsForAdmin,
  getAllJobSeekersForAdmin,
  getAllPlatformUsersForAdmin,
  getLegalDocumentContent,
  getPendingCompanies,
  getPendingJobs,
  getPlatformStats,
} from '@/services/admin.services';
import { ADMIN_LIKE_ROLES } from './_lib/constants';
import type {
  JobWithApplicantCount,
  ModalState,
  PlatformStats,
} from './_lib/interfaces';
import { initialModalState } from './_lib/interfaces';
import {
  handleCompanyStatusUpdateAction,
  handleJobStatusUpdateAction,
  handleSaveLegalDocumentAction,
  handleUserStatusUpdateAction,
} from './_lib/actions';
import { getRoleBadgeVariant, getRoleDisplayName } from './_lib/utils';

export default function AdminPage() {
  const { user, loading, isLoggingOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Data states
  const [pendingJobs, setPendingJobs] = useState<JobWithApplicantCount[]>([]);
  const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [allJobSeekers, setAllJobSeekers] = useState<UserProfile[]>([]);
  const [allPlatformUsers, setAllPlatformUsers] = useState<UserProfile[]>([]);
  const [allJobs, setAllJobs] = useState<JobWithApplicantCount[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(
    null
  );
  const [privacyPolicyContent, setPrivacyPolicyContent] = useState('');
  const [termsOfServiceContent, setTermsOfServiceContent] = useState('');

  // Loading and UI states
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [specificActionLoading, setSpecificActionLoading] = useState<
    string | null
  >(null);
  const [modalState, setModalState] = useState<ModalState>(initialModalState);
  const [isModalActionLoading, setIsModalActionLoading] = useState(false);
  const [isSavingLegal, setIsSavingLegal] = useState<
    'privacy' | 'terms' | null
  >(null);
  const [dataError, setDataError] = useState<string | null>(null);

  // Effect for handling auth state and redirection
  useEffect(() => {
    if (loading || isLoggingOut) return;
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
    }
  }, [user, loading, isLoggingOut, router, pathname]);

  // Effect for fetching all dashboard data
  useEffect(() => {
    if (user?.uid && ADMIN_LIKE_ROLES.includes(user.role)) {
      const loadAdminData = async () => {
        setIsDataLoading(true);
        setDataError(null);
        try {
          // Fetch all data in parallel
          const [
            stats,
            pendingJobsData,
            pendingCompaniesData,
            allCompaniesData,
            jobSeekersData,
            platformUsersData,
            allJobsData,
            privacyDoc,
            termsDoc,
          ] = await Promise.all([
            getPlatformStats(),
            getPendingJobs(),
            getPendingCompanies(),
            getAllCompaniesForAdmin(),
            getAllJobSeekersForAdmin(),
            getAllPlatformUsersForAdmin(),
            getAllJobsForAdmin(),
            user.role === 'superAdmin'
              ? getLegalDocumentContent('privacyPolicy')
              : Promise.resolve(null),
            user.role === 'superAdmin'
              ? getLegalDocumentContent('termsOfService')
              : Promise.resolve(null),
          ]);

          // Set all states after all promises resolve
          setPlatformStats(stats);
          setPendingJobs(pendingJobsData);
          setPendingCompanies(pendingCompaniesData);
          setAllCompanies(allCompaniesData);
          setAllJobSeekers(jobSeekersData);
          setAllPlatformUsers(platformUsersData);
          setAllJobs(allJobsData);
          if (privacyDoc) setPrivacyPolicyContent(privacyDoc.content);
          if (termsDoc) setTermsOfServiceContent(termsDoc.content);
        } catch (error: unknown) {
          console.error('Error fetching admin data:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred.';
          setDataError(`Failed to load some dashboard data: ${errorMessage}`);
          toast({
            title: 'Error Loading Dashboard',
            description: `Failed to load some dashboard data. ${errorMessage}`,
            variant: 'destructive',
          });
        } finally {
          setIsDataLoading(false);
        }
      };

      loadAdminData();
    }
  }, [user?.uid, user?.role, toast]);

  // Modal logic using useCallback for stability
  const showConfirmationModal = useCallback(
    (
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
    },
    []
  );

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

  if (loading || isDataLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Dashboard Load Error</AlertTitle>
          <AlertDescription>{dataError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user || !ADMIN_LIKE_ROLES.includes(user.role)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">Redirecting...</span>
      </div>
    );
  }

  const canPerformUserActions =
    user?.role === 'admin' || user?.role === 'superAdmin';
  const canModerateContent =
    canPerformUserActions || user?.role === 'moderator';
  const showQuickModeration = canModerateContent;
  const showPlatformUsersTab =
    user?.role === 'admin' ||
    user?.role === 'superAdmin' ||
    user?.role === 'dataAnalyst';
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
        isStatsLoading={isDataLoading}
        pendingJobs={pendingJobs}
        isPendingJobsLoading={isDataLoading}
        pendingCompanies={pendingCompanies}
        isPendingCompaniesLoading={isDataLoading}
        canModerateContent={canModerateContent}
        specificActionLoading={specificActionLoading}
        handleJobStatusUpdate={(jobId, jobTitle, newStatus, reason) =>
          handleJobStatusUpdateAction(
            jobId,
            jobTitle,
            newStatus,
            user,
            setSpecificActionLoading,
            setPendingJobs,
            setAllJobs,
            reason
          )
        }
        handleCompanyStatusUpdate={(
          companyId,
          companyName,
          intendedStatus,
          reason
        ) =>
          handleCompanyStatusUpdateAction(
            companyId,
            companyName,
            intendedStatus,
            user,
            setSpecificActionLoading,
            setAllCompanies,
            setPendingCompanies,
            reason
          )
        }
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
            isLoading={isDataLoading}
            showConfirmationModal={showConfirmationModal}
            handleCompanyStatusUpdate={(
              companyId,
              companyName,
              intendedStatus,
              reason
            ) =>
              handleCompanyStatusUpdateAction(
                companyId,
                companyName,
                intendedStatus,
                user,
                setSpecificActionLoading,
                setAllCompanies,
                setPendingCompanies,
                reason
              )
            }
            specificActionLoading={specificActionLoading}
            canModerateContent={canModerateContent}
          />
        </TabsContent>

        <TabsContent value="allJobs">
          <AdminJobsTable
            jobs={allJobs}
            isLoading={isDataLoading}
            currentUserRole={user?.role}
            showConfirmationModal={showConfirmationModal}
            handleJobStatusUpdate={(jobId, jobTitle, newStatus, reason) =>
              handleJobStatusUpdateAction(
                jobId,
                jobTitle,
                newStatus,
                user,
                setSpecificActionLoading,
                setPendingJobs,
                setAllJobs,
                reason
              )
            }
            specificActionLoading={specificActionLoading}
            canModerateContent={canModerateContent}
          />
        </TabsContent>

        <TabsContent value="jobSeekers">
          <AdminJobSeekersTable
            jobSeekers={allJobSeekers}
            isLoading={isDataLoading}
            showConfirmationModal={showConfirmationModal}
            handleUserStatusUpdate={(userId, newStatus) =>
              handleUserStatusUpdateAction(
                userId,
                user,
                allJobSeekers,
                allPlatformUsers,
                setSpecificActionLoading,
                setAllJobSeekers,
                setAllPlatformUsers,
                newStatus
              )
            }
            specificActionLoading={specificActionLoading}
            canPerformUserActions={canPerformUserActions}
          />
        </TabsContent>

        {showPlatformUsersTab && (
          <TabsContent value="platformUsers">
            <AdminPlatformUsersTable
              platformUsers={allPlatformUsers}
              isLoading={isDataLoading}
              currentUser={user}
              showConfirmationModal={showConfirmationModal}
              handleUserStatusUpdate={(userId, newStatus) =>
                handleUserStatusUpdateAction(
                  userId,
                  user,
                  allJobSeekers,
                  allPlatformUsers,
                  setSpecificActionLoading,
                  setAllJobSeekers,
                  setAllPlatformUsers,
                  newStatus
                )
              }
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
              onSaveLegalDocument={(docId, content) =>
                handleSaveLegalDocumentAction(
                  docId,
                  content,
                  user,
                  setIsSavingLegal
                )
              }
              isLoading={isDataLoading}
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
