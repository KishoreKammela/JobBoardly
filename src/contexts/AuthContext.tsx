
"use client";
import type { UserProfile, UserRole } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  type User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null; // Raw Firebase user
  loading: boolean;
  // login: (userData: UserProfile) => void; // Replaced by Firebase login
  logout: () => Promise<void>;
  // updateUser: (updatedData: Partial<UserProfile>) => void; // Will be more specific
  // setUserRole: (role: UserRole) => void; // Role set at registration
  applyForJob: (jobId: string) => Promise<void>;
  hasAppliedForJob: (jobId: string) => boolean;
  registerUser: (email: string, pass: string, name: string, role: UserRole) => Promise<FirebaseUser>;
  loginUser: (email: string, pass: string) => Promise<FirebaseUser>;
  updateUserProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
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
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const userDocRef = doc(db, "users", fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser({ uid: fbUser.uid, ...userDocSnap.data() } as UserProfile);
        } else {
          // This case should ideally not happen if profile is created on registration
          // Or, handle it by creating a profile if missing, or logging out.
          console.warn("User profile not found in Firestore for UID:", fbUser.uid);
          // setUser(null); // Or prompt to create profile
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerUser = async (email: string, pass: string, name: string, role: UserRole): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const fbUser = userCredential.user;
    
    // Create user profile in Firestore
    const userDocRef = doc(db, "users", fbUser.uid);
    const newUserProfile: Partial<UserProfile> = {
      uid: fbUser.uid,
      email: fbUser.email || email, // Use email from auth if available
      name,
      role,
      createdAt: serverTimestamp(),
      appliedJobIds: [],
      // Initialize other role-specific fields
    };
     if (role === 'jobSeeker') {
        newUserProfile.headline = '';
        newUserProfile.skills = [];
        newUserProfile.experience = '';
        newUserProfile.education = '';
        newUserProfile.availability = 'Flexible';
        newUserProfile.preferredLocations = [];
        newUserProfile.jobSearchStatus = 'activelyLooking';
    } else if (role === 'employer') {
        newUserProfile.companyWebsite = '';
        newUserProfile.companyDescription = '';
    }

    await setDoc(userDocRef, newUserProfile);
    setUser(newUserProfile as UserProfile); // Set local state
    return fbUser;
  };

  const loginUser = async (email: string, pass: string): Promise<FirebaseUser> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged will handle fetching the profile
    return userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };
  
  const updateUserProfile = async (updatedData: Partial<UserProfile>) => {
    if (user && user.uid) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { ...updatedData, updatedAt: serverTimestamp() });
      setUser(prevUser => ({ ...prevUser, ...updatedData } as UserProfile));
    } else {
      throw new Error("User not logged in to update profile.");
    }
  };


  const applyForJob = async (jobId: string) => {
    if (user && user.uid && user.role === 'jobSeeker') {
      const currentAppliedJobIds = user.appliedJobIds || [];
      if (!currentAppliedJobIds.includes(jobId)) {
        const newAppliedJobIds = [...currentAppliedJobIds, jobId];
        await updateUserProfile({ appliedJobIds: newAppliedJobIds });
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
        updateUserProfile
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
