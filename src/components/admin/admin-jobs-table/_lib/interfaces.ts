import type { Job } from '@/types';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export interface JobWithApplicantCount extends Job {
  applicantCount: number;
}
