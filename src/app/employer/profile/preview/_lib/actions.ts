// src/app/employer/profile/preview/_lib/actions.ts
import {
  getCompanyProfile,
  getCompanyRecruiters,
} from '@/services/company.services';
import { getJobsByCompany } from '@/services/job.services';
import type { Company, Job, UserProfile } from '@/types';

type FetchCompanyDataParams = {
  companyId: string;
  setCompanyDetails: (company: Company | null) => void;
  setRecruiters: (recruiters: UserProfile[]) => void;
  setJobs: (jobs: Job[]) => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsFetchingRecruiters: (loading: boolean) => void;
};

export const fetchCompanyAndRelatedData = async ({
  companyId,
  setCompanyDetails,
  setRecruiters,
  setJobs,
  setError,
  setIsLoading,
  setIsFetchingRecruiters,
}: FetchCompanyDataParams) => {
  setIsLoading(true);
  setError(null);

  try {
    const companyToDisplay = await getCompanyProfile(companyId);

    if (!companyToDisplay) {
      setError('Company details not found.');
      setIsLoading(false);
      return;
    }
    setCompanyDetails(companyToDisplay);

    if (
      companyToDisplay.recruiterUids &&
      companyToDisplay.recruiterUids.length > 0
    ) {
      setIsFetchingRecruiters(true);
      const fetchedRecruiters = await getCompanyRecruiters(
        companyToDisplay.recruiterUids
      );
      setRecruiters(fetchedRecruiters);
      setIsFetchingRecruiters(false);
    } else {
      setIsFetchingRecruiters(false);
    }

    const fetchedJobs = await getJobsByCompany(companyId);
    setJobs(fetchedJobs);
  } catch (e: unknown) {
    console.error('Error fetching company preview data:', e);
    setError(`Failed to load company preview. Error: ${(e as Error).message}`);
  } finally {
    setIsLoading(false);
  }
};
