'use client';
import { db } from '@/lib/firebase';
import { type Company } from '@/types';
import {
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
} from 'react';
import { useUserProfile } from '../UserProfile/UserProfileContext';

interface CompanyContextType {
  company: Company | null;
  loading: boolean;
  updateCompanyProfile: (
    companyId: string,
    updatedData: Partial<Company>
  ) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUserProfile();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user || !user.companyId) {
        setCompany(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const companyDocRef = doc(db, 'companies', user.companyId);
      const companyDocSnap = await getDoc(companyDocRef);
      if (companyDocSnap.exists()) {
        const companyRawData = companyDocSnap.data();
        setCompany({
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
        } as Company);
      } else {
        setCompany(null);
        console.warn(`Company with ID ${user.companyId} not found.`);
      }
      setLoading(false);
    };

    if (!userLoading) {
      fetchCompany();
    }
  }, [user, userLoading]);

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

  return (
    <CompanyContext.Provider value={{ company, loading, updateCompanyProfile }}>
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
