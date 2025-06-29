'use client';
import {
  arrayUnion,
  arrayRemove,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import React, {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import type {
  ApplicationStatus,
  CandidateFilters,
  SavedCandidateSearch,
} from '@/types';
import { useUserProfile } from '../UserProfile/UserProfileContext';
import { useCompany } from '../Company/CompanyContext';

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
  const { user, updateUserProfile } = useUserProfile();
  const { company } = useCompany();

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

      await updateUserProfile({
        savedCandidateSearches: arrayUnion(
          newSearchObject
        ) as unknown as SavedCandidateSearch[],
      });
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
        await updateUserProfile({
          savedCandidateSearches: arrayRemove(
            searchToDeleteForFirestore
          ) as unknown as SavedCandidateSearch[],
        });
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
      if (!user || user.role !== 'employer' || !db) {
        throw new Error(
          'Only employers can update application status / DB not available.'
        );
      }
      if (company?.status === 'suspended' || company?.status === 'deleted') {
        toast({
          title: 'Company Account Restricted',
          description:
            'Cannot update application status as your company account is currently restricted.',
          variant: 'destructive',
        });
        throw new Error('Company account restricted.');
      }
      const applicationDocRef = doc(db, 'applications', applicationId);
      const updates: { [key: string]: unknown } = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };
      if (employerNotes !== undefined) {
        updates.employerNotes = employerNotes;
      }

      await updateDoc(applicationDocRef, updates);
    },
    [user, company]
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
