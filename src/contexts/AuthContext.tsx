
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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

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
          // This might happen if a user authenticates but profile creation failed
          // or for users who existed before profile creation logic was in place.
          // For social sign-ins, profile is created in signInWithSocial.
          console.warn("User profile not found in Firestore for UID:", fbUser.uid, "User might need to complete registration or role selection.");
          // Potentially log out or redirect to a profile completion page
           setUser(null); // Or handle more gracefully
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
      const newUserProfile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email,
        name: name || fbUser.displayName || "Anonymous User",
        avatarUrl: fbUser.photoURL || undefined,
        role,
        createdAt: serverTimestamp(),
        appliedJobIds: [],
        ...(role === 'jobSeeker' && {
          headline: '', skills: [], experience: '', education: '',
          availability: 'Flexible', preferredLocations: [], jobSearchStatus: 'activelyLooking',
        }),
        ...(role === 'employer' && {
          companyWebsite: '', companyDescription: '',
        }),
        ...additionalData, // For any extra data passed during creation
      };
      await setDoc(userDocRef, newUserProfile);
      setUser(newUserProfile);
      return newUserProfile;
    }
    return userDocSnap.data() as UserProfile;
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
    // Check if profile exists, if not, create it
    const userDocRef = doc(db, "users", fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      // New user via social login
      await createUserProfileInFirestore(fbUser, fbUser.displayName || "New User", role);
    } else {
      // Existing user, ensure role matches if necessary or update profile
      const existingProfile = userDocSnap.data() as UserProfile;
      if (existingProfile.role !== role) {
        // Handle role mismatch, e.g., update role or inform user. For now, let's update.
        // This is a simplification; role changes might need more business logic.
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
        
        // Also update the job document to include this applicant (optional, can be complex)
        // const jobDocRef = doc(db, "jobs", jobId);
        // await updateDoc(jobDocRef, {
        //   applicantIds: arrayUnion(user.uid) // arrayUnion adds element if not present
        // });
      }
    } else {
        console.warn("User must be a logged-in job seeker to apply for a job.");
        // Potentially throw an error or show a toast
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
