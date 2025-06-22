import type { Timestamp } from 'firebase/firestore';
import type { ScreeningQuestion } from './application';

export type JobExperienceLevel =
  | 'Entry-Level'
  | 'Mid-Level'
  | 'Senior-Level'
  | 'Lead'
  | 'Manager'
  | 'Executive';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  responsibilities?: string;
  requirements?: string;
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
  payTransparency?: boolean;
  benefits?: string;
  industry: string;
  department: string;
  roleDesignation?: string;
  experienceLevel: JobExperienceLevel;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  educationQualification?: string;
  applicationDeadline?: string | Timestamp;
}

export interface ParsedJobData {
  title?: string;
  responsibilities?: string;
  requirements?: string;
  skills?: string[];
  location?: string;
  jobType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salaryMin?: number;
  salaryMax?: number;
  payTransparency?: boolean;
  benefits?: string;
  industry?: string;
  department?: string;
  roleDesignation?: string;
  experienceLevel?: JobExperienceLevel;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  educationQualification?: string;
  applicationDeadline?: string;
}

export interface Filters {
  searchTerm: string;
  location: string;
  roleType: string;
  isRemote: boolean;
  recentActivity?: 'any' | '24h' | '7d' | '30d' | null;
  industry?: string;
  experienceLevel?: JobExperienceLevel | 'all';
  salaryMin?: number | null;
  salaryMax?: number | null;
  minExperienceYears?: number | null;
}

export type NoticePeriod =
  | 'Immediately Available'
  | '1 Month'
  | '2 Months'
  | '3 Months'
  | '4 Months'
  | '5 Months'
  | '6 Months'
  | 'More than 6 Months'
  | 'Flexible';

export interface CandidateFilters {
  searchTerm: string;
  location: string;
  noticePeriod?: NoticePeriod | 'all';
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
