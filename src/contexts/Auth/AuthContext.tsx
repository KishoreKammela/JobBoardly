// src/contexts/Auth/AuthContext.tsx
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
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { auth, db } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/types';
import { toast as globalToast } from '@/hooks/use-toast';
import {
  createUserProfileInDb,
  getUserProfile,
} from '@/services/user.services';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  registerUser: (
    email: string,
    pass: string,
    name: string,
    role: UserRole,
    companyName?: string,
    invitationId?: string
  ) => Promise<UserProfile>;
  loginUser: (email: string, pass: string) => Promise<UserProfile>;
  signInWithSocial: (
    provider: FirebaseAuthProvider,
    role: UserRole,
    companyName?: string
  ) => Promise<UserProfile>;
  changeUserPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  user: UserProfile | null;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null); // Keep a local copy for immediate use
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!auth) {
      console.warn(
        'AuthProvider: Firebase auth instance is not available. Skipping auth state listener.'
      );
      setLoading(false);
      setFirebaseUser(null);
      setUser(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && db) {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userProfile = userDoc.data() as UserProfile;
          if (userProfile.status === 'deleted') {
            await signOut(auth);
            setFirebaseUser(null);
            setUser(null);
            globalToast({
              title: 'Account Deactivated',
              description:
                'Your account has been deactivated. Please contact support for assistance.',
              variant: 'destructive',
              duration: Infinity,
            });
          } else {
            await updateDoc(userDocRef, { lastActive: serverTimestamp() });
            setUser({ uid: fbUser.uid, ...userProfile });
          }
        }
      } else {
        setUser(null);
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
    companyName?: string,
    invitationId?: string
  ): Promise<UserProfile> => {
    if (!auth) throw new Error('Firebase Authentication is not configured.');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      pass
    );
    const profile = await createUserProfileInDb(
      userCredential.user,
      name,
      role,
      companyName,
      invitationId
    );
    const fullProfile = {
      ...profile,
      uid: userCredential.user.uid,
    } as UserProfile;
    setUser(fullProfile);
    return fullProfile;
  };

  const loginUser = async (
    email: string,
    pass: string
  ): Promise<UserProfile> => {
    if (!auth) throw new Error('Firebase Authentication is not configured.');
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const profile = await getUserProfile(userCredential.user.uid);
    if (!profile) {
      await signOut(auth);
      throw new Error('User profile not found in database.');
    }
    setUser(profile);
    return profile;
  };

  const signInWithSocial = async (
    provider: FirebaseAuthProvider,
    role: UserRole,
    companyName?: string
  ): Promise<UserProfile> => {
    if (!auth || !db)
      throw new Error(
        'Firebase Authentication or Firestore is not configured.'
      );
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    let profile = await getUserProfile(fbUser.uid);

    if (!profile) {
      const newProfile = await createUserProfileInDb(
        fbUser,
        fbUser.displayName || 'New User',
        role,
        companyName
      );
      profile = { ...newProfile, uid: fbUser.uid } as UserProfile;
    }
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    if (!auth) {
      console.warn('Firebase auth not available for logout.');
      setFirebaseUser(null);
      return;
    }
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
      throw error;
    }
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
        user,
        isLoggingOut,
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
