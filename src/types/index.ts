
export type UserRole = 'jobSeeker' | 'employer';

export interface Job {
  id: string;
  title: string;
  company: string; // For display; actual company details might come from employer profile
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description: string;
  postedDate: string;
  isRemote: boolean;
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  companyLogoUrl?: string; // Could be derived from employer profile
  postedById?: string; // User ID of the employer
}

export interface UserProfile {
  id: string;
  role: UserRole;
  email: string;
  name: string; // Full name for jobSeeker, Company Name for employer
  avatarUrl?: string; // Profile picture for jobSeeker, Company Logo for employer

  // Job Seeker specific fields
  headline?: string;
  skills?: string[];
  experience?: string; // Markdown supported
  portfolioUrl?: string;
  linkedinUrl?: string;
  preferredLocations?: string[]; // Could be a list of city names or regions
  jobSearchStatus?: 'activelyLooking' | 'openToOpportunities' | 'notLooking';
  desiredSalary?: number; // Annual salary expectation
  resumeUrl?: string;
  resumeFileName?: string;
  parsedResumeText?: string; // Full text extracted from resume for reference or AI processing

  // Employer specific fields
  companyWebsite?: string;
  companyDescription?: string; // Markdown supported, brief about the company
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

// Output from AI resume parsing
export interface ParsedResumeData {
  name?: string;
  email?: string;
  headline?: string;
  skills?: string[];
  experience?: string; // Extracted experience text. May contain an error message if parsing failed due to file type.
  portfolioUrl?: string;
  linkedinUrl?: string;
  // Add other fields as needed, e.g., education
}

// Output from AI job description parsing
export interface ParsedJobData {
  title?: string;
  description?: string; // May contain an error message if parsing failed due to file type.
  skills?: string[];
  location?: string;
  jobType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salaryMin?: number;
  salaryMax?: number;
  // Add other fields as needed
}

export interface AIPoweredJobMatchingOutput {
  relevantJobIDs: string[];
  reasoning: string;
}
