
"use client";
import type { UserProfile, UserRole, Company } from '@/types';
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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, arrayUnion, arrayRemove, Timestamp, type FieldValue, writeBatch, addDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  company: Company | null; // Add company state
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  applyForJob: (jobId: string) => Promise<void>;
  hasAppliedForJob: (jobId: string) => boolean;
  saveJob: (jobId: string) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  isJobSaved: (jobId: string) => boolean;
  registerUser: (email: string, pass: string, name: string, role: UserRole, companyName?: string) => Promise<FirebaseUser>; // Added companyName
  loginUser: (email: string, pass: string) => Promise<FirebaseUser>;
  updateUserProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
  updateCompanyProfile: (companyId: string, updatedData: Partial<Company>) => Promise<void>; // New method
  signInWithSocial: (provider: FirebaseAuthProvider, role: UserRole, companyName?: string) => Promise<FirebaseUser>; // Added companyName
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null); // State for company data
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
            if (profileData.role === 'employer' && profileData.companyId) {
              const companyDocRef = doc(db, "companies", profileData.companyId);
              const companyDocSnap = await getDoc(companyDocRef);
              if (companyDocSnap.exists()) {
                setCompany({ id: companyDocSnap.id, ...companyDocSnap.data() } as Company);
              } else {
                setCompany(null);
                console.warn(`Company with ID ${profileData.companyId} not found for user ${fbUser.uid}`);
              }
            } else {
              setCompany(null);
            }
          } else {
            setUser(null);
            setCompany(null);
          }
        } catch (error) {
            console.error("AuthContext: Error fetching user or company profile from Firestore:", error);
            setUser(null);
            setCompany(null);
        }
      } else {
        setUser(null);
        setCompany(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createUserProfileInFirestore = async (
    fbUser: FirebaseUser,
    name: string, // This is the person's name
    role: UserRole,
    companyNameForNewCompany?: string, // Name for a new company if role is employer
    existingCompanyId?: string // ID if joining an existing company (future feature)
  ): Promise<UserProfile> => {
    const userDocRef = doc(db, "users", fbUser.uid);
    let userCompanyId = existingCompanyId;
    let userIsCompanyAdmin = false;

    if (role === 'employer' && !existingCompanyId) {
      // Create a new company
      const newCompanyRef = doc(collection(db, "companies"));
      const newCompanyData: Omit<Company, 'id'> = {
        name: companyNameForNewCompany || "New Company",
        adminUids: [fbUser.uid],
        recruiterUids: [fbUser.uid],
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        // other fields like description, logoUrl can be added later
      };
      await setDoc(newCompanyRef, newCompanyData);
      userCompanyId = newCompanyRef.id;
      userIsCompanyAdmin = true;
      setCompany({ id: newCompanyRef.id, ...newCompanyData } as Company);
    }


    const userProfileData: Partial<UserProfile> = {
      uid: fbUser.uid,
      email: fbUser.email,
      name: name || fbUser.displayName || (role === 'employer' ? "Recruiter" : "New User"),
      role: role,
      avatarUrl: fbUser.photoURL || undefined,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    if (role === 'employer') {
      userProfileData.companyId = userCompanyId;
      userProfileData.isCompanyAdmin = userIsCompanyAdmin;
    } else if (role === 'jobSeeker') {
      userProfileData.appliedJobIds = [];
      userProfileData.savedJobIds = [];
      userProfileData.headline = '';
      userProfileData.skills = [];
    }

    const finalProfileDataForFirestore: { [key: string]: any } = {};
    for (const key in userProfileData) {
      if (userProfileData[key as keyof typeof userProfileData] !== undefined) {
        finalProfileDataForFirestore[key] = userProfileData[key as keyof typeof userProfileData];
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

  const registerUser = async (email: string, pass: string, name: string, role: UserRole, companyName?: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      await createUserProfileInFirestore(fbUser, name, role, companyName);
      return fbUser;
    } catch (error) {
      console.error("AuthContext: registerUser error", error);
      throw error;
    }
  };

  const loginUser = async (email: string, pass: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      // User and company data will be fetched by onAuthStateChanged
      return userCredential.user;
    } catch (error) {
        console.error("AuthContext: loginUser error", error);
        throw error;
    }
  };

  const signInWithSocial = async (provider: FirebaseAuthProvider, role: UserRole, companyName?: string): Promise<FirebaseUser> => {
    try {
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const userDocRef = doc(db, "users", fbUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await createUserProfileInFirestore(fbUser, fbUser.displayName || (role === 'employer' ? "Recruiter" : "New User"), role, companyName);
      } else {
        // User exists, ensure role and company info are up-to-date if needed
        const existingProfile = { uid: fbUser.uid, ...userDocSnap.data() } as UserProfile;
        let updatesNeeded = false;
        const updates: Partial<UserProfile> & {updatedAt?: FieldValue} = {};

        if (existingProfile.role !== role) {
          updates.role = role;
          updatesNeeded = true;
           // If role changes to employer and they don't have a companyId, this might need more logic
           // For now, we assume if they exist as employer, companyId is set.
        }
        if (role === 'employer' && !existingProfile.companyId && companyName) {
            // This case implies a user existed, maybe as seeker, now signs in as employer
            // and needs a new company or to join one. For simplicity of social sign-in,
            // let's create a new company for them if companyName is provided.
            const newCompanyRef = doc(collection(db, "companies"));
            const newCompanyData: Omit<Company, 'id'> = {
                name: companyName,
                adminUids: [fbUser.uid],
                recruiterUids: [fbUser.uid],
                createdAt: serverTimestamp() as Timestamp,
                updatedAt: serverTimestamp() as Timestamp,
            };
            await setDoc(newCompanyRef, newCompanyData);
            updates.companyId = newCompanyRef.id;
            updates.isCompanyAdmin = true; // First user via social for this company becomes admin
            updatesNeeded = true;
            setCompany({ id: newCompanyRef.id, ...newCompanyData } as Company);
        }


        if (updatesNeeded) {
          updates.updatedAt = serverTimestamp();
          await updateDoc(userDocRef, updates);
          setUser({ ...existingProfile, ...updates } as UserProfile);
        } else {
          setUser(existingProfile);
          // Re-fetch company if it wasn't fetched initially or changed
          if (existingProfile.role === 'employer' && existingProfile.companyId) {
             const companyDocRef = doc(db, "companies", existingProfile.companyId);
             const companyDocSnap = await getDoc(companyDocRef);
             if (companyDocSnap.exists()) {
                setCompany({ id: companyDocSnap.id, ...companyDocSnap.data() } as Company);
             }
          }
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
      setCompany(null);
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

  const updateCompanyProfile = async (companyId: string, updatedData: Partial<Company>) => {
    if (!user || user.role !== 'employer' || !user.isCompanyAdmin || user.companyId !== companyId) {
        console.error("AuthContext: Unauthorized or invalid operation to update company profile.");
        throw new Error("Unauthorized to update company profile.");
    }
    const companyDocRef = doc(db, "companies", companyId);
    const dataToUpdate: { [key: string]: any } = { ...updatedData, updatedAt: serverTimestamp() };

    // Remove 'id' if it's accidentally passed in updatedData
    delete dataToUpdate.id;
    
    try {
        await updateDoc(companyDocRef, dataToUpdate);
        setCompany(prevCompany => ({ ...prevCompany, ...dataToUpdate, id: companyId } as Company));
    } catch (error) {
        console.error("AuthContext: updateCompanyProfile error", error);
        throw error;
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
        company,
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
        updateCompanyProfile,
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
