// src/app/employer/candidates/[candidateId]/_lib/actions.ts
import { getApplicationsForCandidateByCompany } from '@/services/application.services';
import { getUserProfile } from '@/services/user.services';
import type { Application, UserProfile } from '@/types';

export const fetchCandidateAndInteractionData = async (
  candidateId: string,
  companyId: string,
  setCandidate: (profile: UserProfile | null) => void,
  setApplications: (applications: Application[]) => void,
  setError: (error: string | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);
  setError(null);
  try {
    const candidateData = await getUserProfile(candidateId);
    if (!candidateData) {
      setError('User profile not found.');
      setCandidate(null);
      setApplications([]);
    } else {
      setCandidate(candidateData);
      const applications = await getApplicationsForCandidateByCompany(
        candidateId,
        companyId
      );
      setApplications(applications);
    }
  } catch (e: unknown) {
    console.error('Error fetching user/candidate details:', e);
    const message =
      e instanceof Error
        ? `Failed to load user profile: ${e.message}`
        : 'Failed to load user profile. Please try again.';
    setError(message);
  } finally {
    setIsLoading(false);
  }
};
