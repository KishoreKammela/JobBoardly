export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description: string;
  postedDate: string;
  isRemote: boolean;
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  companyLogoUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  skills?: string[];
  experience?: string; // Could be markdown or structured data
  resumeUrl?: string;
  resumeFileName?: string;
  parsedResumeText?: string; // Text extracted from resume
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

export interface AIPoweredJobMatchingOutput {
  relevantJobIDs: string[];
  reasoning: string;
}
