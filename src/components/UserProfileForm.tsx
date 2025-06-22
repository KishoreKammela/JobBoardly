// src/components/UserProfileForm.tsx
'use client';
import { useState, useEffect, type FormEvent } from 'react';
import type { UserProfile, Company } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { v4 as uuidv4 } from 'uuid';
import { format, parse, isValid } from 'date-fns';

import { PersonalInformationSection } from './profile/PersonalInformationSection';
import { JobSeekerProfessionalSummarySection } from './profile/JobSeekerProfessionalSummarySection';
import { AISummaryGeneratorSection } from './profile/AISummaryGeneratorSection';
import { JobSeekerExperienceSection } from './profile/JobSeekerExperienceSection';
import { JobSeekerEducationSection } from './profile/JobSeekerEducationSection';
import { JobSeekerLanguagesSection } from './profile/JobSeekerLanguagesSection';
import { JobSeekerCompensationSection } from './profile/JobSeekerCompensationSection';
import { JobSeekerPreferencesSection } from './profile/JobSeekerPreferencesSection';
import { EmployerCompanyProfileFormSection } from './profile/EmployerCompanyProfileFormSection';

import type { ExperienceEntry, EducationEntry, LanguageEntry } from '@/types';

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

const initialUserFormData: Partial<UserProfile> = {
  name: '',
  avatarUrl: '',
  headline: '',
  skills: [],
  experiences: [createEmptyExperience()],
  educations: [createEmptyEducation()],
  languages: [createEmptyLanguage()],
  mobileNumber: '',
  noticePeriod: 'Flexible',
  portfolioUrl: '',
  linkedinUrl: '',
  preferredLocations: [],
  jobSearchStatus: 'activelyLooking',
  isProfileSearchable: true,
  gender: 'Prefer not to say',
  dateOfBirth: undefined,
  currentCTCValue: undefined,
  currentCTCConfidential: false,
  expectedCTCValue: undefined,
  expectedCTCNegotiable: false,
  homeState: '',
  homeCity: '',
  parsedResumeText: '',
  totalYearsExperience: 0,
  totalMonthsExperience: 0,
};

const initialCompanyFormData: Partial<Company> = {
  name: '',
  description: '',
  websiteUrl: '',
  logoUrl: '',
  bannerImageUrl: '',
  status: 'pending',
};

interface ModalState {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  onConfirmAction: (() => Promise<void>) | null;
  confirmText: string;
  confirmVariant: 'default' | 'destructive';
}

const defaultModalState: ModalState = {
  isOpen: false,
  title: '',
  description: '',
  onConfirmAction: null,
  confirmText: 'Confirm',
  confirmVariant: 'default',
};

