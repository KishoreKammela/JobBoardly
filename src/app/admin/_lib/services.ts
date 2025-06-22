// src/app/admin/_lib/services.ts
import { db } from '@/lib/firebase';
import type { Company, UserRole } from '@/types';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export const updateJobStatusInDb = async (
  jobId: string,
  newStatus: 'approved' | 'rejected' | 'suspended',
  reason?: string
): Promise<{ moderationReason: string | null }> => {
  const jobUpdates: Record<string, unknown> = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  };
  if (
    newStatus === 'rejected' ||
    newStatus === 'suspended' ||
    (newStatus === 'approved' && reason)
  ) {
    jobUpdates.moderationReason =
      reason ||
      `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} by admin`;
  } else {
    jobUpdates.moderationReason = null;
  }

  await updateDoc(doc(db, 'jobs', jobId), jobUpdates);
  return { moderationReason: jobUpdates.moderationReason as string | null };
};

export const updateCompanyStatusInDb = async (
  companyId: string,
  intendedStatus: 'approved' | 'rejected' | 'suspended' | 'active' | 'deleted',
  reason?: string
): Promise<{
  finalStatus: Company['status'];
  moderationReason: string | null;
}> => {
  let finalStatus: Company['status'] = intendedStatus;
  if (intendedStatus === 'active') {
    finalStatus = 'approved';
  }

  const companyDocRef = doc(db, 'companies', companyId);
  const updateData: Record<string, unknown> = {
    status: finalStatus,
    updatedAt: serverTimestamp(),
  };
  if (
    finalStatus === 'rejected' ||
    finalStatus === 'suspended' ||
    finalStatus === 'deleted' ||
    (finalStatus === 'approved' && reason)
  ) {
    updateData.moderationReason =
      reason ||
      `${finalStatus.charAt(0).toUpperCase() + finalStatus.slice(1)} by admin`;
  } else {
    updateData.moderationReason = null;
  }

  await updateDoc(companyDocRef, updateData);
  return {
    finalStatus,
    moderationReason: updateData.moderationReason as string | null,
  };
};

export const updateUserStatusInDb = async (
  userId: string,
  newStatus: 'active' | 'suspended' | 'deleted'
): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
};

export const saveLegalDocumentInDb = async (
  docId: 'privacyPolicy' | 'termsOfService',
  content: string
): Promise<void> => {
  const legalDocRef = doc(db, 'legalContent', docId);
  await setDoc(legalDocRef, {
    content: content,
    lastUpdated: serverTimestamp(),
  });
};
