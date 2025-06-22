// src/components/resume-upload-form/_lib/actions.ts
import type { UserProfile } from '@/types';
import {
  parseResumeFlow,
  type ParseResumeOutput,
} from '@/ai/flows/parse-resume-flow';
import type { Toast } from '@/hooks/use-toast';

interface ProcessResumeParams {
  dataUri: string;
  sourceName: string;
  user: UserProfile | null;
  updateUserProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
  toast: ({ ...props }: Toast) => void;
  file?: File | null;
  pastedResume?: string;
}

export const processResume = async ({
  dataUri,
  sourceName,
  user,
  updateUserProfile,
  toast,
  file,
  pastedResume,
}: ProcessResumeParams): Promise<boolean> => {
  if (!user) return false;

  try {
    const parsedData: ParseResumeOutput = await parseResumeFlow({
      resumeDataUri: dataUri,
    });

    if (parsedData.errorMessage) {
      toast({
        title: 'Resume Parsing Error',
        description: parsedData.errorMessage,
        variant: 'destructive',
        duration: 10000,
      });
      if (parsedData.errorMessage.includes('Server-side error')) {
        return false;
      }
    }

    const profileUpdates: Partial<UserProfile> = {};
    if (
      parsedData.experience &&
      parsedData.experience.startsWith('Parsing Error:')
    ) {
      toast({
        title: 'Resume Parsing Issue',
        description: parsedData.experience,
        variant: 'destructive',
        duration: 9000,
      });
    } else if (parsedData.experience) {
      let summaryText = `Experience Summary:\n${parsedData.experience}\n\n`;
      if (parsedData.education) {
        summaryText += `Education Summary:\n${parsedData.education}\n\n`;
      }
      profileUpdates.parsedResumeText = summaryText.trim();
    }

    if (parsedData.name && !user.name) profileUpdates.name = parsedData.name;
    if (parsedData.headline) profileUpdates.headline = parsedData.headline;
    if (parsedData.skills && parsedData.skills.length > 0)
      profileUpdates.skills = parsedData.skills;
    if (parsedData.portfolioUrl)
      profileUpdates.portfolioUrl = parsedData.portfolioUrl;
    if (parsedData.linkedinUrl)
      profileUpdates.linkedinUrl = parsedData.linkedinUrl;
    if (parsedData.mobileNumber && !user.mobileNumber)
      profileUpdates.mobileNumber = parsedData.mobileNumber;

    if (
      parsedData.totalYearsExperience !== undefined &&
      (user.totalYearsExperience === undefined ||
        user.totalYearsExperience === 0)
    ) {
      profileUpdates.totalYearsExperience = parsedData.totalYearsExperience;
      if (
        user.totalMonthsExperience === undefined ||
        user.totalMonthsExperience === 0
      ) {
        profileUpdates.totalMonthsExperience = 0;
      }
    }

    if (file) {
      profileUpdates.resumeFileName = file.name;
    } else if (pastedResume) {
      profileUpdates.resumeFileName = 'Pasted Resume Text';
      profileUpdates.resumeUrl = undefined;
    }

    if (!parsedData.errorMessage) {
      toast({
        title: 'Resume Processed',
        description: `${sourceName} has been parsed. Review and complete your profile details.`,
      });
    }

    if (Object.keys(profileUpdates).length > 0) {
      await updateUserProfile(profileUpdates);
    }
    return true;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during parsing.';
    console.error('Error processing resume:', error);
    toast({
      title: 'Resume Processing Error',
      description: `Failed to parse resume and update profile. ${errorMessage}`,
      variant: 'destructive',
    });
    return false;
  }
};

export const removeResume = async ({
  user,
  updateUserProfile,
  toast,
}: Pick<ProcessResumeParams, 'user' | 'updateUserProfile' | 'toast'>) => {
  if (!user) return;
  await updateUserProfile({
    resumeUrl: undefined,
    resumeFileName: undefined,
    parsedResumeText: undefined,
  });
  toast({
    title: 'Resume Removed',
    description:
      'Your resume file and parsed summary have been removed from your profile.',
  });
};
