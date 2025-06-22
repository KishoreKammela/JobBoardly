// src/services/admin.services.ts
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Company, Job, LegalDocument, UserProfile } from '@/types';
import { ADMIN_LIKE_ROLES } from '@/app/admin/_lib/constants';

export const getPlatformStats = async () => {
  const jobSeekersCountSnap = await getCountFromServer(
    query(collection(db, 'users'), where('role', '==', 'jobSeeker'))
  );
  const companiesCountSnap = await getCountFromServer(
    collection(db, 'companies')
  );
  const totalJobsCountSnap = await getCountFromServer(collection(db, 'jobs'));
  const approvedJobsCountSnap = await getCountFromServer(
    query(collection(db, 'jobs'), where('status', '==', 'approved'))
  );
  const applicationsCountSnap = await getCountFromServer(
    collection(db, 'applications')
  );

  return {
    totalJobSeekers: jobSeekersCountSnap.data().count,
    totalCompanies: companiesCountSnap.data().count,
    totalJobs: totalJobsCountSnap.data().count,
    approvedJobs: approvedJobsCountSnap.data().count,
    totalApplications: applicationsCountSnap.data().count,
  };
};

export const getPendingJobs = async () => {
  const pendingJobsQuery = query(
    collection(db, 'jobs'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const pendingJobsSnapshot = await getDocs(pendingJobsQuery);
  return pendingJobsSnapshot.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
      applicantCount: 0, // Placeholder, not fetched here for perf
    } as Job & { applicantCount: number };
  });
};

export const getPendingCompanies = async () => {
  const pendingCompaniesQuery = query(
    collection(db, 'companies'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const pendingCompaniesSnapshot = await getDocs(pendingCompaniesQuery);
  return pendingCompaniesSnapshot.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
    } as Company;
  });
};

export const getAllCompaniesForAdmin = async (): Promise<Company[]> => {
  const allCompaniesQuery = query(
    collection(db, 'companies'),
    orderBy('createdAt', 'desc')
  );
  const allCompaniesSnapshot = await getDocs(allCompaniesQuery);
  return await Promise.all(
    allCompaniesSnapshot.docs.map(async (companyDoc) => {
      const companyData = companyDoc.data();
      const jobCountSnap = await getCountFromServer(
        query(collection(db, 'jobs'), where('companyId', '==', companyDoc.id))
      );
      const appCountSnap = await getCountFromServer(
        query(
          collection(db, 'applications'),
          where('companyId', '==', companyDoc.id)
        )
      );
      return {
        ...companyData,
        id: companyDoc.id,
        createdAt: (companyData.createdAt as Timestamp)?.toDate().toISOString(),
        updatedAt: (companyData.updatedAt as Timestamp)?.toDate().toISOString(),
        jobCount: jobCountSnap.data().count,
        applicationCount: appCountSnap.data().count,
      } as Company;
    })
  );
};

export const getAllJobsForAdmin = async (): Promise<
  (Job & { applicantCount: number })[]
> => {
  const allJobsQuery = query(
    collection(db, 'jobs'),
    orderBy('createdAt', 'desc')
  );
  const allJobsSnapshot = await getDocs(allJobsQuery);
  return await Promise.all(
    allJobsSnapshot.docs.map(async (jobDoc) => {
      const jobData = jobDoc.data();
      const applicantCountSnap = await getCountFromServer(
        query(collection(db, 'applications'), where('jobId', '==', jobDoc.id))
      );
      return {
        ...jobData,
        id: jobDoc.id,
        applicantCount: applicantCountSnap.data().count,
        createdAt: (jobData.createdAt as Timestamp)?.toDate().toISOString(),
        updatedAt: (jobData.updatedAt as Timestamp)?.toDate().toISOString(),
      } as Job & { applicantCount: number };
    })
  );
};

export const getAllJobSeekersForAdmin = async (): Promise<UserProfile[]> => {
  const jobSeekersQuery = query(
    collection(db, 'users'),
    where('role', '==', 'jobSeeker'),
    orderBy('createdAt', 'desc')
  );
  const jobSeekersSnapshot = await getDocs(jobSeekersQuery);
  return jobSeekersSnapshot.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      uid: d.id,
      createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
      lastActive: (data.lastActive as Timestamp)?.toDate().toISOString(),
      jobsAppliedCount: (data.appliedJobIds || []).length,
    } as UserProfile;
  });
};

export const getAllPlatformUsersForAdmin = async (): Promise<UserProfile[]> => {
  const platformUsersQuery = query(
    collection(db, 'users'),
    where('role', 'in', ADMIN_LIKE_ROLES),
    orderBy('createdAt', 'desc')
  );
  const platformUsersSnapshot = await getDocs(platformUsersQuery);
  return platformUsersSnapshot.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      uid: d.id,
      createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
      lastActive: (data.lastActive as Timestamp)?.toDate().toISOString(),
    } as UserProfile;
  });
};

export const getLegalDocumentContent = async (
  docId: 'privacyPolicy' | 'termsOfService'
): Promise<LegalDocument | null> => {
  if (!db) return null;
  const docRef = doc(db, 'legalContent', docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      content: data.content || '',
      lastUpdated:
        data.lastUpdated instanceof Timestamp
          ? data.lastUpdated.toDate().toISOString()
          : new Date().toISOString(),
    } as LegalDocument;
  }
  return null;
};

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
