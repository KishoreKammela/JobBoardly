'use client';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type AuthProvider as FirebaseAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
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

import { auth, db } from '@/lib/firebase';
import type { Company, UserProfile, UserRole } from '@/types';
import { toast as globalToast } from '@/hooks/use-toast';
import { useJobSeekerActions } from '../JobSeekerActionsContext/JobSeekerActionsContext';
import { useEmployerActions } from '../EmployerActionsContext/EmployerActionsContext';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  registerUser: (
    email: string,
    pass: string,
    name: string,
    role: UserRole,
    companyName?: string
  ) => Promise<FirebaseUser>;
  loginUser: (email: string, pass: string) => Promise<FirebaseUser>;
  signInWithSocial: (
    provider: FirebaseAuthProvider,
    role: UserRole,
    companyName?: string
  ) => Promise<FirebaseUser>;
  changeUserPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  user: UserProfile | null;
  company: Company | null;
  notifications: Notification[];
  unreadNotificationCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  jobSeekerActions: ReturnType<typeof useJobSeekerActions>;
  employerActions: ReturnType<typeof useEmployerActions>;
  pendingJobsCount?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_LIKE_ROLES: UserRole[] = [
  'admin',
  'superAdmin',
  'moderator',
  'supportAgent',
  'dataAnalyst',
  'complianceOfficer',
  'systemMonitor',
];

async function createUserProfileInFirestore(
  fbUser: FirebaseUser,
  name: string,
  role: UserRole,
  companyNameForNewCompany?: string,
  existingCompanyId?: string
): Promise<Partial<UserProfile>> {
  if (!db) throw new Error("Firestore 'db' instance is not available.");
  const userDocRef = doc(db, 'users', fbUser.uid);
  let userCompanyId = existingCompanyId;
  let userIsCompanyAdmin = false;

  if (role === 'employer' && !existingCompanyId) {
    const newCompanyRef = doc(collection(db, 'companies'));
    const newCompanyData: Omit<Company, 'id'> = {
      name: companyNameForNewCompany || 'New Company',
      adminUids: [fbUser.uid],
      recruiterUids: [fbUser.uid],
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      status: 'pending',
      moderationReason: '',
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
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.warn(
        'AuthProvider: Firebase auth instance is not available. Skipping auth state listener.'
      );
      setLoading(false);
      setFirebaseUser(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && db) {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().status === 'deleted') {
          await signOut(auth);
          setFirebaseUser(null);
          globalToast({
            title: 'Account Deactivated',
            description:
              'Your account has been deactivated. Please contact support for assistance.',
            variant: 'destructive',
            duration: Infinity,
          });
        } else {
          await updateDoc(userDocRef, { lastActive: serverTimestamp() });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerUser = async (
    email: string,
    pass: string,
    name: string,
    role: UserRole,
    companyName?: string
  ): Promise<FirebaseUser> => {
    if (!auth) throw new Error('Firebase Authentication is not configured.');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      pass
    );
    await createUserProfileInFirestore(
      userCredential.user,
      name,
      role,
      companyName
    );
    return userCredential.user;
  };

  const loginUser = async (
    email: string,
    pass: string
  ): Promise<FirebaseUser> => {
    if (!auth) throw new Error('Firebase Authentication is not configured.');
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  };

  const signInWithSocial = async (
    provider: FirebaseAuthProvider,
    role: UserRole,
    companyName?: string
  ): Promise<FirebaseUser> => {
    if (!auth || !db)
      throw new Error(
        'Firebase Authentication or Firestore is not configured.'
      );
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await createUserProfileInFirestore(
        fbUser,
        fbUser.displayName || 'New User',
        role,
        companyName
      );
    }
    return fbUser;
  };

  const logout = async () => {
    if (!auth) {
      console.warn('Firebase auth not available for logout.');
      setFirebaseUser(null);
      return;
    }
    await signOut(auth);
    setFirebaseUser(null);
  };

  const changeUserPassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!auth || !firebaseUser || !firebaseUser.email) {
      throw new Error('User not authenticated or email not available.');
    }
    const credential = EmailAuthProvider.credential(
      firebaseUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(firebaseUser, credential);
    await firebaseUpdatePassword(firebaseUser, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        loading,
        logout,
        registerUser,
        loginUser,
        signInWithSocial,
        changeUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
