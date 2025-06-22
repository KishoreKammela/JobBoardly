// src/components/my-jobs-display/_lib/actions.ts
import type { Job, UserProfile } from '@/types';
import type { Toast } from '@/hooks/use-toast';

interface WithdrawParams {
  job: Job;
  user: UserProfile;
  withdrawAppFromContext: (jobId: string) => Promise<void>;
  toast: ({ ...props }: Toast) => void;
}

export const withdrawJobApplication = async ({
  job,
  user,
  withdrawAppFromContext,
  toast,
}: WithdrawParams): Promise<boolean> => {
  if (!user || user.role !== 'jobSeeker') {
    toast({
      title: 'Action Denied',
      description: 'You must be a job seeker to withdraw applications.',
      variant: 'destructive',
    });
    return false;
  }
  if (user.status === 'suspended') {
    toast({
      title: 'Account Suspended',
      description:
        'Your account is currently suspended. You cannot withdraw applications.',
      variant: 'destructive',
    });
    return false;
  }

  try {
    await withdrawAppFromContext(job.id);
    toast({
      title: 'Application Withdrawn',
      description: `Your application for ${job.title} has been withdrawn.`,
    });
    return true;
  } catch (err: unknown) {
    toast({
      title: 'Error',
      description: 'Failed to withdraw application.',
      variant: 'destructive',
    });
    return false;
  }
};
