'use client';
import type {
  UserProfile,
  UserRole,
  Company,
  ExperienceEntry,
  EducationEntry,
  LanguageEntry,
} from '@/types';
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User as FirebaseUser,
  type AuthProvider as FirebaseAuthProvider,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  Timestamp,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { format, isValid, parse } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserProfile | null;
  company: Company | null;
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
  updateUserProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
  updateCompanyProfile: (
    companyId: string,
    updatedData: Partial<Company>
  ) => Promise<void>;
  signInWithSocial: (
    provider: FirebaseAuthProvider,
    role: UserRole,
    companyName?: string
  ) => Promise<FirebaseUser>;
  changeUserPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createEmptyExperience = (): ExperienceEntry => ({
  id: uuidv4(),
  companyName: '',
  jobRole: '',
  startDate: undefined,
  endDate: undefined,
  currentlyWorking: false,
  description: '',
  annualCTC: undefined,
});

const createEmptyEducation = (): EducationEntry => ({
  id: uuidv4(),
  level: 'Graduate',
  degreeName: '',
  instituteName: '',
  startYear: undefined,
  endYear: undefined,
  specialization: '',
  courseType: 'Full Time',
  isMostRelevant: false,
  description: '',
});

const createEmptyLanguage = (): LanguageEntry => ({
  id: uuidv4(),
  languageName: '',
  proficiency: 'Beginner',
  canRead: false,
  canWrite: false,
  canSpeak: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.warn(
        'AuthContext: Firebase auth instance is not available. Firebase might not be configured correctly (e.g., missing environment variables). Skipping auth state listener.'
      );
      setLoading(false);
      setUser(null);
      setFirebaseUser(null);
      setCompany(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userDocRef = doc(db, 'users', fbUser.uid);
        try {
          await setDoc(
            userDocRef,
            { lastActive: serverTimestamp() },
            { merge: true }
          );

          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const rawData = userDocSnap.data();

            if (rawData.status === 'deleted') {
              await signOut(auth);
              setUser(null);
              setFirebaseUser(null);
              setCompany(null);
              setLoading(false);
              toast({
                title: 'Account Deactivated',
                description:
                  'Your account has been deactivated. Please contact support for assistance.',
                variant: 'destructive',
                duration: Infinity,
              });
              return;
            }

            let dobString: string | undefined = undefined;
            if (rawData.dateOfBirth) {
              if (
                typeof rawData.dateOfBirth === 'string' &&
                isValid(parse(rawData.dateOfBirth, 'yyyy-MM-dd', new Date()))
              ) {
                dobString = rawData.dateOfBirth;
              } else if (rawData.dateOfBirth instanceof Timestamp) {
                dobString = format(rawData.dateOfBirth.toDate(), 'yyyy-MM-dd');
              } else if (
                rawData.dateOfBirth instanceof Date &&
                isValid(rawData.dateOfBirth)
              ) {
                dobString = format(rawData.dateOfBirth, 'yyyy-MM-dd');
              } else {
                dobString = undefined;
              }
            } else {
              dobString = undefined;
            }

            const experiences = (rawData.experiences || []).map(
              (exp: Partial<ExperienceEntry>) => ({
                id: exp.id || uuidv4(),
                companyName: exp.companyName || '',
                jobRole: exp.jobRole || '',
                startDate: exp.startDate || undefined,
                endDate: exp.endDate || undefined,
                currentlyWorking: exp.currentlyWorking || false,
                description: exp.description || '',
                annualCTC:
                  exp.annualCTC === null ||
                  exp.annualCTC === undefined ||
                  isNaN(Number(exp.annualCTC))
                    ? undefined
                    : Number(exp.annualCTC),
              })
            );
            const educations = (rawData.educations || []).map(
              (edu: Partial<EducationEntry>) => ({
                id: edu.id || uuidv4(),
                level: edu.level || 'Graduate',
                degreeName: edu.degreeName || '',
                instituteName: edu.instituteName || '',
                startYear:
                  edu.startYear === null ||
                  edu.startYear === undefined ||
                  isNaN(Number(edu.startYear))
                    ? undefined
                    : Number(edu.startYear),
                endYear:
                  edu.endYear === null ||
                  edu.endYear === undefined ||
                  isNaN(Number(edu.endYear))
                    ? undefined
                    : Number(edu.endYear),
                specialization: edu.specialization || '',
                courseType: edu.courseType || 'Full Time',
                isMostRelevant: edu.isMostRelevant || false,
                description: edu.description || '',
              })
            );
            const languages = (rawData.languages || []).map(
              (lang: Partial<LanguageEntry>) => ({
                id: lang.id || uuidv4(),
                languageName: lang.languageName || '',
                proficiency: lang.proficiency || 'Beginner',
                canRead: lang.canRead || false,
                canWrite: lang.canWrite || false,
                canSpeak: lang.canSpeak || false,
              })
            );

            const profileData: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email,
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
              savedSearches: (rawData.savedSearches || []).map((s: any) => ({
                ...s,
                id: s.id || uuidv4(),
                createdAt:
                  s.createdAt instanceof Timestamp
                    ? s.createdAt.toDate().toISOString()
                    : s.createdAt || new Date().toISOString(),
              })),
              savedCandidateSearches: (
                rawData.savedCandidateSearches || []
              ).map((s: any) => ({
                ...s,
                id: s.id || uuidv4(),
                createdAt:
                  s.createdAt instanceof Timestamp
                    ? s.createdAt.toDate().toISOString()
                    : s.createdAt || new Date().toISOString(),
              })),
              experiences:
                experiences.length > 0
                  ? experiences
                  : rawData.role === 'jobSeeker'
                    ? [createEmptyExperience()]
                    : [],
              educations:
                educations.length > 0
                  ? educations
                  : rawData.role === 'jobSeeker'
                    ? [createEmptyEducation()]
                    : [],
              languages:
                languages.length > 0
                  ? languages
                  : rawData.role === 'jobSeeker'
                    ? [createEmptyLanguage()]
                    : [],
              totalYearsExperience:
                rawData.totalYearsExperience === null
                  ? undefined
                  : rawData.totalYearsExperience,
              totalMonthsExperience:
                rawData.totalMonthsExperience === null
                  ? undefined
                  : rawData.totalMonthsExperience,
            } as UserProfile;
            setUser(profileData);

            if (profileData.theme) {
              applyTheme(profileData.theme);
            }

            if (
              (profileData.role === 'employer' ||
                profileData.role === 'admin' || // Admins/Mods might be associated with a "platform" company if needed
                profileData.role === 'moderator' ||
                profileData.role === 'superAdmin') &&
              profileData.companyId
            ) {
              const companyDocRef = doc(db, 'companies', profileData.companyId);
              const companyDocSnap = await getDoc(companyDocRef);
              if (companyDocSnap.exists()) {
                const companyRawData = companyDocSnap.data();
                setCompany({
                  id: companyDocSnap.id,
                  ...companyRawData,
                  createdAt:
                    companyRawData.createdAt instanceof Timestamp
                      ? companyRawData.createdAt.toDate().toISOString()
                      : companyRawData.createdAt,
                  updatedAt:
                    companyRawData.updatedAt instanceof Timestamp
                      ? companyRawData.updatedAt.toDate().toISOString()
                      : companyRawData.updatedAt,
                } as Company);
              } else {
                setCompany(null);
                if (profileData.role === 'employer') {
                  console.warn(
                    `Company with ID ${profileData.companyId} not found for user ${fbUser.uid}`
                  );
                }
              }
            } else {
              setCompany(null);
            }
          } else {
            setUser(null);
            setCompany(null);
          }
        } catch (error: unknown) {
          console.error(
            'AuthContext: Error fetching user or company profile from Firestore:',
            error
          );
          setUser(null);
          setCompany(null);
        }
      } else {
        setUser(null);
        setCompany(null);
        applyTheme('system');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  useEffect(() => {
    if (user?.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [user?.theme]);

  const createUserProfileInFirestore = async (
    fbUser: FirebaseUser,
    name: string,
    role: UserRole,
    companyNameForNewCompany?: string,
    existingCompanyId?: string
  ): Promise<UserProfile> => {
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
      setCompany({ id: newCompanyRef.id, ...newCompanyData } as Company);
    }

    const userProfileData: Partial<UserProfile> = {
      uid: fbUser.uid,
      email: fbUser.email,
      name:
        name ||
        fbUser.displayName ||
        (role === 'employer'
          ? 'Recruiter'
          : role === 'admin' || role === 'superAdmin' || role === 'moderator'
            ? 'Platform Staff'
            : 'New User'),
      role: role,
      avatarUrl: fbUser.photoURL || '',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      lastActive: serverTimestamp() as Timestamp,
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
      userProfileData.savedCandidateSearches = [];
    } else if (role === 'jobSeeker') {
      userProfileData.appliedJobIds = [];
      userProfileData.savedJobIds = [];
      userProfileData.savedSearches = [];
      userProfileData.headline = '';
      userProfileData.skills = [];
      userProfileData.mobileNumber = '';
      userProfileData.experiences = [createEmptyExperience()];
      userProfileData.educations = [createEmptyEducation()];
      userProfileData.languages = [createEmptyLanguage()];
      userProfileData.gender = 'Prefer not to say';
      userProfileData.dateOfBirth = undefined;
      userProfileData.currentCTCValue = undefined;
      userProfileData.currentCTCConfidential = false;
      userProfileData.expectedCTCValue = undefined;
      userProfileData.expectedCTCNegotiable = false;
      userProfileData.homeState = '';
      userProfileData.homeCity = '';
      userProfileData.parsedResumeText = '';
      userProfileData.isProfileSearchable = true;
      userProfileData.availability = 'Flexible';
      userProfileData.jobSearchStatus = 'activelyLooking';
      userProfileData.totalYearsExperience = 0;
      userProfileData.totalMonthsExperience = 0;
    } else if (
      role === 'admin' ||
      role === 'superAdmin' ||
      role === 'moderator'
    ) {
      // Admin/SuperAdmin/Moderator specific fields (if any)
      // For example, they might not have job seeker specific fields
      // or might be associated with a default "platform" company for organizational purposes.
      // For now, they'll have basic profile + role.
    }

    const finalProfileDataForFirestore: Record<string, unknown> = {};
    for (const key in userProfileData) {
      const typedKey = key as keyof UserProfile;
      const value = userProfileData[typedKey];

      if (value !== undefined) {
        finalProfileDataForFirestore[key] = value;
      } else {
        const nullableJobSeekerFields: Array<keyof UserProfile> = [
          'dateOfBirth',
          'currentCTCValue',
          'expectedCTCValue',
          'totalYearsExperience',
          'totalMonthsExperience',
          'avatarUrl',
          'headline',
          'parsedResumeText',
          'mobileNumber',
          'portfolioUrl',
          'linkedinUrl',
          'resumeUrl',
          'resumeFileName',
          'homeState',
          'homeCity',
        ];
        if (
          role === 'jobSeeker' &&
          nullableJobSeekerFields.includes(typedKey)
        ) {
          finalProfileDataForFirestore[key] = null;
        }
        if (
          (role === 'employer' ||
            role === 'admin' ||
            role === 'superAdmin' ||
            role === 'moderator') &&
          typedKey === 'avatarUrl'
        ) {
          finalProfileDataForFirestore[key] = null;
        }
      }
    }

    if (role === 'jobSeeker') {
      finalProfileDataForFirestore.skills =
        finalProfileDataForFirestore.skills || [];
      finalProfileDataForFirestore.preferredLocations =
        finalProfileDataForFirestore.preferredLocations || [];
      finalProfileDataForFirestore.appliedJobIds =
        finalProfileDataForFirestore.appliedJobIds || [];
      finalProfileDataForFirestore.savedJobIds =
        finalProfileDataForFirestore.savedJobIds || [];
      finalProfileDataForFirestore.savedSearches =
        finalProfileDataForFirestore.savedSearches || [];

      finalProfileDataForFirestore.experiences = (
        finalProfileDataForFirestore.experiences || [createEmptyExperience()]
      ).map((exp: Partial<ExperienceEntry>) => ({
        id: exp.id || uuidv4(),
        companyName: exp.companyName || '',
        jobRole: exp.jobRole || '',
        startDate: exp.startDate || null,
        endDate: exp.endDate || null,
        currentlyWorking: exp.currentlyWorking || false,
        description: exp.description || '',
        annualCTC: exp.annualCTC === undefined ? null : exp.annualCTC,
      }));
      finalProfileDataForFirestore.educations = (
        finalProfileDataForFirestore.educations || [createEmptyEducation()]
      ).map((edu: Partial<EducationEntry>) => ({
        id: edu.id || uuidv4(),
        level: edu.level || 'Graduate',
        degreeName: edu.degreeName || '',
        instituteName: edu.instituteName || '',
        startYear: edu.startYear === undefined ? null : edu.startYear,
        endYear: edu.endYear === undefined ? null : edu.endYear,
        specialization: edu.specialization || '',
        courseType: edu.courseType || 'Full Time',
        isMostRelevant: edu.isMostRelevant || false,
        description: edu.description || '',
      }));
      finalProfileDataForFirestore.languages = (
        finalProfileDataForFirestore.languages || [createEmptyLanguage()]
      ).map((lang: Partial<LanguageEntry>) => ({
        id: lang.id || uuidv4(),
        languageName: lang.languageName || '',
        proficiency: lang.proficiency || 'Beginner',
        canRead: lang.canRead || false,
        canWrite: lang.canWrite || false,
        canSpeak: lang.canSpeak || false,
      }));
    }

    if (role === 'employer') {
      finalProfileDataForFirestore.savedCandidateSearches =
        finalProfileDataForFirestore.savedCandidateSearches || [];
    }

    try {
      await setDoc(userDocRef, finalProfileDataForFirestore);
      const fullProfile = {
        ...userProfileData,
        uid: fbUser.uid,
        email: fbUser.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        experiences: finalProfileDataForFirestore.experiences || [],
        educations: finalProfileDataForFirestore.educations || [],
        languages: finalProfileDataForFirestore.languages || [],
        savedCandidateSearches:
          finalProfileDataForFirestore.savedCandidateSearches || [],
        totalYearsExperience:
          finalProfileDataForFirestore.totalYearsExperience === null
            ? undefined
            : (finalProfileDataForFirestore.totalYearsExperience as number),
        totalMonthsExperience:
          finalProfileDataForFirestore.totalMonthsExperience === null
            ? undefined
            : (finalProfileDataForFirestore.totalMonthsExperience as number),
      } as UserProfile;

      setUser(fullProfile);

      if (fullProfile.theme) {
        applyTheme(fullProfile.theme);
      }
      return fullProfile;
    } catch (error: unknown) {
      console.error(
        'AuthContext: Firestore setDoc FAILED for UID:',
        fbUser.uid,
        'Error:',
        error,
        'Data attempted:',
        JSON.stringify(finalProfileDataForFirestore, null, 2)
      );
      throw error;
    }
  };

  const registerUser = async (
    email: string,
    pass: string,
    name: string,
    role: UserRole,
    companyName?: string
  ): Promise<FirebaseUser> => {
    if (!auth) {
      throw new Error(
        'Firebase Authentication is not configured. Please check your environment variables.'
      );
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        pass
      );
      const fbUser = userCredential.user;
      await createUserProfileInFirestore(fbUser, name, role, companyName);
      return fbUser;
    } catch (error: unknown) {
      console.error('AuthContext: registerUser error', error);
      throw error;
    }
  };

  const loginUser = async (
    email: string,
    pass: string
  ): Promise<FirebaseUser> => {
    if (!auth) {
      throw new Error(
        'Firebase Authentication is not configured. Please check your environment variables.'
      );
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  };

  const signInWithSocial = async (
    provider: FirebaseAuthProvider,
    role: UserRole,
    companyName?: string
  ): Promise<FirebaseUser> => {
    if (!auth) {
      throw new Error(
        'Firebase Authentication is not configured. Please check your environment variables.'
      );
    }
    try {
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await createUserProfileInFirestore(
          fbUser,
          fbUser.displayName ||
            (role === 'employer' ? 'Recruiter' : 'New User'),
          role,
          companyName
        );
      } else {
        const rawData = userDocSnap.data();

        if (rawData.status === 'deleted') {
          await signOut(auth);
          setUser(null);
          setFirebaseUser(null);
          setCompany(null);
          toast({
            title: 'Account Deactivated',
            description:
              'This account has been deactivated. Please contact support.',
            variant: 'destructive',
            duration: Infinity,
          });
          throw new Error('Account is deleted.');
        }

        let dobString: string | undefined = undefined;
        if (rawData.dateOfBirth) {
          if (
            typeof rawData.dateOfBirth === 'string' &&
            isValid(parse(rawData.dateOfBirth, 'yyyy-MM-dd', new Date()))
          ) {
            dobString = rawData.dateOfBirth;
          } else if (rawData.dateOfBirth instanceof Timestamp) {
            dobString = format(rawData.dateOfBirth.toDate(), 'yyyy-MM-dd');
          } else if (
            rawData.dateOfBirth instanceof Date &&
            isValid(rawData.dateOfBirth)
          ) {
            dobString = format(rawData.dateOfBirth, 'yyyy-MM-dd');
          } else {
            dobString = undefined;
          }
        } else {
          dobString = undefined;
        }

        const existingProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
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
          savedSearches: (rawData.savedSearches || []).map((s: any) => ({
            ...s,
            id: s.id || uuidv4(),
            createdAt:
              s.createdAt instanceof Timestamp
                ? s.createdAt.toDate().toISOString()
                : s.createdAt || new Date().toISOString(),
          })),
          savedCandidateSearches: (rawData.savedCandidateSearches || []).map(
            (s: any) => ({
              ...s,
              id: s.id || uuidv4(),
              createdAt:
                s.createdAt instanceof Timestamp
                  ? s.createdAt.toDate().toISOString()
                  : s.createdAt || new Date().toISOString(),
            })
          ),
          experiences: (rawData.experiences || []).map(
            (exp: Partial<ExperienceEntry>) => ({
              id: exp.id || uuidv4(),
              companyName: exp.companyName || '',
              jobRole: exp.jobRole || '',
              startDate: exp.startDate || undefined,
              endDate: exp.endDate || undefined,
              currentlyWorking: exp.currentlyWorking || false,
              description: exp.description || '',
              annualCTC:
                exp.annualCTC === null ||
                exp.annualCTC === undefined ||
                isNaN(Number(exp.annualCTC))
                  ? undefined
                  : Number(exp.annualCTC),
            })
          ),
          educations: (rawData.educations || []).map(
            (edu: Partial<EducationEntry>) => ({
              id: edu.id || uuidv4(),
              level: edu.level || 'Graduate',
              degreeName: edu.degreeName || '',
              instituteName: edu.instituteName || '',
              startYear:
                edu.startYear === null ||
                edu.startYear === undefined ||
                isNaN(Number(edu.startYear))
                  ? undefined
                  : Number(edu.startYear),
              endYear:
                edu.endYear === null ||
                edu.endYear === undefined ||
                isNaN(Number(edu.endYear))
                  ? undefined
                  : Number(edu.endYear),
              specialization: edu.specialization || '',
              courseType: edu.courseType || 'Full Time',
              isMostRelevant: edu.isMostRelevant || false,
              description: edu.description || '',
            })
          ),
          languages: (rawData.languages || []).map(
            (lang: Partial<LanguageEntry>) => ({
              id: lang.id || uuidv4(),
              languageName: lang.languageName || '',
              proficiency: lang.proficiency || 'Beginner',
              canRead: lang.canRead || false,
              canWrite: lang.canWrite || false,
              canSpeak: lang.canSpeak || false,
            })
          ),
          totalYearsExperience:
            rawData.totalYearsExperience === null
              ? undefined
              : rawData.totalYearsExperience,
          totalMonthsExperience:
            rawData.totalMonthsExperience === null
              ? undefined
              : rawData.totalMonthsExperience,
        } as UserProfile;

        let updatesNeeded = false;
        const updates: Record<string, unknown> = {};
        updates.lastActive = serverTimestamp();

        if (existingProfile.role !== role) {
          updates.role = role;
          updatesNeeded = true;
        }
        if (role === 'employer' && !existingProfile.companyId && companyName) {
          const newCompanyRef = doc(collection(db, 'companies'));
          const newCompanyData: Omit<Company, 'id'> = {
            name: companyName,
            adminUids: [fbUser.uid],
            recruiterUids: [fbUser.uid],
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp,
            status: 'pending',
            moderationReason: '',
          };
          await setDoc(newCompanyRef, newCompanyData);
          updates.companyId = newCompanyRef.id;
          updates.isCompanyAdmin = true;
          updatesNeeded = true;
          setCompany({ id: newCompanyRef.id, ...newCompanyData } as Company);
        }
        if (role === 'jobSeeker' && !existingProfile.savedSearches) {
          updates.savedSearches = [];
          updatesNeeded = true;
        }
        if (role === 'employer' && !existingProfile.savedCandidateSearches) {
          updates.savedCandidateSearches = [];
          updatesNeeded = true;
        }
        if (role === 'jobSeeker' && existingProfile.experiences === undefined) {
          updates.experiences = [createEmptyExperience()].map((exp) => ({
            ...exp,
            startDate: null,
            endDate: null,
            annualCTC: null,
          }));
          updatesNeeded = true;
        }
        if (role === 'jobSeeker' && existingProfile.educations === undefined) {
          updates.educations = [createEmptyEducation()].map((edu) => ({
            ...edu,
            startYear: null,
            endYear: null,
          }));
          updatesNeeded = true;
        }
        if (role === 'jobSeeker' && existingProfile.languages === undefined) {
          updates.languages = [createEmptyLanguage()];
          updatesNeeded = true;
        }

        if (
          role === 'jobSeeker' &&
          existingProfile.mobileNumber === undefined
        ) {
          updates.mobileNumber = '';
          updatesNeeded = true;
        }
        if (!existingProfile.theme) {
          updates.theme = 'system';
          updatesNeeded = true;
        }
        if (
          role === 'jobSeeker' &&
          existingProfile.totalYearsExperience === undefined
        ) {
          updates.totalYearsExperience = 0;
          updatesNeeded = true;
        }
        if (
          role === 'jobSeeker' &&
          existingProfile.totalMonthsExperience === undefined
        ) {
          updates.totalMonthsExperience = 0;
          updatesNeeded = true;
        }

        if (updatesNeeded) {
          updates.updatedAt = serverTimestamp();
          await updateDoc(userDocRef, updates);
          setUser({ ...existingProfile, ...updates } as UserProfile);
          if (updates.theme)
            applyTheme(updates.theme as 'light' | 'dark' | 'system');
        } else {
          await updateDoc(userDocRef, { lastActive: serverTimestamp() });
          setUser(existingProfile);
          if (existingProfile.theme) applyTheme(existingProfile.theme);
          if (
            (existingProfile.role === 'employer' ||
              existingProfile.role === 'admin' ||
              existingProfile.role === 'moderator' ||
              existingProfile.role === 'superAdmin') &&
            existingProfile.companyId
          ) {
            const companyDocRef = doc(
              db,
              'companies',
              existingProfile.companyId
            );
            const companyDocSnap = await getDoc(companyDocRef);
            if (companyDocSnap.exists()) {
              const companyRawData = companyDocSnap.data();
              setCompany({
                id: companyDocSnap.id,
                ...companyRawData,
                createdAt:
                  companyRawData.createdAt instanceof Timestamp
                    ? companyRawData.createdAt.toDate().toISOString()
                    : companyRawData.createdAt,
                updatedAt:
                  companyRawData.updatedAt instanceof Timestamp
                    ? companyRawData.updatedAt.toDate().toISOString()
                    : companyRawData.updatedAt,
              } as Company);
            }
          }
        }
      }
      return fbUser;
    } catch (error: unknown) {
      console.error('AuthContext: signInWithSocial error', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (user && user.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { lastActive: serverTimestamp() });
      }
      if (auth) {
        await signOut(auth);
      }
      setUser(null);
      setFirebaseUser(null);
      setCompany(null);
      applyTheme('system');
    } catch (error: unknown) {
      console.error('AuthContext: logout error', error);
      throw error;
    }
  };

  const changeUserPassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!auth) {
      throw new Error(
        'Firebase Authentication is not configured. Please check your environment variables.'
      );
    }
    if (!firebaseUser || !firebaseUser.email) {
      throw new Error('User not authenticated or email not available.');
    }
    try {
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(firebaseUser, credential);
      await firebaseUpdatePassword(firebaseUser, newPassword);
    } catch (error: unknown) {
      console.error('AuthContext: changeUserPassword error', error);
      throw error;
    }
  };

  const updateUserProfile = async (updatedData: Partial<UserProfile>) => {
    if (!user || !user.uid) {
      console.error('AuthContext: User not logged in to update profile.');
      throw new Error('User not logged in to update profile.');
    }

    const userDocRef = doc(db, 'users', user.uid);
    const payloadForFirestore: { [key: string]: unknown } = {};

    const nullableFields: Array<keyof UserProfile> = [
      'dateOfBirth',
      'currentCTCValue',
      'expectedCTCValue',
      'totalYearsExperience',
      'totalMonthsExperience',
      'avatarUrl',
      'headline',
      'mobileNumber',
      'portfolioUrl',
      'linkedinUrl',
      'homeState',
      'homeCity',
      'parsedResumeText',
      'resumeUrl',
      'resumeFileName',
      'companyId',
    ];

    (Object.keys(updatedData) as Array<keyof UserProfile>).forEach((key) => {
      const value = updatedData[key];

      if (value === undefined) {
        if (nullableFields.includes(key)) {
          payloadForFirestore[key] = null;
        }
      } else if (Array.isArray(value)) {
        if (
          key === 'experiences' ||
          key === 'educations' ||
          key === 'languages'
        ) {
          payloadForFirestore[key] = value.map(
            (item: Record<string, unknown>) => {
              const cleanedItem: { [key: string]: unknown } = { ...item };
              Object.keys(cleanedItem).forEach((prop) => {
                if (cleanedItem[prop] === undefined) {
                  if (
                    (prop === 'startDate' ||
                      prop === 'endDate' ||
                      prop === 'annualCTC') &&
                    key === 'experiences'
                  ) {
                    cleanedItem[prop] = null;
                  } else if (
                    (prop === 'startYear' || prop === 'endYear') &&
                    key === 'educations'
                  ) {
                    cleanedItem[prop] = null;
                  } else {
                    delete cleanedItem[prop];
                  }
                }
              });
              return cleanedItem;
            }
          );
        } else {
          payloadForFirestore[key] = value;
        }
      } else {
        payloadForFirestore[key] = value;
      }
    });

    payloadForFirestore.updatedAt = serverTimestamp();
    payloadForFirestore.lastActive = serverTimestamp();

    const actualChanges = Object.keys(payloadForFirestore).filter(
      (k) => k !== 'updatedAt' && k !== 'lastActive'
    );

    if (actualChanges.length > 0) {
      try {
        await updateDoc(userDocRef, payloadForFirestore);
        const updatedUserForState: UserProfile = { ...user } as UserProfile;
        for (const key in payloadForFirestore) {
          if (key !== 'updatedAt' && key !== 'lastActive') {
            const typedKey = key as keyof UserProfile;
            (updatedUserForState[typedKey] as any) = payloadForFirestore[key];
          }
        }
        updatedUserForState.updatedAt = new Date().toISOString();
        updatedUserForState.lastActive = new Date().toISOString();
        setUser(updatedUserForState);
        if (updatedData.theme) {
          applyTheme(updatedData.theme as 'light' | 'dark' | 'system');
        }
      } catch (error: unknown) {
        console.error('AuthContext: updateUserProfile error', error);
        throw error;
      }
    } else if (user) {
      try {
        await updateDoc(userDocRef, {
          updatedAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        });
        setUser({
          ...user,
          updatedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        } as UserProfile);
      } catch (error: unknown) {
        console.error(
          'AuthContext: updateUserProfile (timestamps only) error',
          error
        );
        throw error;
      }
    }
  };

  const updateCompanyProfile = async (
    companyId: string,
    updatedData: Partial<Company>
  ) => {
    if (
      !user ||
      user.role !== 'employer' ||
      !user.isCompanyAdmin ||
      user.companyId !== companyId
    ) {
      console.error(
        'AuthContext: Unauthorized or invalid operation to update company profile.'
      );
      throw new Error('Unauthorized to update company profile.');
    }
    const companyDocRef = doc(db, 'companies', companyId);
    const dataToUpdate: { [key: string]: unknown } = {
      ...updatedData,
      updatedAt: serverTimestamp(),
    };
    delete dataToUpdate.id;

    Object.keys(dataToUpdate).forEach((key) => {
      if (dataToUpdate[key] === undefined) {
        const companyNullableFields: Array<keyof Company> = [
          'description',
          'websiteUrl',
          'logoUrl',
          'bannerImageUrl',
          'moderationReason',
        ];
        if (companyNullableFields.includes(key as keyof Company)) {
          dataToUpdate[key] = null;
        } else {
          delete dataToUpdate[key];
        }
      }
    });

    try {
      await updateDoc(companyDocRef, dataToUpdate);
      setCompany(
        (prevCompany) =>
          ({ ...prevCompany, ...dataToUpdate, id: companyId }) as Company
      );
    } catch (error: unknown) {
      console.error('AuthContext: updateCompanyProfile error', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        firebaseUser,
        loading,
        logout,
        registerUser,
        loginUser,
        updateUserProfile,
        updateCompanyProfile,
        signInWithSocial,
        changeUserPassword,
      }}
    >
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
