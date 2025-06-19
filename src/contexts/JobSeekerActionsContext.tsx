'use client';
import type {
  UserProfile,
  Filters,
  SavedSearch,
  Application,
  ApplicationStatus,
  Job,
} from '@/types';
import React, {
  createContext,
  useContext,
  type ReactNode,
  useCallback,
} from 'react';
import { auth, db } from '@/lib/firebase';
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface JobSeekerActionsContextType {
  applyForJob: (job: Job) => Promise<void>;
  hasAppliedForJob: (jobId: string) => boolean;
  saveJob: (jobId: string) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  isJobSaved: (jobId: string) => boolean;
  saveSearch: (searchName: string, filters: Filters) => Promise<void>;
  deleteSearch: (searchId: string) => Promise<void>;
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

  const applyForJob = useCallback(
    async (job: Job) => {
      if (user && user.uid && user.role === 'jobSeeker') {
        if (user.status === 'suspended') {
          toast({
            title: 'Account Suspended',
            description:
              'Your account is currently suspended. You cannot apply for jobs.',
            variant: 'destructive',
          });
          return;
        }
        const currentAppliedJobIds = user.appliedJobIds || [];
        if (!currentAppliedJobIds.includes(job.id)) {
          const applicationRef = doc(collection(db, 'applications'));
          const newApplication: Omit<Application, 'id'> = {
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
          };

          try {
            await setDoc(
              applicationRef,
              newApplication as Record<string, unknown>
            );
            await updateUserProfile({
              appliedJobIds: arrayUnion(job.id) as unknown as string[],
            });
          } catch (error: unknown) {
            console.error('JobSeekerActionsContext: applyForJob error', error);
            throw error;
          }
        }
      } else {
        console.warn('User must be a logged-in job seeker to apply for a job.');
        toast({
          title: 'Login Required',
          description: 'Please log in as a job seeker to apply.',
          variant: 'destructive',
        });
      }
    },
    [user, updateUserProfile]
  );

  const hasAppliedForJob = useCallback(
    (jobId: string): boolean => {
      if (user && user.role === 'jobSeeker' && user.appliedJobIds) {
        return user.appliedJobIds.includes(jobId);
      }
      return false;
    },
    [user]
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
        console.warn('User must be a logged-in job seeker to save a job.');
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
        console.warn('User must be a logged-in job seeker to unsave a job.');
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
        saveJob,
        unsaveJob,
        isJobSaved,
        saveSearch,
        deleteSearch,
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
