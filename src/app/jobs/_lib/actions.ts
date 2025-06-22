// src/app/jobs/_lib/actions.ts
import { getApprovedJobs } from '@/services/job.services';
import type { Job } from '@/types';

export const fetchJobs = async (
  setAllJobs: (jobs: Job[]) => void,
  setFilteredJobs: (jobs: Job[]) => void,
  setError: (error: string | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);
  setError(null);
  try {
    const jobsData = await getApprovedJobs();
    setAllJobs(jobsData);
    setFilteredJobs(jobsData);
  } catch (e: unknown) {
    console.error('Error fetching jobs:', e);
    setError(
      `Failed to load jobs. Please try again later. Error: ${(e as Error).message}`
    );
  } finally {
    setIsLoading(false);
  }
};
