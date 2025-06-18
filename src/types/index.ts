
import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'jobSeeker' | 'employer' | 'admin';

// Define Filters interface globally
export interface Filters {
  searchTerm: string;
  location: string;
  roleType: string; // 'all', 'Full-time', 'Part-time', 'Contract', 'Internship'
  isRemote: boolean;
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
  adminUids: string[]; // UIDs of users who are company admins for this company
  recruiterUids: string[]; // UIDs of all recruiters (including admins) in the company
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
  status: 'pending' | 'approved' | 'rejected'; // For moderation
  moderationReason?: string; // Optional reason for rejection
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string; // Links to the Company document ID
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description: string;
  postedDate: string | Timestamp; // Consider standardizing to string (ISO) or Date object after fetch for consistency
  isRemote: boolean;
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  companyLogoUrl?: string; // Can be sourced from Company.logoUrl
  postedById: string; // UID of the employer who posted it
  // applicantIds?: string[]; // Removed, applications are now a separate collection
  status: 'pending' | 'approved' | 'rejected'; // For moderation
  moderationReason?: string; // Optional reason for rejection
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
}

export type ApplicationStatus = 
  | 'Applied' 
  | 'Reviewed' 
  | 'Interviewing' 
  | 'Offer Made' 
  | 'Hired' 
  | 'Rejected By Company' 
  | 'Withdrawn by Applicant'; // Job seeker might withdraw

export const EmployerManagedApplicationStatuses: ApplicationStatus[] = [
  'Applied', 'Reviewed', 'Interviewing', 'Offer Made', 'Hired', 'Rejected By Company'
];


export interface Application {
  id: string; // Firestore document ID
  jobId: string;
  jobTitle: string; // Denormalized
  applicantId: string; // Job Seeker UID
  applicantName: string; // Denormalized
  applicantAvatarUrl?: string; // Denormalized
  applicantHeadline?: string; // Denormalized
  companyId: string;
  postedById: string; // Employer UID who posted the job (owner of the job post)
  status: ApplicationStatus;
  appliedAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
  employerNotes?: string; // Notes by the employer about this application
}


export interface UserProfile {
  uid: string;
  role: UserRole;
  email: string | null;
  name: string;
  avatarUrl?: string;
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;

  // Job Seeker specific fields
  headline?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  availability?: 'Immediate' | '2 Weeks Notice' | '1 Month Notice' | 'Flexible';
  portfolioUrl?: string;
  linkedinUrl?: string;
  preferredLocations?: string[];
  jobSearchStatus?: 'activelyLooking' | 'openToOpportunities' | 'notLooking';
  desiredSalary?: number;
  resumeUrl?: string;
  resumeFileName?: string;
  parsedResumeText?: string;
  appliedJobIds?: string[]; // Still useful for job seeker to track applications made
  savedJobIds?: string[];
  savedSearches?: SavedSearch[];

  // Employer specific fields
  companyId?: string;
  isCompanyAdmin?: boolean;
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

export interface ParsedResumeData {
  name?: string;
  email?: string;
  headline?: string;
  skills?: string[];
  experience?: string;
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
