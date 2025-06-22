// src/services/company.services.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Company, UserProfile } from '@/types';

export const getCompanyProfile = async (
  companyId: string
): Promise<Company | null> => {
  const companyDocRef = doc(db, 'companies', companyId);
  const companyDocSnap = await getDoc(companyDocRef);
  if (companyDocSnap.exists()) {
    const rawData = companyDocSnap.data();
    return {
      id: companyDocSnap.id,
      ...rawData,
      createdAt:
        rawData.createdAt instanceof Timestamp
          ? rawData.createdAt.toDate().toISOString()
          : rawData.createdAt,
      updatedAt:
        rawData.updatedAt instanceof Timestamp
          ? rawData.updatedAt.toDate().toISOString()
          : rawData.updatedAt,
    } as Company;
  }
  return null;
};

export const getApprovedCompanies = async (): Promise<Company[]> => {
  const companiesCollectionRef = collection(db, 'companies');
  const q = query(
    companiesCollectionRef,
    where('status', '==', 'approved'),
    orderBy('name', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
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
};

export const updateCompanyProfileInDb = async (
  companyId: string,
  updatedData: Partial<Company>
) => {
  if (!db) throw new Error('Firestore db instance not available.');
  const companyDocRef = doc(db, 'companies', companyId);
  await updateDoc(companyDocRef, updatedData);
};

export const getCompanyRecruiters = async (
  recruiterUids: string[]
): Promise<UserProfile[]> => {
  if (recruiterUids.length === 0) return [];
  const recruitersQueryLimit = 30;
  const fetchedRecruiters: UserProfile[] = [];
  for (let i = 0; i < recruiterUids.length; i += recruitersQueryLimit) {
    const batchUids = recruiterUids.slice(i, i + recruitersQueryLimit);
    if (batchUids.length > 0) {
      const recruitersQuery = query(
        collection(db, 'users'),
        where('__name__', 'in', batchUids)
      );
      const recruitersSnap = await getDocs(recruitersQuery);
      recruitersSnap.docs.forEach((d) =>
        fetchedRecruiters.push({ uid: d.id, ...d.data() } as UserProfile)
      );
    }
  }
  return fetchedRecruiters;
};
