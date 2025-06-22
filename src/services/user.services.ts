// src/services/user.services.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  orderBy,
  arrayUnion,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Company, UserProfile, UserRole } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';

export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  const userDocRef = doc(db, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    const data = userDocSnap.data();
    return {
      uid: userId,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
      lastActive:
        data.lastActive instanceof Timestamp
          ? data.lastActive.toDate().toISOString()
          : data.lastActive,
    } as UserProfile;
  }
  return null;
};

export const updateUserProfileInDb = async (
  userId: string,
  updatedData: Partial<UserProfile>
): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

export const createUserProfileInDb = async (
  fbUser: FirebaseUser,
  name: string,
  role: UserRole,
  companyNameForNewCompany?: string
): Promise<Partial<UserProfile>> => {
  if (!db) throw new Error("Firestore 'db' instance is not available.");
  if (!fbUser.email) throw new Error('User email is not available.');

  const userDocRef = doc(db, 'users', fbUser.uid);
  let userCompanyId: string | undefined = undefined;
  let userIsCompanyAdmin = false;

  const ADMIN_LIKE_ROLES: UserRole[] = [
    'admin',
    'superAdmin',
    'moderator',
    'supportAgent',
    'dataAnalyst',
    'complianceOfficer',
    'systemMonitor',
  ];

  // Check for pending invitations
  const invitationsQuery = query(
    collection(db, 'companies'),
    where(
      'pendingInvitationEmails',
      'array-contains',
      fbUser.email.toLowerCase()
    )
  );
  const invitationSnapshot = await getDocs(invitationsQuery);

  if (!invitationSnapshot.empty && role === 'employer') {
    // User is accepting an invitation
    const companyDoc = invitationSnapshot.docs[0];
    userCompanyId = companyDoc.id;
    const companyData = companyDoc.data() as Company;

    await runTransaction(db, async (transaction) => {
      const companyRef = doc(db, 'companies', userCompanyId!);
      const newInvitations = (companyData.invitations || []).map((inv) =>
        inv.email.toLowerCase() === fbUser.email!.toLowerCase()
          ? { ...inv, status: 'accepted' as const }
          : inv
      );
      const newPendingEmails = (
        companyData.pendingInvitationEmails || []
      ).filter((email) => email.toLowerCase() !== fbUser.email!.toLowerCase());

      transaction.update(companyRef, {
        recruiterUids: arrayUnion(fbUser.uid),
        invitations: newInvitations,
        pendingInvitationEmails: newPendingEmails,
      });
    });
  } else if (role === 'employer' && companyNameForNewCompany) {
    // User is registering a new company
    const newCompanyRef = doc(collection(db, 'companies'));
    const newCompanyData = {
      name: companyNameForNewCompany || 'New Company',
      adminUids: [fbUser.uid],
      recruiterUids: [fbUser.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending',
      moderationReason: '',
      invitations: [],
      pendingInvitationEmails: [],
    };
    await setDoc(newCompanyRef, newCompanyData);
    userCompanyId = newCompanyRef.id;
    userIsCompanyAdmin = true;
  }

  let defaultName = 'New User';
  if (role === 'employer') defaultName = 'Recruiter';
  else if (ADMIN_LIKE_ROLES.includes(role)) defaultName = 'Platform Staff';

  const userProfileData: Partial<UserProfile> = {
    uid: fbUser.uid,
    email: fbUser.email,
    name: name || fbUser.displayName || defaultName,
    role: role,
    avatarUrl: fbUser.photoURL || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActive: serverTimestamp(),
    status: 'active',
    theme: 'system',
    jobBoardDisplay: 'list',
    itemsPerPage: 10,
    jobAlerts: {
      newJobsMatchingProfile: true,
      savedSearchAlerts: false,
      applicationStatusUpdates: true,
    },
  };

  if (role === 'employer') {
    userProfileData.companyId = userCompanyId;
    userProfileData.isCompanyAdmin = userIsCompanyAdmin;
  }

  const finalProfileDataForFirestore: Record<string, unknown> = {};
  for (const key in userProfileData) {
    const typedKey = key as keyof UserProfile;
    const value = userProfileData[typedKey];
    if (value !== undefined) {
      finalProfileDataForFirestore[key] = value;
    }
  }

  await setDoc(userDocRef, finalProfileDataForFirestore, { merge: true });
  return userProfileData;
};

export const getSearchableCandidates = async (): Promise<UserProfile[]> => {
  const usersCollectionRef = collection(db, 'users');
  const q = query(
    usersCollectionRef,
    where('role', '==', 'jobSeeker'),
    where('isProfileSearchable', '==', true),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
      lastActive:
        data.lastActive instanceof Timestamp
          ? data.lastActive.toDate().toISOString()
          : data.lastActive,
    } as UserProfile;
  });
};
