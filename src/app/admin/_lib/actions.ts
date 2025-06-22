// src/app/admin/_lib/actions.ts
import {
  getAllCompaniesForAdmin,
  getAllJobsForAdmin,
  getAllJobSeekersForAdmin,
  getAllPlatformUsersForAdmin,
  getLegalDocumentContent,
  getPendingCompanies,
  getPendingJobs,
  getPlatformStats,
  saveLegalDocumentInDb,
  updateCompanyStatusInDb,
  updateJobStatusInDb,
  updateUserStatusInDb,
} from '@/services/admin.services';
import { toast } from '@/hooks/use-toast';
import type { Dispatch, SetStateAction } from 'react';
import type { Company, Job, UserProfile } from '@/types';
import type { PlatformStats } from './interfaces';

type JobWithApplicantCount = Job & { applicantCount: number };

export const fetchDataForAdminPage = async (
  setPlatformStats: Dispatch<SetStateAction<PlatformStats | null>>,
  setPendingJobs: Dispatch<SetStateAction<JobWithApplicantCount[]>>,
  setPendingCompanies: Dispatch<SetStateAction<Company[]>>,
  setAllCompanies: Dispatch<SetStateAction<Company[]>>,
  setAllJobSeekers: Dispatch<SetStateAction<UserProfile[]>>,
  setAllPlatformUsers: Dispatch<SetStateAction<UserProfile[]>>,
  setAllJobs: Dispatch<SetStateAction<JobWithApplicantCount[]>>,
  setIsLoading: (section: string, value: boolean) => void
) => {
  try {
    const [
      stats,
      pendingJobsData,
      pendingCompaniesData,
      allCompaniesData,
      jobSeekersData,
      platformUsersData,
      allJobsData,
    ] = await Promise.all([
      getPlatformStats(),
      getPendingJobs(),
      getPendingCompanies(),
      getAllCompaniesForAdmin(),
      getAllJobSeekersForAdmin(),
      getAllPlatformUsersForAdmin(),
      getAllJobsForAdmin(),
    ]);

    setPlatformStats(stats);
    setPendingJobs(pendingJobsData);
    setPendingCompanies(pendingCompaniesData);
    setAllCompanies(allCompaniesData);
    setAllJobSeekers(jobSeekersData);
    setAllPlatformUsers(platformUsersData);
    setAllJobs(allJobsData);
  } catch (error: unknown) {
    console.error('Error fetching admin data:', error);
    toast({
      title: 'Error',
      description: `Failed to load admin dashboard data. ${(error as Error).message}`,
      variant: 'destructive',
    });
  } finally {
    setIsLoading('stats', false);
    setIsLoading('pendingJobs', false);
    setIsLoading('pendingCompanies', false);
    setIsLoading('allCompanies', false);
    setIsLoading('users', false);
    setIsLoading('allJobs', false);
  }
};

export const fetchLegalContentForAdmin = async (
  setPrivacyPolicyContent: Dispatch<SetStateAction<string>>,
  setTermsOfServiceContent: Dispatch<SetStateAction<string>>,
  setIsLegalContentLoaded: Dispatch<
    SetStateAction<{ privacy: boolean; terms: boolean }>
  >
) => {
  try {
    const privacyDoc = await getLegalDocumentContent('privacyPolicy');
    if (privacyDoc) {
      setPrivacyPolicyContent(privacyDoc.content);
    }
    setIsLegalContentLoaded((prev) => ({ ...prev, privacy: true }));

    const termsDoc = await getLegalDocumentContent('termsOfService');
    if (termsDoc) {
      setTermsOfServiceContent(termsDoc.content);
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
};

export const handleJobStatusUpdateAction = async (
  jobId: string,
  newStatus: 'approved' | 'rejected' | 'suspended',
  currentUser: UserProfile | null,
  setSpecificActionLoading: Dispatch<SetStateAction<string | null>>,
  setPendingJobs: Dispatch<SetStateAction<JobWithApplicantCount[]>>,
  setAllJobs: Dispatch<SetStateAction<JobWithApplicantCount[]>>,
  reason?: string
) => {
  if (currentUser?.role === 'moderator' && newStatus === 'suspended') {
    toast({
      title: 'Permission Denied',
      description: 'Moderators cannot suspend jobs.',
      variant: 'destructive',
    });
    return;
  }
  if (
    (currentUser?.role === 'supportAgent' ||
      currentUser?.role === 'dataAnalyst') &&
    newStatus !== 'pending'
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
    const { moderationReason } = await updateJobStatusInDb(
      jobId,
      newStatus,
      reason
    );
    if (newStatus !== 'pending') {
      setPendingJobs((prev) => prev.filter((job) => job.id !== jobId));
    }
    setAllJobs((prevJobs) =>
      prevJobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: newStatus,
              moderationReason,
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

export const handleCompanyStatusUpdateAction = async (
  companyId: string,
  intendedStatus: 'approved' | 'rejected' | 'suspended' | 'active' | 'deleted',
  currentUser: UserProfile | null,
  setSpecificActionLoading: Dispatch<SetStateAction<string | null>>,
  setAllCompanies: Dispatch<SetStateAction<Company[]>>,
  setPendingCompanies: Dispatch<SetStateAction<Company[]>>,
  reason?: string
) => {
  if (
    currentUser?.role === 'supportAgent' ||
    currentUser?.role === 'dataAnalyst'
  ) {
    toast({
      title: 'Permission Denied',
      description: 'You do not have permission to change company statuses.',
      variant: 'destructive',
    });
    return;
  }
  setSpecificActionLoading(`company-${companyId}`);
  try {
    const { finalStatus, moderationReason } = await updateCompanyStatusInDb(
      companyId,
      intendedStatus,
      reason
    );
    setAllCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId
          ? {
              ...c,
              status: finalStatus,
              moderationReason,
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

export const handleUserStatusUpdateAction = async (
  userId: string,
  newStatus: 'active' | 'suspended' | 'deleted',
  currentUser: UserProfile,
  allJobSeekers: UserProfile[],
  allPlatformUsers: UserProfile[],
  setSpecificActionLoading: Dispatch<SetStateAction<string | null>>,
  setAllJobSeekers: Dispatch<SetStateAction<UserProfile[]>>,
  setAllPlatformUsers: Dispatch<SetStateAction<UserProfile[]>>
) => {
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

  // ... (rest of the permission logic)

  setSpecificActionLoading(`user-${userId}`);
  try {
    await updateUserStatusInDb(userId, newStatus);
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

export const handleSaveLegalDocumentAction = async (
  docId: 'privacyPolicy' | 'termsOfService',
  content: string,
  currentUser: UserProfile,
  setIsSavingLegal: Dispatch<SetStateAction<'privacy' | 'terms' | null>>
) => {
  if (currentUser?.role !== 'superAdmin') {
    toast({
      title: 'Permission Denied',
      description: 'Only Super Admins can update legal documents.',
      variant: 'destructive',
    });
    return;
  }
  setIsSavingLegal(docId);
  try {
    await saveLegalDocumentInDb(docId, content);
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
