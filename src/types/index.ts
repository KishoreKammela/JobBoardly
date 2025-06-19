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
  questionText: string; // Denormalized for easier display
  answer: string;
}

// Define Filters interface globally
export interface Filters {
  searchTerm: string;
  location: string;
  roleType: string; // 'all', 'Full-time', 'Part-time', 'Contract', 'Internship'
  isRemote: boolean;
  recentActivity?: 'any' | '24h' | '7d' | '30d'; // For jobs: based on postedDate or updatedAt
}

export interface CandidateFilters {
  searchTerm: string; // For skills, headline, name
  location: string;
  availability: string; // 'all', 'Immediate', '2 Weeks Notice', '1 Month Notice', 'Flexible'
  jobSearchStatus?:
    | 'all'
    | 'activelyLooking'
    | 'openToOpportunities'
    | 'notLooking';
  desiredSalaryMin?: number;
  desiredSalaryMax?: number;
  recentActivity?: 'any' | '24h' | '7d' | '30d'; // For candidates: based on updatedAt
}

export interface SavedSearch {
  id: string; // Unique ID for the saved search
  name: string;
  filters: Filters;
  createdAt: Timestamp | Date | string;
}

export interface Company {
  id: string; // Firestore document ID
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
  postedById: string; // uid of the employer who posted the job
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
  status?: 'active' | 'suspended';

  // Theme and UI Preferences
  theme?: 'light' | 'dark' | 'system';
  jobBoardDisplay?: 'list' | 'grid';
  itemsPerPage?: 10 | 20 | 50;
  jobAlerts?: {
    newJobsMatchingProfile: boolean;
    savedSearchAlerts: boolean;
    applicationStatusUpdates: boolean;
  };

  // Job Seeker specific fields
  headline?: string;
  skills?: string[];
  experience?: string; // Markdown supported
  education?: string; // Markdown supported
  languages?: string[]; // New field for languages
  mobileNumber?: string;
  availability?: 'Immediate' | '2 Weeks Notice' | '1 Month Notice' | 'Flexible';
  portfolioUrl?: string;
  linkedinUrl?: string;
  preferredLocations?: string[];
  jobSearchStatus?: 'activelyLooking' | 'openToOpportunities' | 'notLooking';
  desiredSalary?: number; // Stored as number, displayed in INR
  isProfileSearchable?: boolean;
  resumeUrl?: string;
  resumeFileName?: string;
  parsedResumeText?: string;
  appliedJobIds?: string[];
  savedJobIds?: string[];
  savedSearches?: SavedSearch[];

  // Employer specific fields
  companyId?: string;
  isCompanyAdmin?: boolean;

  // For admin dashboard display
  jobsAppliedCount?: number; // for job seekers
  lastActive?: Timestamp | Date | string;
}

export interface ParsedResumeData {
  name?: string;
  email?: string;
  headline?: string;
  skills?: string[];
  experience?: string; // Markdown for structure
  education?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
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
