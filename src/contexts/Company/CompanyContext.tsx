// src/contexts/Company/CompanyContext.tsx
'use client';
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useCallback,
} from 'react';
import { db } from '@/lib/firebase';
import type { Company, UserProfile } from '@/types';
import { useUserProfile } from '../UserProfile/UserProfileContext';
import { getCompanyRecruiters } from '@/services/company.services';

interface CompanyContextType {
  company: Company | null;
  recruiters: UserProfile[];
  loading: boolean;
  updateCompanyProfile: (
    companyId: string,
    updatedData: Partial<Company>
  ) => Promise<void>;
  inviteRecruiter: (name: string, email: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUserProfile();
  const [company, setCompany] = useState<Company | null>(null);
  const [recruiters, setRecruiters] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanyAndRecruiters = useCallback(async (companyId: string) => {
    setLoading(true);
    const companyDocRef = doc(db, 'companies', companyId);
    try {
      const companyDocSnap = await getDoc(companyDocRef);
      if (companyDocSnap.exists()) {
        const companyRawData = companyDocSnap.data();
        const processedCompanyData = {
          id: companyDocSnap.id,
          ...companyRawData,
          createdAt:
            companyRawData.createdAt instanceof Timestamp
              ? companyRawData.createdAt.toDate().toISOString()
              : companyRawData.createdAt,
          updatedAt:
            companyRawData.updatedAt instanceof Timestamp
              ? companyRawData.updatedAt.toDate().toISOString()
              : companyRawData.updatedAt,
        } as Company;
        setCompany(processedCompanyData);

        if (
          processedCompanyData.recruiterUids &&
          processedCompanyData.recruiterUids.length > 0
        ) {
          const fetchedRecruiters = await getCompanyRecruiters(
            processedCompanyData.recruiterUids
          );
          setRecruiters(fetchedRecruiters);
        } else {
          setRecruiters([]);
        }
      } else {
        setCompany(null);
        setRecruiters([]);
        console.warn(`Company with ID ${companyId} not found.`);
      }
    } catch (error) {
      console.error('Error fetching company and recruiters:', error);
      setCompany(null);
      setRecruiters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userLoading) {
      if (user && user.companyId) {
        fetchCompanyAndRecruiters(user.companyId);
      } else {
        setCompany(null);
        setRecruiters([]);
        setLoading(false);
      }
    }
  }, [user, userLoading, fetchCompanyAndRecruiters]);

  const updateCompanyProfile = async (
    companyId: string,
    updatedData: Partial<Company>
  ) => {
    if (!db) {
      throw new Error('Firestore db instance not available.');
    }
    if (user?.companyId !== companyId || !user.isCompanyAdmin) {
      throw new Error('Unauthorized to update company profile.');
    }
    const companyDocRef = doc(db, 'companies', companyId);
    const dataToUpdate: { [key: string]: unknown } = {
      ...updatedData,
      updatedAt: serverTimestamp(),
    };
    delete dataToUpdate.id;

    await updateDoc(companyDocRef, dataToUpdate);
    setCompany(
      (prevCompany) =>
        ({ ...prevCompany, ...dataToUpdate, id: companyId }) as Company
    );
  };

  const inviteRecruiter = useCallback(
    async (name: string, email: string) => {
      if (!company) {
        throw new Error('No company context available for invitation.');
      }
      const companyRef = doc(db, 'companies', company.id);
      const newInvitation = {
        email: email,
        name: name,
        status: 'pending' as const,
      };
      await updateDoc(companyRef, {
        invitations: arrayUnion(newInvitation),
        pendingInvitationEmails: arrayUnion(email),
      });
      setCompany(
        (prev) =>
          ({
            ...prev,
            invitations: [...(prev?.invitations || []), newInvitation],
            pendingInvitationEmails: [
              ...(prev?.pendingInvitationEmails || []),
              email,
            ],
          }) as Company
      );
    },
    [company]
  );

  return (
    <CompanyContext.Provider
      value={{
        company,
        recruiters,
        loading,
        updateCompanyProfile,
        inviteRecruiter,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
