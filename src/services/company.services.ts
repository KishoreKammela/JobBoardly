// src/services/company.services.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Company, RecruiterInvitation } from '@/types';

export const getCompanyProfile = async (
  companyId: string
): Promise<Company | null> => {
  if (!db) return null;
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
  if (!db) return [];
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

export const updateCompanyProfileAndSetPending = async (
  companyId: string,
  updatedData: Partial<Company>
) => {
  if (!db) throw new Error('Firestore db instance not available.');
  const companyRef = doc(db, 'companies', companyId);
  await updateDoc(companyRef, {
    ...updatedData,
    status: 'pending',
    updatedAt: serverTimestamp(),
  });
};

export const getCompanyRecruiters = async (
  recruiterUids: string[]
): Promise<UserProfile[]> => {
  if (!db || recruiterUids.length === 0) return [];
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

export const createRecruiterInvitation = async (
  companyId: string,
  companyName: string,
  recruiterName: string,
  recruiterEmail: string
): Promise<string> => {
  if (!db) throw new Error('Firestore db instance not available.');
  const invitationsRef = collection(db, 'invitations');
  const newInvitation = {
    companyId,
    companyName,
    recruiterEmail: recruiterEmail.toLowerCase(),
    recruiterName,
    status: 'pending' as const,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(invitationsRef, newInvitation);
  return docRef.id;
};

export const getInvitationDetails = async (
  invitationId: string
): Promise<RecruiterInvitation | null> => {
  if (!db) return null;
  const invitationRef = doc(db, 'invitations', invitationId);
  const invitationSnap = await getDoc(invitationRef);
  if (invitationSnap.exists()) {
    const data = invitationSnap.data();
    return {
      id: invitationSnap.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
    } as RecruiterInvitation;
  }
  return null;
};

export const getCompanyInvitations = async (
  companyId: string
): Promise<RecruiterInvitation[]> => {
  if (!db) return [];
  const invitationsQuery = query(
    collection(db, 'invitations'),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );
  const invitationsSnap = await getDocs(invitationsQuery);
  return invitationsSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
    } as RecruiterInvitation;
  });
};