export function UserProfileForm() {
  const {
    user,
    company,
    updateUserProfile,
    updateCompanyProfile,
    loading: authLoading,
  } = useAuth();
  const { toast } = useToast();

  const [userFormData, setUserFormData] =
    useState<Partial<UserProfile>>(initialUserFormData);
  const [companyFormData, setCompanyFormData] = useState<Partial<Company>>(
    initialCompanyFormData
  );
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState<ModalState>(defaultModalState);
  const [isModalActionLoading, setIsModalActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUserFormData({
        name: user.name || '',
        avatarUrl: user.avatarUrl || '',
        headline: user.headline || '',
        skills: user.skills || [],
        experiences:
          user.experiences && user.experiences.length > 0
            ? user.experiences.map((exp: Partial<ExperienceEntry>) => ({
                ...createEmptyExperience(),
                ...exp,
                companyName: exp.companyName || '',
                jobRole: exp.jobRole || '',
                description: exp.description || '',
                startDate:
                  exp.startDate &&
                  isValid(parse(exp.startDate, 'yyyy-MM-dd', new Date()))
                    ? exp.startDate
                    : undefined,
                endDate:
                  exp.endDate &&
                  isValid(parse(exp.endDate, 'yyyy-MM-dd', new Date()))
                    ? exp.endDate
                    : undefined,
              }))
            : [createEmptyExperience()],
        educations:
          user.educations && user.educations.length > 0
            ? user.educations.map((edu: Partial<EducationEntry>) => ({
                ...createEmptyEducation(),
                ...edu,
                degreeName: edu.degreeName || '',
                instituteName: edu.instituteName || '',
                description: edu.description || '',
                specialization: edu.specialization || '',
              }))
            : [createEmptyEducation()],
        languages:
          user.languages && user.languages.length > 0
            ? user.languages.map((lang: Partial<LanguageEntry>) => ({
                ...createEmptyLanguage(),
                ...lang,
                languageName: lang.languageName || '',
              }))
            : [createEmptyLanguage()],
        mobileNumber: user.mobileNumber || '',
        noticePeriod: user.noticePeriod || 'Flexible',
        portfolioUrl: user.portfolioUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        preferredLocations: user.preferredLocations || [],
        jobSearchStatus: user.jobSearchStatus || 'activelyLooking',
        isProfileSearchable:
          user.isProfileSearchable !== undefined
            ? user.isProfileSearchable
            : true,
        gender: user.gender || 'Prefer not to say',
        dateOfBirth: user.dateOfBirth
          ? isValid(parse(user.dateOfBirth, 'yyyy-MM-dd', new Date()))
            ? user.dateOfBirth
            : undefined
          : undefined,
        currentCTCValue:
          user.currentCTCValue === null ? undefined : user.currentCTCValue,
        currentCTCConfidential: user.currentCTCConfidential || false,
        expectedCTCValue:
          user.expectedCTCValue === null ? undefined : user.expectedCTCValue,
        expectedCTCNegotiable: user.expectedCTCNegotiable || false,
        homeState: user.homeState || '',
        homeCity: user.homeCity || '',
        parsedResumeText: user.parsedResumeText || '',
        totalYearsExperience: user.totalYearsExperience || 0,
        totalMonthsExperience: user.totalMonthsExperience || 0,
      });

      if (user.role === 'employer' && company) {
        setCompanyFormData({
          name: company.name || '',
          description: company.description || '',
          websiteUrl: company.websiteUrl || '',
          logoUrl: company.logoUrl || '',
          bannerImageUrl: company.bannerImageUrl || '',
          status: company.status || 'pending',
        });
      }
    } else {
      setUserFormData(initialUserFormData);
      setCompanyFormData(initialCompanyFormData);
    }
  }, [user, company]);

  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setUserFormData((prev) => {
      let newValue: string | number | boolean | undefined = value;
      if (type === 'checkbox') {
        newValue = checked;
      } else if (
        name === 'currentCTCValue' ||
        name === 'expectedCTCValue' ||
        name === 'totalYearsExperience' ||
        name === 'totalMonthsExperience'
      ) {
        newValue = value === '' ? undefined : parseFloat(value);
        if (isNaN(newValue as number)) newValue = undefined;
        if (name === 'totalMonthsExperience' && newValue !== undefined) {
          newValue = Math.max(0, Math.min(11, newValue as number));
        }
        if (name === 'totalYearsExperience' && newValue !== undefined) {
          newValue = Math.max(0, newValue as number);
        }
      }
      return { ...prev, [name]: newValue };
    });
  };

  const handleUserSelectChange = (name: keyof UserProfile, value: string) => {
    setUserFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSwitchChange = (
    name: keyof UserProfile,
    checked: boolean
  ) => {
    setUserFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (
    fieldName: keyof UserProfile,
    date: Date | undefined
  ) => {
    setUserFormData((prev) => ({
      ...prev,
      [fieldName]: date ? format(date, 'yyyy-MM-dd') : undefined,
    }));
  };

  const handleArrayFieldChange = <
    K extends keyof Pick<
      UserProfile,
      'experiences' | 'educations' | 'languages'
    >,
  >(
    arrayName: K,
    index: number,
    field: keyof NonNullable<UserProfile[K]>[number],
    value: string | boolean | number | undefined,
    inputType?: string
  ) => {
    type T = NonNullable<UserProfile[K]>[number];
    setUserFormData((prev) => {
      const currentArray = prev[arrayName] as T[] | undefined;
      if (!currentArray || !currentArray[index]) return prev;

      const newArray = [...currentArray];
      const itemToUpdate = { ...newArray[index] };

      let processedValueFinal: T[keyof T];

      if (inputType === 'checkbox' && typeof value === 'boolean') {
        processedValueFinal = value as T[keyof T];
      } else if (inputType === 'number') {
        const strVal = String(value);
        if (strVal === '' || value === undefined) {
          processedValueFinal = undefined as T[keyof T];
        } else {
          const targetFieldExample = itemToUpdate[field];
          const isFloat =
            typeof targetFieldExample === 'number' &&
            String(targetFieldExample).includes('.');

          const numVal =
            isFloat || String(value).includes('.')
              ? parseFloat(strVal)
              : parseInt(strVal, 10);
          processedValueFinal = isNaN(numVal)
            ? undefined
            : (numVal as T[keyof T]);
        }
      } else if (typeof value === 'string') {
        processedValueFinal = value as T[keyof T];
      } else if (typeof value === 'number') {
        processedValueFinal = value as T[keyof T];
      } else {
        processedValueFinal = value as T[keyof T];
      }
      (itemToUpdate as Record<string, unknown>)[field as string] =
        processedValueFinal;
      newArray[index] = itemToUpdate;
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = <
    K extends keyof Pick<
      UserProfile,
      'experiences' | 'educations' | 'languages'
    >,
  >(
    arrayName: K,
    creatorFunc: () => NonNullable<UserProfile[K]>[number]
  ) => {
    type T = NonNullable<UserProfile[K]>[number];
    setUserFormData((prev) => ({
      ...prev,
      [arrayName]: [...((prev[arrayName] as T[]) || []), creatorFunc()],
    }));
  };

  const removeArrayItem = <
    K extends keyof Pick<
      UserProfile,
      'experiences' | 'educations' | 'languages'
    >,
  >(
    arrayName: K,
    idToRemove: string
  ) => {
    type T = NonNullable<UserProfile[K]>[number];
    setUserFormData((prev) => ({
      ...prev,
      [arrayName]: ((prev[arrayName] as T[]) || []).filter(
        (item) => item.id !== idToRemove
      ),
    }));
  };

  const showConfirmationModal = (
    title: string,
    description: React.ReactNode,
    action: () => Promise<void>,
    confirmText = 'Confirm',
    confirmVariant: 'default' | 'destructive' = 'default'
  ) => {
    setModalState({
      isOpen: true,
      title,
      description,
      onConfirmAction: action,
      confirmText,
      confirmVariant,
    });
  };

  const executeConfirmedAction = async () => {
    if (modalState.onConfirmAction) {
      setIsModalActionLoading(true);
      try {
        await modalState.onConfirmAction();
      } catch (e: unknown) {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } finally {
        setIsModalActionLoading(false);
        setModalState(defaultModalState);
      }
    }
  };

  const performSave = async () => {
    if (!user) return;
    setIsLoading(true);

    const finalExperiences = (userFormData.experiences || [])
      .filter((exp) => exp.companyName || exp.jobRole)
      .map((exp) => ({
        ...exp,
        companyName: exp.companyName || '',
        jobRole: exp.jobRole || '',
        description: exp.description || '',
        startDate: exp.startDate || null,
        endDate: exp.endDate || null,
        annualCTC: exp.annualCTC === undefined ? null : exp.annualCTC,
      }));

    const finalEducations = (userFormData.educations || [])
      .filter((edu) => edu.degreeName || edu.instituteName)
      .map((edu) => ({
        ...edu,
        degreeName: edu.degreeName || '',
        instituteName: edu.instituteName || '',
        description: edu.description || '',
        specialization: edu.specialization || '',
        startYear: edu.startYear === undefined ? null : edu.startYear,
        endYear: edu.endYear === undefined ? null : edu.endYear,
      }));

    const finalLanguages = (userFormData.languages || [])
      .filter((lang) => lang.languageName)
      .map((lang) => ({ ...lang, languageName: lang.languageName || '' }));

    try {
      const userUpdatePayload: Partial<UserProfile> = {
        name: userFormData.name || '',
        avatarUrl: userFormData.avatarUrl || '',
      };
      if (user.role === 'jobSeeker') {
        Object.assign(userUpdatePayload, {
          headline: userFormData.headline || '',
          skills: userFormData.skills || [],
          experiences: finalExperiences,
          educations: finalEducations,
          languages: finalLanguages,
          mobileNumber: userFormData.mobileNumber || '',
          noticePeriod: userFormData.noticePeriod || 'Flexible',
          portfolioUrl: userFormData.portfolioUrl || '',
          linkedinUrl: userFormData.linkedinUrl || '',
          preferredLocations: userFormData.preferredLocations || [],
          jobSearchStatus: userFormData.jobSearchStatus || 'activelyLooking',
          isProfileSearchable: userFormData.isProfileSearchable,
          gender: userFormData.gender || 'Prefer not to say',
          dateOfBirth: userFormData.dateOfBirth || null,
          currentCTCValue:
            userFormData.currentCTCValue === undefined
              ? null
              : userFormData.currentCTCValue,
          currentCTCConfidential: userFormData.currentCTCConfidential || false,
          expectedCTCValue:
            userFormData.expectedCTCValue === undefined
              ? null
              : userFormData.expectedCTCValue,
          expectedCTCNegotiable: userFormData.expectedCTCNegotiable || false,
          homeState: userFormData.homeState || '',
          homeCity: userFormData.homeCity || '',
          parsedResumeText: userFormData.parsedResumeText || '',
          totalYearsExperience:
            userFormData.totalYearsExperience === undefined
              ? null
              : userFormData.totalYearsExperience,
          totalMonthsExperience:
            userFormData.totalMonthsExperience === undefined
              ? null
              : userFormData.totalMonthsExperience,
        });
      }
      await updateUserProfile(userUpdatePayload);

      if (user.role === 'employer' && user.isCompanyAdmin && user.companyId) {
        const companyUpdatePayload: Partial<Company> = {
          name: companyFormData.name || '',
          description: companyFormData.description || '',
          websiteUrl: companyFormData.websiteUrl || '',
          logoUrl: companyFormData.logoUrl || '',
          bannerImageUrl: companyFormData.bannerImageUrl || '',
        };
        await updateCompanyProfile(user.companyId, companyUpdatePayload);
      }

      toast({
        title: 'Profile Updated',
        description: 'Your information has been successfully updated.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    showConfirmationModal(
      'Confirm Profile Update',
      'Are you sure you want to save these changes to your profile?',
      performSave,
      'Save Changes'
    );
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <p>Please log in to view and edit your profile.</p>;
  }

  const isJobSeeker = user.role === 'jobSeeker';
  const isCompanyAdmin = user.role === 'employer' && user.isCompanyAdmin;
  const isDisabledByStatus =
    (user.role === 'jobSeeker' && user.status === 'suspended') ||
    (user.role === 'employer' &&
      company &&
      (company.status === 'suspended' || company.status === 'deleted'));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PersonalInformationSection
        userFormData={userFormData}
        onUserChange={handleUserChange}
        onDateChange={(date) => handleDateChange('dateOfBirth', date)}
        onSelectChange={handleUserSelectChange}
        isJobSeeker={isJobSeeker}
        isDisabled={isDisabledByStatus && !isJobSeeker && !isCompanyAdmin}
        isJobSeekerSuspended={isJobSeeker && user.status === 'suspended'}
        email={user.email || ''}
      />

      {isJobSeeker && (
        <>
          <AISummaryGeneratorSection
            userFormData={userFormData}
            onSummaryGenerated={(summary) =>
              setUserFormData((prev) => ({
                ...prev,
                parsedResumeText: summary,
              }))
            }
            isDisabled={isDisabledByStatus}
          />
          <JobSeekerProfessionalSummarySection
            userFormData={userFormData}
            onUserChange={onUserChange}
            onSkillsChange={(skills) =>
              setUserFormData((prev) => ({ ...prev, skills }))
            }
            isDisabled={isDisabledByStatus}
          />
          <JobSeekerExperienceSection
            experiences={userFormData.experiences || [createEmptyExperience()]}
            onFieldChange={(index, field, value, type) =>
              handleArrayFieldChange('experiences', index, field, value, type)
            }
            onAddItem={() => addArrayItem('experiences', createEmptyExperience)}
            onRemoveItem={(id) => removeArrayItem('experiences', id)}
            isDisabled={isDisabledByStatus}
            onDateChange={(index, fieldName, date) =>
              handleArrayFieldChange(
                'experiences',
                index,
                fieldName,
                date ? format(date, 'yyyy-MM-dd') : undefined
              )
            }
          />
          <JobSeekerEducationSection
            educations={userFormData.educations || [createEmptyEducation()]}
            onFieldChange={(index, field, value, type) =>
              handleArrayFieldChange('educations', index, field, value, type)
            }
            onAddItem={() => addArrayItem('educations', createEmptyEducation)}
            onRemoveItem={(id) => removeArrayItem('educations', id)}
            isDisabled={isDisabledByStatus}
          />
          <JobSeekerLanguagesSection
            languages={userFormData.languages || [createEmptyLanguage()]}
            onFieldChange={(index, field, value, type) =>
              handleArrayFieldChange('languages', index, field, value, type)
            }
            onAddItem={() => addArrayItem('languages', createEmptyLanguage)}
            onRemoveItem={(id) => removeArrayItem('languages', id)}
            isDisabled={isDisabledByStatus}
          />
          <JobSeekerCompensationSection
            userFormData={userFormData}
            onUserChange={onUserChange}
            onSwitchChange={handleUserSwitchChange}
            isDisabled={isDisabledByStatus}
          />
          <JobSeekerPreferencesSection
            userFormData={userFormData}
            onUserChange={onUserChange}
            onLocationsChange={(locations) =>
              setUserFormData((prev) => ({
                ...prev,
                preferredLocations: locations,
              }))
            }
            onSelectChange={handleUserSelectChange}
            onSwitchChange={handleUserSwitchChange}
            isDisabled={isDisabledByStatus}
          />
        </>
      )}

      {isCompanyAdmin && company && (
        <EmployerCompanyProfileFormSection
          companyFormData={companyFormData}
          onCompanyChange={(e) =>
            setCompanyFormData((prev) => ({
              ...prev,
              [e.target.name]: e.target.value,
            }))
          }
          recruiters={user.companyRecruiters || []}
          isFetchingRecruiters={false}
          isDisabled={isDisabledByStatus}
          companyStatus={company.status}
          moderationReason={company.moderationReason}
        />
      )}

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isLoading || authLoading || isDisabledByStatus}
          className="text-lg py-3 px-6"
          aria-label="Save all profile changes"
        >
          {(isLoading || authLoading) && (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          )}
          <Save className="mr-2 h-5 w-5" />
          Save All Changes
        </Button>
      </div>

      <AlertDialog
        open={modalState.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setModalState(defaultModalState);
            setIsModalActionLoading(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{modalState.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {modalState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setModalState({ ...modalState, isOpen: false })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeConfirmedAction}
              disabled={isModalActionLoading}
              className={
                modalState.confirmVariant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {isModalActionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {modalState.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
