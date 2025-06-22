'use client';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query as firestoreQuery,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import type {
  Application,
  ApplicationAnswer,
  Filters,
  Job,
  SavedSearch,
} from '@/types';
import { useUserProfile } from '../UserProfile/UserProfileContext';

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
  const { user, updateUserProfile } = useUserProfile();
  const [userApplications, setUserApplications] = useState<
    Map<string, Application>
  >(new Map());
  const [isAppsLoading, setIsAppsLoading] = useState(true);

  useEffect(() => {
    const fetchUserApplications = async () => {
      if (user && user.role === 'jobSeeker' && user.uid && db) {
        setIsAppsLoading(true);
        const appsQuery = firestoreQuery(
          collection(db, 'applications'),
          where('applicantId', '==', user.uid)
        );
        const snapshot = await getDocs(appsQuery);
        const appsMap = new Map<string, Application>();
        snapshot.forEach((docSnap) => {
          const appData = { id: docSnap.id, ...docSnap.data() } as Application;
          appsMap.set(appData.jobId, appData);
        });
        setUserApplications(appsMap);
        setIsAppsLoading(false);
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
        throw new Error(
          'User not logged in as job seeker or DB not available.'
        );
      }
      if (user.status === 'suspended') {
        throw new Error('Account suspended.');
      }

      const existingApplication = userApplications.get(job.id);
      if (existingApplication) {
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
        throw new Error('Not logged in as job seeker or DB not available');
      }
      if (user.status === 'suspended') {
        throw new Error('Account suspended');
      }

      const application = userApplications.get(jobIdToWithdraw);
      if (!application || !application.id) {
        throw new Error('Application not found');
      }

      if (application.status !== 'Applied') {
        throw new Error(
          `Cannot withdraw application with status: ${application.status}`
        );
      }

      const appDocRef = doc(db, 'applications', application.id);
      await updateDoc(appDocRef, {
        status: 'Withdrawn by Applicant',
        updatedAt: serverTimestamp(),
      });
      const updatedApp = {
        ...application,
        status: 'Withdrawn by Applicant',
      } as Application;
      setUserApplications((prev) =>
        new Map(prev).set(jobIdToWithdraw, updatedApp)
      );
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
        await updateUserProfile({
          savedJobIds: arrayUnion(jobId) as unknown as string[],
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
        await updateUserProfile({
          savedJobIds: arrayRemove(jobId) as unknown as string[],
        });
      }
    },
    [user, updateUserProfile]
  );

  const isJobSaved = useCallback(
    (jobId: string): boolean => {
      return !!user?.savedJobIds?.includes(jobId);
    },
    [user?.savedJobIds]
  );

  const saveSearch = useCallback(
    async (searchName: string, filters: Filters) => {
      if (!user || !user.uid || user.role !== 'jobSeeker') {
        throw new Error('Only job seekers can save searches.');
      }
      if (user.status === 'suspended') {
        throw new Error('Account is suspended.');
      }
      const newSearchObject: SavedSearch = {
        id: uuidv4(),
        name: searchName,
        filters,
        createdAt: new Date(),
      };
      await updateUserProfile({
        savedSearches: arrayUnion(newSearchObject) as unknown as SavedSearch[],
      });
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
        throw new Error('Only job seekers can delete their saved searches.');
      }
      if (user.status === 'suspended') {
        throw new Error('Account is suspended.');
      }
      const searchToDelete = user.savedSearches.find((s) => s.id === searchId);
      if (searchToDelete) {
        const searchToDeleteForFirestore = {
          ...searchToDelete,
          createdAt:
            searchToDelete.createdAt instanceof Date
              ? searchToDelete.createdAt
              : new Date(searchToDelete.createdAt as string),
        };
        await updateUserProfile({
          savedSearches: arrayRemove(
            searchToDeleteForFirestore
          ) as unknown as SavedSearch[],
        });
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
