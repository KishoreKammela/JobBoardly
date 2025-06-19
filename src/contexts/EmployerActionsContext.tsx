'use client';
import type {
  UserProfile,
  CandidateFilters,
  SavedCandidateSearch,
  ApplicationStatus,
  Company,
} from '@/types';
import React, {
  createContext,
  useContext,
  type ReactNode,
  useCallback,
} from 'react';
import { db } from '@/lib/firebase';
import {
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface EmployerActionsContextType {
  saveCandidateSearch: (
    searchName: string,
    filters: CandidateFilters
  ) => Promise<void>;
  deleteCandidateSearch: (searchId: string) => Promise<void>;
  updateApplicationStatus: (
    applicationId: string,
    newStatus: ApplicationStatus,
    employerNotes?: string
  ) => Promise<void>;
}

const EmployerActionsContext = createContext<
  EmployerActionsContextType | undefined
>(undefined);

export function EmployerActionsProvider({ children }: { children: ReactNode }) {
  const { user, company, updateUserProfile } = useAuth();

  const saveCandidateSearch = useCallback(
    async (searchName: string, filters: CandidateFilters) => {
      if (!user || !user.uid || user.role !== 'employer') {
        toast({
          title: 'Action Denied',
          description: 'Only employers can save candidate searches.',
          variant: 'destructive',
        });
        return;
      }
      if (company?.status === 'suspended' || company?.status === 'deleted') {
        toast({
          title: 'Company Account Restricted',
          description:
            'Cannot save searches as your company account is currently restricted.',
          variant: 'destructive',
        });
        return;
      }

      const newSearchObject: SavedCandidateSearch = {
        id: uuidv4(),
        name: searchName,
        filters: {
          searchTerm: filters.searchTerm,
          location: filters.location,
          availability: filters.availability,
          jobSearchStatus: filters.jobSearchStatus ?? null,
          desiredSalaryMin: filters.desiredSalaryMin ?? null,
          desiredSalaryMax: filters.desiredSalaryMax ?? null,
          recentActivity: filters.recentActivity ?? null,
          minExperienceYears: filters.minExperienceYears ?? null,
        },
        createdAt: new Date(), // Firestore will convert this to a Timestamp
      };

      try {
        await updateUserProfile({
          savedCandidateSearches: arrayUnion(
            newSearchObject
          ) as unknown as SavedCandidateSearch[],
        });
      } catch (error: unknown) {
        console.error(
          'EmployerActionsContext: saveCandidateSearch error',
          error
        );
        throw error;
      }
    },
    [user, company, updateUserProfile]
  );

  const deleteCandidateSearch = useCallback(
    async (searchId: string) => {
      if (
        !user ||
        !user.uid ||
        user.role !== 'employer' ||
        !user.savedCandidateSearches
      ) {
        toast({
          title: 'Action Denied',
          description:
            'Only employers can delete their saved candidate searches.',
          variant: 'destructive',
        });
        return;
      }
      if (company?.status === 'suspended' || company?.status === 'deleted') {
        toast({
          title: 'Company Account Restricted',
          description:
            'Cannot delete searches as your company account is currently restricted.',
          variant: 'destructive',
        });
        return;
      }
      const searchToDelete = user.savedCandidateSearches.find(
        (s) => s.id === searchId
      );

      if (searchToDelete) {
        const searchToDeleteForFirestore = {
          ...searchToDelete,
          createdAt:
            searchToDelete.createdAt instanceof Date
              ? searchToDelete.createdAt // Already a Date object
              : new Date(searchToDelete.createdAt as string), // Convert string/Timestamp to Date
          filters: {
            // Ensure nulls are preserved if they were stored as such
            searchTerm: searchToDelete.filters.searchTerm,
            location: searchToDelete.filters.location,
            availability: searchToDelete.filters.availability,
            jobSearchStatus: searchToDelete.filters.jobSearchStatus ?? null,
            desiredSalaryMin: searchToDelete.filters.desiredSalaryMin ?? null,
            desiredSalaryMax: searchToDelete.filters.desiredSalaryMax ?? null,
            recentActivity: searchToDelete.filters.recentActivity ?? null,
            minExperienceYears:
              searchToDelete.filters.minExperienceYears ?? null,
          },
        };
        try {
          await updateUserProfile({
            savedCandidateSearches: arrayRemove(
              searchToDeleteForFirestore
            ) as unknown as SavedCandidateSearch[],
          });
        } catch (error: unknown) {
          console.error(
            'EmployerActionsContext: deleteCandidateSearch error',
            error
          );
          throw error;
        }
      }
    },
    [user, company, updateUserProfile]
  );

  const updateApplicationStatus = useCallback(
    async (
      applicationId: string,
      newStatus: ApplicationStatus,
      employerNotes?: string
    ) => {
      if (!user || user.role !== 'employer') {
        throw new Error('Only employers can update application status.');
      }
      const applicationDocRef = doc(db, 'applications', applicationId);
      const updates: { [key: string]: unknown } = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };
      if (employerNotes !== undefined) {
        updates.employerNotes = employerNotes;
      } else if (employerNotes === '') {
        updates.employerNotes = null;
      }

      try {
        await updateDoc(applicationDocRef, updates);
      } catch (error: unknown) {
        console.error(
          'EmployerActionsContext: updateApplicationStatus error',
          error
        );
        throw error;
      }
    },
    [user]
  );

  return (
    <EmployerActionsContext.Provider
      value={{
        saveCandidateSearch,
        deleteCandidateSearch,
        updateApplicationStatus,
      }}
    >
      {children}
    </EmployerActionsContext.Provider>
  );
}

export function useEmployerActions() {
  const context = useContext(EmployerActionsContext);
  if (context === undefined) {
    throw new Error(
      'useEmployerActions must be used within an EmployerActionsProvider'
    );
  }
  return context;
}
