
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
  adminUids: string[]; // UIDs of users who are company admins
  recruiterUids: string[]; // UIDs of all recruiters (including admins) in the company
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
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
  applicantIds?: string[];
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
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
  appliedJobIds?: string[];
  savedJobIds?: string[];
  savedSearches?: SavedSearch[]; // Added for saved searches

  // Employer specific fields
  companyId?: string;
  isCompanyAdmin?: boolean;
}

export interface UserSettings {
  jobBoardDisplay: 'list' | 'grid';
  itemsPerPage: 10 | 20 | 50;
  jobAlerts: {
    newJobsMatchingProfile: boolean;
    savedSearchAlerts: boolean; // This will be configurable once alerts are implemented
    applicationStatusUpdates: boolean;
  };
  searchHistory: string[]; // This is distinct from saved searches
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
