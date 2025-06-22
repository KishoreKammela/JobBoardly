'use client';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/types';
import {
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { format, isValid, parse } from 'date-fns';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../Auth/AuthContext';

interface UserProfileContextType {
  user: UserProfile | null;
  loading: boolean;
  updateUserProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

const createEmptyExperience = () => ({
  id: uuidv4(),
  companyName: '',
  jobRole: '',
  startDate: undefined,
  endDate: undefined,
  currentlyWorking: false,
  description: '',
  annualCTC: undefined,
});

const createEmptyEducation = () => ({
  id: uuidv4(),
  level: 'Graduate' as const,
  degreeName: '',
  instituteName: '',
  startYear: undefined,
  endYear: undefined,
  specialization: '',
  courseType: 'Full Time' as const,
  isMostRelevant: false,
  description: '',
});

const createEmptyLanguage = () => ({
  id: uuidv4(),
  languageName: '',
  proficiency: 'Beginner' as const,
  canRead: false,
  canWrite: false,
  canSpeak: false,
});

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { firebaseUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (firebaseUser) {
        setLoading(true);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const rawData = userDocSnap.data();
          let dobString: string | undefined = undefined;
          if (rawData.dateOfBirth) {
            if (
              typeof rawData.dateOfBirth === 'string' &&
              isValid(parse(rawData.dateOfBirth, 'yyyy-MM-dd', new Date()))
            ) {
              dobString = rawData.dateOfBirth;
            } else if (rawData.dateOfBirth instanceof Timestamp) {
              dobString = format(rawData.dateOfBirth.toDate(), 'yyyy-MM-dd');
            }
          }

          const profileData: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...rawData,
            dateOfBirth: dobString,
            createdAt:
              rawData.createdAt instanceof Timestamp
                ? rawData.createdAt.toDate().toISOString()
                : rawData.createdAt,
            updatedAt:
              rawData.updatedAt instanceof Timestamp
                ? rawData.updatedAt.toDate().toISOString()
                : rawData.updatedAt,
            lastActive:
              rawData.lastActive instanceof Timestamp
                ? rawData.lastActive.toDate().toISOString()
                : rawData.lastActive,
            experiences:
              rawData.experiences?.map((e: any) => ({
                ...createEmptyExperience(),
                ...e,
              })) || [],
            educations:
              rawData.educations?.map((e: any) => ({
                ...createEmptyEducation(),
                ...e,
              })) || [],
            languages:
              rawData.languages?.map((l: any) => ({
                ...createEmptyLanguage(),
                ...l,
              })) || [],
          } as UserProfile;
          setUser(profileData);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [firebaseUser, authLoading]);

  const updateUserProfile = async (updatedData: Partial<UserProfile>) => {
    if (!user || !user.uid || !db) {
      throw new Error('User not logged in or db not available.');
    }
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    });
    setUser((prevUser) => ({ ...prevUser, ...updatedData }) as UserProfile);
  };

  return (
    <UserProfileContext.Provider value={{ user, loading, updateUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
