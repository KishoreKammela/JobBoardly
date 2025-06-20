'use client';
import type {
  Filters,
  SavedSearch,
  Application,
  Job,
  ApplicationAnswer,
} from '@/types';
import React, {
  createContext,
  useContext,
  type ReactNode,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { db } from '@/lib/firebase';
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  arrayUnion,
  arrayRemove,
  Timestamp,
  query as firestoreQuery,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface JobSeekerActionsContextType {
  applyForJob: (job: Job, answers?: ApplicationAnswer[]) => Promise<void>;
  hasAppliedForJob: (jobId: string) => boolean;
  getApplicationStatus: (jobId: string) => string | null;
  withdrawApplication: (jobId: string) => Promise<void>;
  saveJob: (jobId: string) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  isJobSaved: (jobId: string) => boolean;
  saveSearch: (searchName: string, filters: Filters) => Promise<void>;
  deleteSearch: (searchId: string) => Promise<void>;
  userApplications: Map<string, Application>;
}

const JobSeekerActionsContext = createContext<
  JobSeekerActionsContextType | undefined
>(undefined);

export function JobSeekerActionsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, updateUserProfile } = useAuth();
  const [userApplications, setUserApplications] = useState<
    Map<string, Application>
  >(new Map());
  const [isAppsLoading, setIsAppsLoading] = useState(true);

  useEffect(() => {
    const fetchUserApplications = async () => {
      if (user && user.role === 'jobSeeker' && user.uid && db) {
        setIsAppsLoading(true);
        try {
          const appsQuery = firestoreQuery(
            collection(db, 'applications'),
            where('applicantId', '==', user.uid)
          );
          const snapshot = await getDocs(appsQuery);
          const appsMap = new Map<string, Application>();
          snapshot.forEach((docSnap) => {
            const appData = {
              id: docSnap.id,
              ...docSnap.data(),
            } as Application;
            appsMap.set(appData.jobId, appData);
          });
          setUserApplications(appsMap);
        } catch (error) {
          console.error('Failed to fetch user applications:', error);
        } finally {
          setIsAppsLoading(false);
        }
      } else {
        setUserApplications(new Map());
        setIsAppsLoading(false);
      }
    };
    fetchUserApplications();
  }, [user]);

  const applyForJob = useCallback(
    async (job: Job, answers?: ApplicationAnswer[]) => {
      if (!user || !user.uid || user.role !== 'jobSeeker' || !db) {
        toast({
          title: 'Login Required',
          description: 'Please log in as a job seeker to apply.',
          variant: 'destructive',
        });
        throw new Error(
          'User not logged in as job seeker or DB not available.'
        );
      }
      if (user.status === 'suspended') {
        toast({
          title: 'Account Suspended',
          description:
            'Your account is currently suspended. You cannot apply for jobs.',
          variant: 'destructive',
        });
        throw new Error('Account suspended.');
      }

      const existingApplication = userApplications.get(job.id);
      if (existingApplication) {
        toast({
          title: 'Application Exists',
          description: `You have already an application process for this job (Status: ${existingApplication.status}). You cannot re-apply.`,
          variant: 'default',
        });
        throw new Error('Already applied or application process started.');
      }

      const applicationRef = doc(collection(db, 'applications'));
      const newApplicationData: Omit<Application, 'id'> = {
        jobId: job.id,
        jobTitle: job.title,
        applicantId: user.uid,
        applicantName: user.name,
        applicantAvatarUrl: user.avatarUrl || '',
        applicantHeadline: user.headline || '',
        companyId: job.companyId,
        postedById: job.postedById,
        status: 'Applied',
        appliedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        answers: answers || [],
      };

      try {
        await setDoc(
          applicationRef,
          newApplicationData as Record<string, unknown>
        );
        const fullNewApplication: Application = {
          id: applicationRef.id,
          ...newApplicationData,
          appliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUserApplications((prev) =>
          new Map(prev).set(job.id, fullNewApplication)
        );

        await updateUserProfile({
          appliedJobIds: arrayUnion(job.id) as unknown as string[],
        });
      } catch (error: unknown) {
        console.error('JobSeekerActionsContext: applyForJob error', error);
        throw error;
      }
    },
    [user, updateUserProfile, userApplications]
  );

  const getApplicationStatus = useCallback(
    (jobId: string): string | null => {
      if (isAppsLoading) return 'Loading...';
      return userApplications.get(jobId)?.status || null;
    },
    [userApplications, isAppsLoading]
  );

  const hasAppliedForJob = useCallback(
    (jobId: string): boolean => {
      if (isAppsLoading) return false;
      return userApplications.has(jobId);
    },
    [userApplications, isAppsLoading]
  );

  const withdrawApplication = useCallback(
    async (jobIdToWithdraw: string) => {
      if (!user || user.role !== 'jobSeeker' || !user.uid || !db) {
        toast({
          title: 'Error',
          description:
            'You must be logged in as a job seeker, or DB is not available.',
          variant: 'destructive',
        });
        throw new Error('Not logged in as job seeker or DB not available');
      }
      if (user.status === 'suspended') {
        toast({
          title: 'Account Suspended',
          description:
            'Cannot withdraw application while account is suspended.',
          variant: 'destructive',
        });
        throw new Error('Account suspended');
      }

      const application = userApplications.get(jobIdToWithdraw);

      if (!application || !application.id) {
        toast({
          title: 'Error',
          description: 'Application not found for this job.',
          variant: 'destructive',
        });
        throw new Error('Application not found');
      }

      if (application.status !== 'Applied') {
        toast({
          title: 'Action Not Allowed',
          description: `Cannot withdraw application with status: ${application.status}.`,
          variant: 'default',
        });
        throw new Error(
          `Cannot withdraw application with status: ${application.status}`
        );
      }

      const appDocRef = doc(db, 'applications', application.id);
      try {
        await updateDoc(appDocRef, {
          status: 'Withdrawn by Applicant',
          updatedAt: serverTimestamp(),
        });
        const updatedApp = {
          ...application,
          status: 'Withdrawn by Applicant',
          updatedAt: new Date().toISOString(),
        } as Application;
        setUserApplications((prev) =>
          new Map(prev).set(jobIdToWithdraw, updatedApp)
        );
      } catch (error) {
        console.error('Failed to withdraw application:', error);
        toast({
          title: 'Error',
          description: 'Failed to withdraw application. Please try again.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [user, userApplications]
  );

  const saveJob = useCallback(
    async (jobId: string) => {
      if (user && user.uid && user.role === 'jobSeeker') {
        if (user.status === 'suspended') {
          toast({
            title: 'Account Suspended',
            description:
              'Your account is currently suspended. You cannot save jobs.',
            variant: 'destructive',
          });
          return;
        }
        try {
          await updateUserProfile({
            savedJobIds: arrayUnion(jobId) as unknown as string[],
          });
        } catch (error: unknown) {
          console.error('JobSeekerActionsContext: saveJob error', error);
          throw error;
        }
      } else {
        toast({
          title: 'Login Required',
          description: 'Please log in as a job seeker to save jobs.',
          variant: 'destructive',
        });
      }
    },
    [user, updateUserProfile]
  );

  const unsaveJob = useCallback(
    async (jobId: string) => {
      if (user && user.uid && user.role === 'jobSeeker') {
        if (user.status === 'suspended') {
          toast({
            title: 'Account Suspended',
            description:
              'Your account is currently suspended. You cannot unsave jobs.',
            variant: 'destructive',
          });
          return;
        }
        try {
          await updateUserProfile({
            savedJobIds: arrayRemove(jobId) as unknown as string[],
          });
        } catch (error: unknown) {
          console.error('JobSeekerActionsContext: unsaveJob error', error);
          throw error;
        }
      } else {
        toast({
          title: 'Login Required',
          description: 'Please log in as a job seeker to unsave jobs.',
          variant: 'destructive',
        });
      }
    },
    [user, updateUserProfile]
  );

  const isJobSaved = useCallback(
    (jobId: string): boolean => {
      if (user && user.role === 'jobSeeker' && user.savedJobIds) {
        return user.savedJobIds.includes(jobId);
      }
      return false;
    },
    [user]
  );

  const saveSearch = useCallback(
    async (searchName: string, filters: Filters) => {
      if (!user || !user.uid || user.role !== 'jobSeeker') {
        toast({
          title: 'Action Denied',
          description: 'Only job seekers can save searches.',
          variant: 'destructive',
        });
        return;
      }
      if (user.status === 'suspended') {
        toast({
          title: 'Account Suspended',
          description:
            'Your account is currently suspended. You cannot save searches.',
          variant: 'destructive',
        });
        return;
      }
      const newSearchObject: SavedSearch = {
        id: uuidv4(),
        name: searchName,
        filters: {
          searchTerm: filters.searchTerm,
          location: filters.location,
          roleType: filters.roleType,
          isRemote: filters.isRemote,
          recentActivity: filters.recentActivity ?? null,
        },
        createdAt: new Date(),
      };
      try {
        await updateUserProfile({
          savedSearches: arrayUnion(
            newSearchObject
          ) as unknown as SavedSearch[],
        });
      } catch (error: unknown) {
        console.error('JobSeekerActionsContext: saveSearch error', error);
        throw error;
      }
    },
    [user, updateUserProfile]
  );

  const deleteSearch = useCallback(
    async (searchId: string) => {
      if (
        !user ||
        !user.uid ||
        user.role !== 'jobSeeker' ||
        !user.savedSearches
      ) {
        toast({
          title: 'Action Denied',
          description: 'Only job seekers can delete their saved searches.',
          variant: 'destructive',
        });
        return;
      }
      if (user.status === 'suspended') {
        toast({
          title: 'Account Suspended',
          description:
            'Your account is currently suspended. You cannot delete searches.',
          variant: 'destructive',
        });
        return;
      }
      const searchToDelete = user.savedSearches.find((s) => s.id === searchId);
      if (searchToDelete) {
        try {
          const searchToDeleteForFirestore = {
            ...searchToDelete,
            createdAt:
              searchToDelete.createdAt instanceof Date
                ? searchToDelete.createdAt
                : new Date(searchToDelete.createdAt as string),
            filters: {
              ...searchToDelete.filters,
              recentActivity: searchToDelete.filters.recentActivity ?? null,
            },
          };

          await updateUserProfile({
            savedSearches: arrayRemove(
              searchToDeleteForFirestore
            ) as unknown as SavedSearch[],
          });
        } catch (error: unknown) {
          console.error('JobSeekerActionsContext: deleteSearch error', error);
          throw error;
        }
      }
    },
    [user, updateUserProfile]
  );

  return (
    <JobSeekerActionsContext.Provider
      value={{
        applyForJob,
        hasAppliedForJob,
        getApplicationStatus,
        withdrawApplication,
        saveJob,
        unsaveJob,
        isJobSaved,
        saveSearch,
        deleteSearch,
        userApplications,
      }}
    >
      {children}
    </JobSeekerActionsContext.Provider>
  );
}

export function useJobSeekerActions() {
  const context = useContext(JobSeekerActionsContext);
  if (context === undefined) {
    throw new Error(
      'useJobSeekerActions must be used within a JobSeekerActionsProvider'
    );
  }
  return context;
}
