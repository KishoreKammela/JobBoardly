
"use client";
import type { UserProfile, UserRole } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  githubProvider, 
  microsoftProvider 
} from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  type User as FirebaseUser,
  type AuthProvider as FirebaseAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, arrayUnion } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  applyForJob: (jobId: string) => Promise<void>;
  hasAppliedForJob: (jobId: string) => boolean;
  registerUser: (email: string, pass: string, name: string, role: UserRole) => Promise<FirebaseUser>;
  loginUser: (email: string, pass: string) => Promise<FirebaseUser>;
  updateUserProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
  signInWithSocial: (provider: FirebaseAuthProvider, role: UserRole) => Promise<FirebaseUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userDocRef = doc(db, "users", fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser({ uid: fbUser.uid, ...userDocSnap.data() } as UserProfile);
        } else {
          console.warn("User profile not found in Firestore for UID:", fbUser.uid);
           setUser(null); 
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createUserProfileInFirestore = async (fbUser: FirebaseUser, name: string, role: UserRole, additionalData: Partial<UserProfile> = {}) => {
    const userDocRef = doc(db, "users", fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      const userProfileBase: {
        uid: string;
        email: string | null;
        name: string;
        role: UserRole;
        createdAt: any; // serverTimestamp type
      } = {
        uid: fbUser.uid,
        email: fbUser.email,
        name: name || fbUser.displayName || "Anonymous User",
        role,
        createdAt: serverTimestamp(),
      };

      let profileToSet: Partial<UserProfile> = { ...userProfileBase };

      if (fbUser.photoURL) {
        profileToSet.avatarUrl = fbUser.photoURL;
      }

      if (role === 'jobSeeker') {
        profileToSet = {
          ...profileToSet,
          appliedJobIds: [],
          headline: '',
          skills: [],
          experience: '',
          education: '',
          availability: 'Flexible',
          preferredLocations: [],
          jobSearchStatus: 'activelyLooking',
        };
      } else if (role === 'employer') {
        profileToSet = {
          ...profileToSet,
          companyWebsite: '',
          companyDescription: '',
        };
      }
      
      const finalProfileData = { ...profileToSet, ...additionalData };

      // Ensure no undefined values are explicitly passed to setDoc
      Object.keys(finalProfileData).forEach(key => {
        if (finalProfileData[key as keyof typeof finalProfileData] === undefined) {
          delete finalProfileData[key as keyof typeof finalProfileData];
        }
      });

      await setDoc(userDocRef, finalProfileData);
      setUser(finalProfileData as UserProfile);
      return finalProfileData as UserProfile;
    }
    const existingProfile = userDocSnap.data() as UserProfile;
    setUser(existingProfile);
    return existingProfile;
  };

  const registerUser = async (email: string, pass: string, name: string, role: UserRole): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const fbUser = userCredential.user;
    await createUserProfileInFirestore(fbUser, name, role);
    return fbUser;
  };

  const loginUser = async (email: string, pass: string): Promise<FirebaseUser> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged will handle fetching the profile
    return userCredential.user;
  };
  
  const signInWithSocial = async (provider: FirebaseAuthProvider, role: UserRole): Promise<FirebaseUser> => {
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    const userDocRef = doc(db, "users", fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await createUserProfileInFirestore(fbUser, fbUser.displayName || "New User", role);
    } else {
      const existingProfile = userDocSnap.data() as UserProfile;
      if (existingProfile.role !== role) {
        // This case needs careful consideration. For now, we update the role if it's different.
        // In a real app, you might want to prevent this or ask for user confirmation.
        await updateDoc(userDocRef, { role, updatedAt: serverTimestamp() });
        setUser({ ...existingProfile, role } as UserProfile);
      } else {
        setUser(existingProfile);
      }
    }
    return fbUser;
  };


  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };
  
  const updateUserProfile = async (updatedData: Partial<UserProfile>) => {
    if (user && user.uid) {
      const userDocRef = doc(db, "users", user.uid);
      // Filter out undefined values from updatedData before sending to Firestore
      const cleanUpdatedData: Partial<UserProfile> = {};
      for (const key in updatedData) {
        if (updatedData[key as keyof UserProfile] !== undefined) {
          cleanUpdatedData[key as keyof UserProfile] = updatedData[key as keyof UserProfile];
        }
      }
      if (Object.keys(cleanUpdatedData).length > 0) {
        await updateDoc(userDocRef, { ...cleanUpdatedData, updatedAt: serverTimestamp() });
      }
      setUser(prevUser => ({ ...prevUser, ...updatedData } as UserProfile)); // Local state can have undefined
    } else {
      throw new Error("User not logged in to update profile.");
    }
  };


  const applyForJob = async (jobId: string) => {
    if (user && user.uid && user.role === 'jobSeeker') {
      const currentAppliedJobIds = user.appliedJobIds || [];
      if (!currentAppliedJobIds.includes(jobId)) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          appliedJobIds: arrayUnion(jobId),
          updatedAt: serverTimestamp()
        });
        setUser(prevUser => ({ 
          ...prevUser, 
          appliedJobIds: [...(prevUser?.appliedJobIds || []), jobId] 
        } as UserProfile));
        
        // Also update the job document to include this applicant
        const jobDocRef = doc(db, "jobs", jobId);
        await updateDoc(jobDocRef, {
          applicantIds: arrayUnion(user.uid),
          updatedAt: serverTimestamp()
        });
      }
    } else {
        console.warn("User must be a logged-in job seeker to apply for a job.");
    }
  };

  const hasAppliedForJob = (jobId: string): boolean => {
    if (user && user.role === 'jobSeeker' && user.appliedJobIds) {
      return user.appliedJobIds.includes(jobId);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        firebaseUser, 
        loading, 
        logout, 
        applyForJob, 
        hasAppliedForJob,
        registerUser,
        loginUser,
        updateUserProfile,
        signInWithSocial
    }}>
      {!loading && children}
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
