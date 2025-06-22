// src/app/employer/candidates/[candidateId]/_lib/actions.ts
import { getUserProfile } from '@/services/user.services';
import type { UserProfile } from '@/types';

export const fetchCandidateProfile = async (
  candidateId: string,
  setCandidate: (profile: UserProfile | null) => void,
  setError: (error: string | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);
  setError(null);
  try {
    const candidateData = await getUserProfile(candidateId);
    if (!candidateData) {
      setError('User profile not found.');
    }
    setCandidate(candidateData);
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
