import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'jobSeeker' | 'employer' | 'admin' | 'superAdmin';

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: 'text' | 'yesNo';
  isRequired: boolean;
}

export interface ApplicationAnswer {
  questionId: string;
  questionText: string;
  answer: string;
}

export interface Filters {
  searchTerm: string;
  location: string;
  roleType: string;
  isRemote: boolean;
  recentActivity?: 'any' | '24h' | '7d' | '30d';
}

export interface CandidateFilters {
  searchTerm: string;
  location: string; // General location preference for candidates
  availability: string;
  jobSearchStatus?:
    | 'all'
    | 'activelyLooking'
    | 'openToOpportunities'
    | 'notLooking';
  desiredSalaryMin?: number;
  desiredSalaryMax?: number;
  recentActivity?: 'any' | '24h' | '7d' | '30d'; // Based on profile updatedAt
  gender?: 'all' | 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  homeState?: string; // Specific home state of candidate
  homeCity?: string; // Specific home city of candidate
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: Filters;
  createdAt: Timestamp | Date | string;
}

export interface LanguageEntry {
  id: string;
  languageName: string; // Changed from 'language'
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
  canRead: boolean;
  canWrite: boolean;
  canSpeak: boolean;
}

export interface ExperienceEntry {
  id: string;
  companyName: string;
  jobRole: string;
  startDate?: string; // YYYY-MM
  endDate?: string; // YYYY-MM
  currentlyWorking: boolean;
  description?: string;
  annualCTC?: number; // Compensation for this specific role
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

export interface Company {
  id: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
  bannerImageUrl?: string;
  adminUids: string[];
  recruiterUids: string[];
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  moderationReason?: string;
  jobCount?: number;
  applicationCount?: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description: string;
  postedDate: string | Timestamp;
  isRemote: boolean;
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  companyLogoUrl?: string;
  postedById: string;
  status: 'pending' | 'approved' | 'rejected';
  moderationReason?: string;
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
  screeningQuestions?: ScreeningQuestion[];
}

export type ApplicationStatus =
  | 'Applied'
  | 'Reviewed'
  | 'Interviewing'
  | 'Offer Made'
  | 'Hired'
  | 'Rejected By Company'
  | 'Withdrawn by Applicant';

export const EmployerManagedApplicationStatuses: ApplicationStatus[] = [
  'Applied',
  'Reviewed',
  'Interviewing',
  'Offer Made',
  'Hired',
  'Rejected By Company',
];

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantName: string;
  applicantAvatarUrl?: string;
  applicantHeadline?: string;
  companyId: string;
  postedById: string;
  status: ApplicationStatus;
  appliedAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
  employerNotes?: string;
  answers?: ApplicationAnswer[];
}

export interface UserProfile {
  uid: string;
  role: UserRole;
  email: string | null;
  name: string;
  avatarUrl?: string;
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
  status?: 'active' | 'suspended'; // For admin user management
  theme?: 'light' | 'dark' | 'system';
  jobBoardDisplay?: 'list' | 'grid'; // For job seeker's job board view
  itemsPerPage?: 10 | 20 | 50; // For job seeker's job board view
  jobAlerts?: {
    // For job seeker
    newJobsMatchingProfile: boolean;
    savedSearchAlerts: boolean;
    applicationStatusUpdates: boolean;
  };

  // Job Seeker Specific Fields
  headline?: string;
  skills?: string[];
  parsedResumeText?: string; // Summary from resume parsing

  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  dateOfBirth?: string; // YYYY-MM-DD
  currentCTCValue?: number;
  currentCTCConfidential?: boolean;
  expectedCTCValue?: number;
  expectedCTCNegotiable?: boolean;
  homeState?: string;
  homeCity?: string;

  experiences?: ExperienceEntry[];
  educations?: EducationEntry[];
  languages?: LanguageEntry[];

  mobileNumber?: string;
  availability?: 'Immediate' | '2 Weeks Notice' | '1 Month Notice' | 'Flexible';
  portfolioUrl?: string;
  linkedinUrl?: string;
  preferredLocations?: string[];
  jobSearchStatus?: 'activelyLooking' | 'openToOpportunities' | 'notLooking';
  // desiredSalary is now expectedCTCValue for consistency. Keep for legacy if any, but prefer expectedCTCValue.
  isProfileSearchable?: boolean;
  resumeUrl?: string;
  resumeFileName?: string;

  // User Activity
  appliedJobIds?: string[];
  savedJobIds?: string[];
  savedSearches?: SavedSearch[];

  // Employer Specific Fields
  companyId?: string;
  isCompanyAdmin?: boolean;

  // Admin/System Usage
  jobsAppliedCount?: number;
  lastActive?: Timestamp | Date | string;
}

export interface ParsedResumeData {
  name?: string;
  email?: string;
  headline?: string;
  skills?: string[];
  // Experience and Education from resume are now primarily parsed into structured data
  // but a raw text summary can still be useful.
  experience?: string; // Changed from experienceSummary to match UserProfileForm
  education?: string; // Changed from educationSummary
  portfolioUrl?: string;
  linkedinUrl?: string;
  mobileNumber?: string; // Added mobile number
}

export interface ParsedJobData {
  title?: string;
  description?: string;
  skills?: string[];
  location?: string;
  jobType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salaryMin?: number;
  salaryMax?: number;
}
