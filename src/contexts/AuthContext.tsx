
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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, arrayUnion, Timestamp } from 'firebase/firestore';

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
          const profileData = { uid: fbUser.uid, ...userDocSnap.data() } as UserProfile;
          console.log("AuthContext: User profile fetched from Firestore:", JSON.stringify(profileData));
          setUser(profileData);
        } else {
          // This case is typically handled by social sign-in creating the profile.
          // For email/password, if a user exists in Auth but not Firestore, they might need to complete a profile.
          // For now, if the doc is missing after login, we treat them as not fully set up.
          console.warn("AuthContext: User profile not found in Firestore for UID:", fbUser.uid, "User will be treated as logged out from app perspective until profile is created.");
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
    
    // Base profile structure ensures role is set
    const userProfileBase: Partial<UserProfile> = {
      uid: fbUser.uid,
      email: fbUser.email,
      name: name || fbUser.displayName || "Anonymous User",
      role: role, // Explicitly use the role passed to the function
      createdAt: serverTimestamp() as Timestamp, // Firestore server timestamp
    };

    if (fbUser.photoURL) {
      userProfileBase.avatarUrl = fbUser.photoURL;
    }

    if (role === 'jobSeeker') {
      userProfileBase.appliedJobIds = [];
      userProfileBase.headline = '';
      userProfileBase.skills = [];
      userProfileBase.experience = '';
      userProfileBase.education = '';
      userProfileBase.availability = 'Flexible';
      userProfileBase.preferredLocations = [];
      userProfileBase.jobSearchStatus = 'activelyLooking';
    } else if (role === 'employer') {
      userProfileBase.companyWebsite = '';
      userProfileBase.companyDescription = '';
    }
    
    // Merge base, additionalData, ensuring role from base profile takes precedence if additionalData also has it
    const finalProfileData = { ...userProfileBase, ...additionalData, role: userProfileBase.role };

    Object.keys(finalProfileData).forEach(key => {
      if (finalProfileData[key as keyof typeof finalProfileData] === undefined) {
        delete finalProfileData[key as keyof typeof finalProfileData];
      }
    });
    
    await setDoc(userDocRef, finalProfileData);
    console.log("AuthContext: User profile created/updated in Firestore:", JSON.stringify(finalProfileData));
    setUser(finalProfileData as UserProfile); // Ensure context is updated immediately
    return finalProfileData as UserProfile;
  };

  const registerUser = async (email: string, pass: string, name: string, role: UserRole): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const fbUser = userCredential.user;
    await createUserProfileInFirestore(fbUser, name, role);
    return fbUser;
  };

  const loginUser = async (email: string, pass: string): Promise<FirebaseUser> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged will handle fetching the profile from Firestore.
    // We expect the user document to exist with the correct role.
    return userCredential.user;
  };
  
  const signInWithSocial = async (provider: FirebaseAuthProvider, role: UserRole): Promise<FirebaseUser> => {
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    const userDocRef = doc(db, "users", fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // New user via social login, create their profile with the specified role
      await createUserProfileInFirestore(fbUser, fbUser.displayName || "New User", role);
    } else {
      // Existing user, check if their role matches the context they're signing in from
      const existingProfile = userDocSnap.data() as UserProfile;
      if (existingProfile.role !== role) {
        // User exists but is trying to log in via a different role's social button
        // This is a tricky case. For now, we update their role.
        // A more robust app might prevent this or have a role selection step.
        console.warn(`AuthContext: User ${fbUser.uid} exists with role ${existingProfile.role}, but signed in via social login for role ${role}. Updating role.`);
        await updateDoc(userDocRef, { role, updatedAt: serverTimestamp() });
        setUser({ ...existingProfile, role } as UserProfile); // Update local state with new role
      } else {
        setUser(existingProfile); // Role matches, set existing profile
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
      const cleanUpdatedData: Partial<UserProfile> = {};
      for (const key in updatedData) {
        if (updatedData[key as keyof UserProfile] !== undefined) {
          cleanUpdatedData[key as keyof UserProfile] = updatedData[key as keyof UserProfile];
        }
      }
      
      const dataToUpdate: any = { ...cleanUpdatedData, updatedAt: serverTimestamp() };
      // Ensure role is not accidentally set to undefined during partial updates
      if (dataToUpdate.role === undefined && user.role) {
        dataToUpdate.role = user.role;
      }


      if (Object.keys(dataToUpdate).length > 1) { // more than just updatedAt
        await updateDoc(userDocRef, dataToUpdate);
      }
      setUser(prevUser => ({ ...prevUser, ...updatedData } as UserProfile));
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
