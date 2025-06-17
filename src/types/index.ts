
import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'jobSeeker' | 'employer' | 'admin'; // Added admin role

export interface Job {
  id: string; // Will be Firestore document ID
  title: string;
  company: string; 
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description: string;
  postedDate: string | Timestamp; // Can be ISO string or Firestore Timestamp
  isRemote: boolean;
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  companyLogoUrl?: string; 
  postedById?: string; // User ID (uid) of the employer
  applicantIds?: string[]; // UIDs of users who applied
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserProfile {
  uid: string; // Firebase Auth User ID
  role: UserRole;
  email: string | null; 
  name: string; 
  avatarUrl?: string; 
  createdAt?: Timestamp;
  updatedAt?: Timestamp;

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

  // Employer specific fields
  companyWebsite?: string;
  companyDescription?: string; 
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
