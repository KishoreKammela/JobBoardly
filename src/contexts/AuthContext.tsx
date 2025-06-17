
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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, arrayUnion, arrayRemove, Timestamp,type FieldValue } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  applyForJob: (jobId: string) => Promise<void>;
  hasAppliedForJob: (jobId: string) => boolean;
  saveJob: (jobId: string) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  isJobSaved: (jobId: string) => boolean;
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
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profileData = { uid: fbUser.uid, ...userDocSnap.data() } as UserProfile;
            setUser(profileData);
          } else {
            setUser(null); 
          }
        } catch (error) {
            console.error("AuthContext: Error fetching user profile from Firestore:", error);
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
    
    const userProfileData: Partial<UserProfile> = {
      uid: fbUser.uid,
      email: fbUser.email,
      name: name || fbUser.displayName || (role === 'employer' ? "New Company" : "New User"),
      role: role,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    if (fbUser.photoURL) {
      userProfileData.avatarUrl = fbUser.photoURL;
    }

    if (role === 'jobSeeker') {
      userProfileData.appliedJobIds = [];
      userProfileData.savedJobIds = []; // Initialize savedJobIds
      userProfileData.headline = '';
      userProfileData.skills = [];
      userProfileData.experience = '';
      userProfileData.education = '';
      userProfileData.availability = 'Flexible';
      userProfileData.preferredLocations = [];
      userProfileData.jobSearchStatus = 'activelyLooking';
    } else if (role === 'employer') {
      userProfileData.companyWebsite = '';
      userProfileData.companyDescription = '';
    }
    
    let combinedProfileData = { ...userProfileData, ...additionalData, role: userProfileData.role };

    const finalProfileDataForFirestore: { [key: string]: any } = {};
    for (const key in combinedProfileData) {
      if (combinedProfileData[key as keyof typeof combinedProfileData] !== undefined) {
        finalProfileDataForFirestore[key] = combinedProfileData[key as keyof typeof combinedProfileData];
      }
    }
    
    try {
      await setDoc(userDocRef, finalProfileDataForFirestore);
      setUser(finalProfileDataForFirestore as UserProfile); 
      return finalProfileDataForFirestore as UserProfile;
    } catch (error) {
      console.error("AuthContext: Firestore setDoc FAILED for UID:", fbUser.uid, "Error:", error, "Data attempted:", JSON.stringify(finalProfileDataForFirestore));
      throw error;
    }
  };

  const registerUser = async (email: string, pass: string, name: string, role: UserRole): Promise<FirebaseUser> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      await createUserProfileInFirestore(fbUser, name, role);
      return fbUser;
    } catch (error) {
      console.error("AuthContext: registerUser error", error);
      throw error;
    }
  };

  const loginUser = async (email: string, pass: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      return userCredential.user;
    } catch (error) {
        console.error("AuthContext: loginUser error", error);
        throw error;
    }
  };
  
  const signInWithSocial = async (provider: FirebaseAuthProvider, role: UserRole): Promise<FirebaseUser> => {
    try {
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const userDocRef = doc(db, "users", fbUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await createUserProfileInFirestore(fbUser, fbUser.displayName || (role === 'employer' ? "New Company" : "New User"), role);
      } else {
        const existingProfile = { uid: fbUser.uid, ...userDocSnap.data() } as UserProfile;
        if (existingProfile.role !== role) {
          const updates: Partial<UserProfile> & {updatedAt: FieldValue} = { role, updatedAt: serverTimestamp() };
          await updateDoc(userDocRef, updates);
          setUser({ ...existingProfile, ...updates } as UserProfile);
        } else {
          setUser(existingProfile);
        }
      }
      return fbUser;
    } catch (error) {
        console.error("AuthContext: signInWithSocial error", error);
        throw error;
    }
  };


  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
        console.error("AuthContext: logout error", error);
        throw error;
    }
  };
  
  const updateUserProfile = async (updatedData: Partial<UserProfile>) => {
    if (user && user.uid) {
      const userDocRef = doc(db, "users", user.uid);
      
      const dataToUpdate: { [key: string]: any } = { updatedAt: serverTimestamp() };
      for (const key in updatedData) {
        if (updatedData[key as keyof UserProfile] !== undefined) {
          dataToUpdate[key] = updatedData[key as keyof UserProfile];
        }
      }
      
      if (dataToUpdate.role === undefined && user.role) {
        dataToUpdate.role = user.role;
      }
      
      if (Object.keys(dataToUpdate).length > 1) { 
        try {
            await updateDoc(userDocRef, dataToUpdate);
            setUser(prevUser => ({ ...prevUser, ...dataToUpdate } as UserProfile)); 
        } catch (error) {
            console.error("AuthContext: updateUserProfile error", error);
            throw error;
        }
      }
    } else {
      console.error("AuthContext: User not logged in to update profile.");
      throw new Error("User not logged in to update profile.");
    }
  };


  const applyForJob = async (jobId: string) => {
    if (user && user.uid && user.role === 'jobSeeker') {
      const currentAppliedJobIds = user.appliedJobIds || [];
      if (!currentAppliedJobIds.includes(jobId)) {
        const userDocRef = doc(db, "users", user.uid);
        try {
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
            });

        } catch (error) {
            console.error("AuthContext: applyForJob error", error);
            throw error;
        }
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

  const saveJob = async (jobId: string) => {
    if (user && user.uid && user.role === 'jobSeeker') {
      const userDocRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userDocRef, {
          savedJobIds: arrayUnion(jobId),
          updatedAt: serverTimestamp()
        });
        setUser(prevUser => ({
          ...prevUser,
          savedJobIds: [...(prevUser?.savedJobIds || []), jobId]
        } as UserProfile));
      } catch (error) {
        console.error("AuthContext: saveJob error", error);
        throw error;
      }
    } else {
      console.warn("User must be a logged-in job seeker to save a job.");
    }
  };

  const unsaveJob = async (jobId: string) => {
    if (user && user.uid && user.role === 'jobSeeker') {
      const userDocRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userDocRef, {
          savedJobIds: arrayRemove(jobId),
          updatedAt: serverTimestamp()
        });
        setUser(prevUser => ({
          ...prevUser,
          savedJobIds: (prevUser?.savedJobIds || []).filter(id => id !== jobId)
        } as UserProfile));
      } catch (error) {
        console.error("AuthContext: unsaveJob error", error);
        throw error;
      }
    } else {
      console.warn("User must be a logged-in job seeker to unsave a job.");
    }
  };

  const isJobSaved = (jobId: string): boolean => {
    if (user && user.role === 'jobSeeker' && user.savedJobIds) {
      return user.savedJobIds.includes(jobId);
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
        saveJob,
        unsaveJob,
        isJobSaved,
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
