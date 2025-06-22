// src/services/job.services.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
  getCountFromServer,
  documentId,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Job } from '@/types';

export const getApprovedJobs = async (): Promise<Job[]> => {
  const jobsCollectionRef = collection(db, 'jobs');
  const q = query(
    jobsCollectionRef,
    where('status', '==', 'approved'),
    orderBy('postedDate', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      postedDate:
        data.postedDate instanceof Timestamp
          ? data.postedDate.toDate().toISOString().split('T')[0]
          : data.postedDate,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
    } as Job;
  });
};

export const getJobById = async (jobId: string): Promise<Job | null> => {
  const jobDocRef = doc(db, 'jobs', jobId);
  const jobDocSnap = await getDoc(jobDocRef);
  if (jobDocSnap.exists()) {
    const data = jobDocSnap.data();
    return {
      id: jobDocSnap.id,
      ...data,
      postedDate:
        data.postedDate instanceof Timestamp
          ? data.postedDate.toDate().toISOString().split('T')[0]
          : (data.postedDate as string),
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : (data.createdAt as string),
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : (data.updatedAt as string),
      applicationDeadline:
        data.applicationDeadline instanceof Timestamp
          ? data.applicationDeadline.toDate().toISOString().split('T')[0]
          : (data.applicationDeadline as string | undefined),
      screeningQuestions: data.screeningQuestions || [],
      benefits: data.benefits || '',
    } as Job;
  }
  return null;
};

export const getJobsByCompany = async (companyId: string): Promise<Job[]> => {
  const jobsQuery = query(
    collection(db, 'jobs'),
    where('companyId', '==', companyId),
    where('status', '==', 'approved'),
    orderBy('postedDate', 'desc')
  );
  const jobsSnap = await getDocs(jobsQuery);
  return jobsSnap.docs.map((d) => {
    const jobData = d.data();
    return {
      id: d.id,
      ...jobData,
      postedDate:
        jobData.postedDate instanceof Timestamp
          ? jobData.postedDate.toDate().toISOString().split('T')[0]
          : jobData.postedDate,
      createdAt:
        jobData.createdAt instanceof Timestamp
          ? jobData.createdAt.toDate().toISOString()
          : jobData.createdAt,
      updatedAt:
        jobData.updatedAt instanceof Timestamp
          ? jobData.updatedAt.toDate().toISOString()
          : jobData.updatedAt,
    } as Job;
  });
};

export const getJobsByIds = async (
  jobIds: string[]
): Promise<Map<string, Job>> => {
  const jobsMap = new Map<string, Job>();
  if (jobIds.length === 0) return jobsMap;

  const batchSize = 30; // Firestore 'in' query limit
  for (let i = 0; i < jobIds.length; i += batchSize) {
    const batchIds = jobIds.slice(i, i + batchSize);
    if (batchIds.length > 0) {
      const q = query(
        collection(db, 'jobs'),
        where(documentId(), 'in', batchIds)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          jobsMap.set(docSnap.id, {
            id: docSnap.id,
            ...data,
            postedDate:
              data.postedDate instanceof Timestamp
                ? data.postedDate.toDate().toISOString().split('T')[0]
                : data.postedDate,
          } as Job);
        }
      });
    }
  }
  return jobsMap;
};

export const getCompanyJobsForDashboard = async (
  companyId: string
): Promise<(Job & { applicantCount: number })[]> => {
  const jobsCollectionRef = collection(db, 'jobs');
  const q = query(
    jobsCollectionRef,
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);

  const jobsDataPromises = querySnapshot.docs.map(async (doc) => {
    const data = doc.data();
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('jobId', '==', doc.id)
    );
    const snapshot = await getCountFromServer(applicationsQuery);
    const applicantCount = snapshot.data().count;

    return {
      id: doc.id,
      ...data,
      applicantCount,
      postedDate:
        data.postedDate instanceof Timestamp
          ? data.postedDate.toDate().toISOString().split('T')[0]
          : data.postedDate,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
    } as Job & { applicantCount: number };
  });

  return Promise.all(jobsDataPromises);
};

export const saveJobInDb = async (
  jobPayload: Record<string, unknown>
): Promise<void> => {
  if (jobPayload.id) {
    const jobId = jobPayload.id as string;
    delete jobPayload.id;
    const jobDocRef = doc(db, 'jobs', jobId);
    await updateDoc(jobDocRef, jobPayload);
  } else {
    jobPayload.postedDate = new Date().toISOString().split('T')[0];
    jobPayload.createdAt = serverTimestamp();
    const jobsCollectionRef = collection(db, 'jobs');
    await addDoc(jobsCollectionRef, jobPayload);
  }
};
