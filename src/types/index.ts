
import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'jobSeeker' | 'employer' | 'admin';

export interface Company {
  id: string; // Firestore document ID
  name: string;
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
  bannerImageUrl?: string;
  adminUids: string[]; // UIDs of users who are company admins
  recruiterUids: string[]; // UIDs of all recruiters (including admins) in the company
  // jobsPostedIds?: string[]; // Optional: can be derived by querying jobs with companyId
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
}

export interface Job {
  id: string;
  title: string;
  company: string; // Company Name (from Company document)
  companyId: string; // ID of the company document in 'companies' collection
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description: string;
  postedDate: string | Timestamp;
  isRemote: boolean;
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  companyLogoUrl?: string; // Company Logo (from Company document)
  postedById: string; // User ID (uid) of the individual recruiter who posted
  applicantIds?: string[];
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
}

export interface UserProfile {
  uid: string;
  role: UserRole;
  email: string | null;
  name: string; // User's full name (for job seeker) or Recruiter's name (for employer)
  avatarUrl?: string; // User's personal avatar
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
  appliedJobIds?: string[];
  savedJobIds?: string[];

  // Employer specific fields
  companyId?: string; // Links to the 'companies' collection document ID
  isCompanyAdmin?: boolean; // True if this employer user can manage the company's profile
  // companyName, companyWebsite, companyDescription are now moved to the Company interface
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
  portfolioUrl?: string;
  linkedinUrl?: string;
  education?: string;
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

export interface AIPoweredJobMatchingOutput {
  relevantJobIDs: string[];
  reasoning: string;
}
