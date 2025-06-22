// src/components/SettingsForm/_lib/actions.ts
import type { UserProfile } from '@/types';
import type { Toast } from '@/hooks/use-toast';

interface SaveSettingsParams {
  user: UserProfile | null;
  settings: Partial<UserProfile>;
  updateUserProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
  toast: ({ ...props }: Toast) => void;
}

export const saveSettings = async ({
  user,
  settings,
  updateUserProfile,
  toast,
}: SaveSettingsParams): Promise<boolean> => {
  if (!user) {
    toast({
      title: 'Error',
      description: 'You must be logged in to save settings.',
      variant: 'destructive',
    });
    return false;
  }
  if (user.status === 'suspended' && user.role === 'jobSeeker') {
    toast({
      title: 'Account Suspended',
      description: 'Settings cannot be saved while account is suspended.',
      variant: 'destructive',
    });
    return false;
  }

  try {
    const profileUpdates: Partial<UserProfile> = {
      theme: settings.theme,
      jobBoardDisplay: settings.jobBoardDisplay,
      itemsPerPage: settings.itemsPerPage,
      jobAlerts: settings.jobAlerts,
    };
    await updateUserProfile(profileUpdates);
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated.',
    });
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    toast({
      title: 'Error',
      description: 'Could not save settings. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};
