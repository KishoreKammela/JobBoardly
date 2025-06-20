import type { Timestamp } from 'firebase/firestore';

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

export type ScreeningQuestionType =
  | 'text'
  | 'yesNo'
  | 'multipleChoice'
  | 'checkboxGroup';

export interface ScreeningQuestion {
  id: string;
  questionText: string;
  type: ScreeningQuestionType;
  options?: string[]; // For multipleChoice and checkboxGroup
  isRequired: boolean;
}

export interface ApplicationAnswer {
  questionId: string;
  questionText: string; // Store question text for easier display
  answer: string | boolean | string[]; // string for text, boolean for yesNo, string[] for checkboxGroup/multipleChoice
}

export interface Filters {
  searchTerm: string;
  location: string;
  roleType: string;
  isRemote: boolean;
  recentActivity?: 'any' | '24h' | '7d' | '30d' | null;
}

export interface CandidateFilters {
  searchTerm: string;
  location: string;
  availability: string;
  jobSearchStatus?:
    | 'all'
    | 'activelyLooking'
    | 'openToOpportunities'
    | 'notLooking'
    | null;
  desiredSalaryMin?: number | null;
  desiredSalaryMax?: number | null;
  recentActivity?: 'any' | '24h' | '7d' | '30d' | null;
  minExperienceYears?: number | null;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: Filters;
  createdAt: Timestamp | Date | string;
}

export interface SavedCandidateSearch {
  id: string;
  name: string;
  filters: CandidateFilters;
  createdAt: Timestamp | Date | string;
}

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
  startDate?: string | undefined; // YYYY-MM-DD
  endDate?: string | undefined; // YYYY-MM-DD
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
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'deleted';
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
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
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
  postedById: string; // UID of the employer who posted the job
  status: ApplicationStatus;
  appliedAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
  employerNotes?: string;
  answers?: ApplicationAnswer[];
}

export type NotificationType =
  | 'NEW_APPLICATION' // For Employer
  | 'APPLICATION_STATUS_UPDATE' // For Job Seeker
  | 'JOB_APPROVED' // For Employer
  | 'JOB_REJECTED' // For Employer
  | 'COMPANY_APPROVED' // For Employer (Company Admin)
  | 'COMPANY_REJECTED' // For Employer (Company Admin)
  | 'ADMIN_CONTENT_PENDING' // For Admin/Moderator
  | 'GENERIC_INFO'; // For general platform announcements or messages

export interface Notification {
  id: string;
  userId: string; // Recipient's UID
  title: string;
  message: string;
  type: NotificationType;
  link?: string; // Optional link to navigate to on click
  isRead: boolean;
  createdAt: Timestamp | Date | string;
}

export interface UserProfile {
  uid: string;
  role: UserRole;
  email: string | null;
  name: string;
  avatarUrl?: string;
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
  status?: 'active' | 'suspended' | 'deleted'; // User status, can include 'deleted'
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
  dateOfBirth?: string; // YYYY-MM-DD
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
  availability?: 'Immediate' | '2 Weeks Notice' | '1 Month Notice' | 'Flexible';
  portfolioUrl?: string;
  linkedinUrl?: string;
  preferredLocations?: string[];
  jobSearchStatus?: 'activelyLooking' | 'openToOpportunities' | 'notLooking';
  isProfileSearchable?: boolean;
  resumeUrl?: string;
  resumeFileName?: string;

  appliedJobIds?: string[]; // IDs of jobs the user has applied to
  savedJobIds?: string[]; // IDs of jobs the user has saved
  savedSearches?: SavedSearch[];

  savedCandidateSearches?: SavedCandidateSearch[]; // For employers

  companyId?: string; // For employers
  isCompanyAdmin?: boolean; // For employers

  // For Admin Dashboard display
  jobsAppliedCount?: number; // Denormalized for JobSeeker table
  lastActive?: Timestamp | Date | string;

  // Denormalized, primarily for employer search for candidates
  desiredSalary?: number; // Used to store expectedCTCValue if set, for filtering.
}

// For AI Parsing outputs - more flexible before strict Job/UserProfile mapping
export interface ParsedResumeData {
  name?: string;
  email?: string;
  mobileNumber?: string;
  headline?: string;
  skills?: string[];
  experience?: string; // Detailed text summary
  education?: string; // Detailed text summary
  portfolioUrl?: string;
  linkedinUrl?: string;
  totalYearsExperience?: number;
}

export interface ParsedJobData {
  title?: string;
  description?: string;
  skills?: string[];
  location?: string;
  jobType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salaryMin?: number;
  salaryMax?: number;
  // companyName?: string; // Potentially extractable
}

export interface LegalDocument {
  id: string; // e.g., 'privacyPolicy', 'termsOfService'
  content: string; // Markdown content
  lastUpdated: Timestamp | Date | string;
}
