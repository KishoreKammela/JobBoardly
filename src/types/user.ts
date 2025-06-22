import type { Timestamp } from 'firebase/firestore';
import type { SavedCandidateSearch, SavedSearch } from './job';

export type UserRole =
  | 'jobSeeker'
  | 'employer'
  | 'admin'
  | 'superAdmin'
  | 'moderator'
  | 'supportAgent'
  | 'dataAnalyst'
  | 'complianceOfficer'
  | 'systemMonitor';

export interface LanguageEntry {
  id: string;
  languageName: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
  canRead: boolean;
  canWrite: boolean;
  canSpeak: boolean;
}

export interface ExperienceEntry {
  id: string;
  companyName: string;
  jobRole: string;
  startDate?: string | undefined;
  endDate?: string | undefined;
  currentlyWorking: boolean;
  description?: string;
  annualCTC?: number;
}

export interface EducationEntry {
  id: string;
  level:
    | 'Post Graduate'
    | 'Graduate'
    | 'Schooling (XII)'
    | 'Schooling (X)'
    | 'Certification / Other';
  degreeName: string;
  instituteName: string;
  startYear?: number;
  endYear?: number;
  specialization?: string;
  courseType?: 'Full Time' | 'Part Time' | 'Distance Learning';
  isMostRelevant?: boolean;
  description?: string;
}

export interface UserProfile {
  uid: string;
  role: UserRole;
  email: string | null;
  name: string;
  avatarUrl?: string;
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
  status?: 'active' | 'suspended' | 'deleted';
  theme?: 'light' | 'dark' | 'system';
  jobBoardDisplay?: 'list' | 'grid';
  itemsPerPage?: 10 | 20 | 50;
  jobAlerts?: {
    newJobsMatchingProfile: boolean;
    savedSearchAlerts: boolean;
    applicationStatusUpdates: boolean;
  };

  headline?: string;
  skills?: string[];
  parsedResumeText?: string;

  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  dateOfBirth?: string;
  currentCTCValue?: number;
  currentCTCConfidential?: boolean;
  expectedCTCValue?: number;
  expectedCTCNegotiable?: boolean;
  homeState?: string;
  homeCity?: string;
  totalYearsExperience?: number;
  totalMonthsExperience?: number;

  experiences?: ExperienceEntry[];
  educations?: EducationEntry[];
  languages?: LanguageEntry[];

  mobileNumber?: string;
  noticePeriod?:
    | 'Immediately Available'
    | '1 Month'
    | '2 Months'
    | '3 Months'
    | '4 Months'
    | '5 Months'
    | '6 Months'
    | 'More than 6 Months'
    | 'Flexible';
  portfolioUrl?: string;
  linkedinUrl?: string;
  preferredLocations?: string[];
  jobSearchStatus?: 'activelyLooking' | 'openToOpportunities' | 'notLooking';
  isProfileSearchable?: boolean;
  resumeUrl?: string;
  resumeFileName?: string;

  appliedJobIds?: string[];
  savedJobIds?: string[];
  savedSearches?: SavedSearch[];

  savedCandidateSearches?: SavedCandidateSearch[];

  companyId?: string;
  isCompanyAdmin?: boolean;
  companyRecruiters?: UserProfile[];

  jobsAppliedCount?: number;
  lastActive?: Timestamp | Date | string;
}

export interface ParsedResumeData {
  name?: string;
  email?: string;
  mobileNumber?: string;
  headline?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  totalYearsExperience?: number;
}

export interface UserSettings {
  jobBoardDisplay: 'list' | 'grid';
  itemsPerPage: 10 | 20 | 50;
  jobAlerts: {
    newJobsMatchingProfile: boolean;
    savedSearchAlerts: boolean;
    applicationStatusUpdates: boolean;
  };
  searchHistory: string[];
}

export interface LegalDocument {
  id: string;
  content: string;
  lastUpdated: Timestamp | Date | string;
}
