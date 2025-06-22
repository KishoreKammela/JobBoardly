// src/services/application.services.ts
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Application,
  ApplicationAnswer,
  ApplicationStatus,
} from '@/types';

export const getUserApplications = async (
  userId: string
): Promise<Map<string, Application>> => {
  if (!db) throw new Error('Firestore not initialized');
  const appsQuery = query(
    collection(db, 'applications'),
    where('applicantId', '==', userId)
  );
  const snapshot = await getDocs(appsQuery);
  const appsMap = new Map<string, Application>();
  snapshot.forEach((docSnap) => {
    const appData = { id: docSnap.id, ...docSnap.data() } as Application;
    appsMap.set(appData.jobId, appData);
  });
  return appsMap;
};

export const createApplicationInDb = async (
  newApplicationData: Omit<Application, 'id' | 'appliedAt' | 'updatedAt'> & {
    appliedAt: Timestamp;
    updatedAt: Timestamp;
  }
): Promise<Application> => {
  const applicationRef = doc(collection(db, 'applications'));
  await setDoc(applicationRef, newApplicationData as Record<string, unknown>);
  return {
    id: applicationRef.id,
    ...newApplicationData,
    appliedAt: newApplicationData.appliedAt.toDate().toISOString(),
    updatedAt: newApplicationData.updatedAt.toDate().toISOString(),
  };
};

export const updateApplicationStatusInDb = async (
  applicationId: string,
  newStatus: ApplicationStatus,
  employerNotes?: string
): Promise<void> => {
  const applicationDocRef = doc(db, 'applications', applicationId);
  const updates: { [key: string]: unknown } = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  };
  if (employerNotes !== undefined) {
    updates.employerNotes = employerNotes;
  }
  await updateDoc(applicationDocRef, updates);
};

export const getApplicationsForJob = async (
  jobId: string
): Promise<Application[]> => {
  if (!db) throw new Error('Firestore not initialized');
  const appsQuery = query(
    collection(db, 'applications'),
    where('jobId', '==', jobId)
  );
  const snapshot = await getDocs(appsQuery);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      appliedAt:
        data.appliedAt instanceof Timestamp
          ? data.appliedAt.toDate().toISOString()
          : data.appliedAt,
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
    } as Application;
  });
};
