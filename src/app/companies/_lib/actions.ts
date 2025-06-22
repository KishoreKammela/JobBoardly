// src/app/companies/_lib/actions.ts
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Company } from '@/types';

export const fetchCompanies = async (
  setAllCompanies: (companies: Company[]) => void,
  setFilteredCompanies: (companies: Company[]) => void,
  setError: (error: string | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);
  setError(null);
  try {
    const companiesCollectionRef = collection(db, 'companies');
    const q = query(
      companiesCollectionRef,
      where('status', '==', 'approved'),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const companiesData = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
      } as Company;
    });
    setAllCompanies(companiesData);
    setFilteredCompanies(companiesData);
  } catch (e: unknown) {
    console.error('Error fetching companies:', e);
    setError(
      `Failed to load companies. Please try again later. Error: ${(e as Error).message}`
    );
  } finally {
    setIsLoading(false);
  }
};
