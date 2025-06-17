
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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, arrayUnion, Timestamp,FieldValue } from 'firebase/firestore';

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
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profileData = { uid: fbUser.uid, ...userDocSnap.data() } as UserProfile;
            console.log("AuthContext: User profile fetched from Firestore:", JSON.stringify(profileData));
            setUser(profileData);
          } else {
            console.warn("AuthContext: User profile not found in Firestore for UID:", fbUser.uid, "User might need to complete profile or new social sign-in.");
            // If profile doesn't exist, it might be a new social sign-in scenario where createUserProfileInFirestore will be called.
            // If it's an existing auth user without a Firestore doc, they are effectively logged out from app's perspective.
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
    };

    if (fbUser.photoURL) {
      userProfileData.avatarUrl = fbUser.photoURL;
    }

    if (role === 'jobSeeker') {
      userProfileData.appliedJobIds = [];
      userProfileData.headline = '';
      userProfileData.skills = [];
      userProfileData.experience = '';
      userProfileData.education = '';
      userProfileData.availability = 'Flexible';
      userProfileData.preferredLocations = [];
      userProfileData.jobSearchStatus = 'activelyLooking';
      // desiredSalary, resumeUrl, etc., are truly optional and not initialized with empty strings
    } else if (role === 'employer') {
      userProfileData.companyWebsite = '';
      userProfileData.companyDescription = '';
    }
    
    // Merge base, additionalData, ensuring role from base profile takes precedence
    let combinedProfileData = { ...userProfileData, ...additionalData, role: userProfileData.role };

    // Create a new object with only defined values to pass to Firestore
    const finalProfileDataForFirestore: { [key: string]: any } = {};
    for (const key in combinedProfileData) {
      if (combinedProfileData[key as keyof typeof combinedProfileData] !== undefined) {
        finalProfileDataForFirestore[key] = combinedProfileData[key as keyof typeof combinedProfileData];
      }
    }
    
    try {
      await setDoc(userDocRef, finalProfileDataForFirestore);
      console.log("AuthContext: Firestore setDoc successful for UID:", fbUser.uid, "Data:", JSON.stringify(finalProfileDataForFirestore));
      // Set user context with the data that was successfully written (which excludes undefined fields)
      setUser(finalProfileDataForFirestore as UserProfile); 
      return finalProfileDataForFirestore as UserProfile;
    } catch (error) {
      console.error("AuthContext: Firestore setDoc FAILED for UID:", fbUser.uid, "Error:", error, "Data attempted:", JSON.stringify(finalProfileDataForFirestore));
      throw error; // Re-throw the error so the calling function knows about the failure
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
      // onAuthStateChanged will handle fetching the profile from Firestore.
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
          console.warn(`AuthContext: User ${fbUser.uid} exists with role ${existingProfile.role}, but signed in via social login for role ${role}. Updating role.`);
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
      
      // Ensure role is not accidentally changed or removed if not explicitly part of updatedData
      if (dataToUpdate.role === undefined && user.role) {
        dataToUpdate.role = user.role;
      }
      
      if (Object.keys(dataToUpdate).length > 1) { // more than just updatedAt
        try {
            await updateDoc(userDocRef, dataToUpdate);
            setUser(prevUser => ({ ...prevUser, ...dataToUpdate } as UserProfile)); // Update with what was sent
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
            
            // Also update the job document with the applicant's ID
            const jobDocRef = doc(db, "jobs", jobId);
            await updateDoc(jobDocRef, {
            applicantIds: arrayUnion(user.uid),
            // No need to update job's updatedAt timestamp for this action by seeker
            });

        } catch (error) {
            console.error("AuthContext: applyForJob error", error);
            throw error;
        }
      }
    } else {
        console.warn("User must be a logged-in job seeker to apply for a job.");
        // Potentially throw an error or notify user
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
