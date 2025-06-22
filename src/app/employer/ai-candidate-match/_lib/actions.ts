// src/app/employer/ai-candidate-match/_lib/actions.ts
import { getSearchableCandidates } from '@/services/user.services';
import type { UserProfile } from '@/types';

export const fetchCandidatesForAIMatcher = async (
  setAllCandidates: (candidates: UserProfile[]) => void,
  setCandidatesLoading: (loading: boolean) => void,
  setCandidatesError: (error: string | null) => void
) => {
  setCandidatesLoading(true);
  setCandidatesError(null);
  try {
    const candidatesData = await getSearchableCandidates();
    setAllCandidates(candidatesData);
  } catch (e: unknown) {
    console.error('Error fetching candidates for AI matcher:', e);
    const message =
      e instanceof Error
        ? `Failed to load candidates: ${e.message}`
        : 'Failed to load candidates for matching. Please try again later.';
    setCandidatesError(message);
  } finally {
    setCandidatesLoading(false);
  }
};
