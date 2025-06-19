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
import { useAuth } from './AuthContext'; // Import useAuth to access core user, company and updateUserProfile

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
  const { user, company, updateUserProfile } = useAuth(); // Use the core AuthContext

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
        filters,
        createdAt: new Date(),
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
              ? searchToDelete.createdAt
              : new Date(searchToDelete.createdAt as string),
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
        // Allow explicitly clearing notes
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
