import type { ExperienceEntry, EducationEntry, LanguageEntry } from '@/types';
import { formatCurrencyINR } from '@/lib/utils';

export const formatExperiencesForAICandidate = (
  experiences?: ExperienceEntry[]
): string => {
  if (!experiences || experiences.length === 0)
    return 'No work experience listed.';
  return experiences
    .map(
      (exp) =>
        `Company: ${exp.companyName || 'N/A'}, Role: ${exp.jobRole || 'N/A'}, Duration: ${exp.startDate || 'N/A'} to ${exp.currentlyWorking ? 'Present' : exp.endDate || 'N/A'}${exp.annualCTC ? `, Annual CTC: ${formatCurrencyINR(exp.annualCTC)}` : ''}. Description: ${exp.description || 'N/A'}`
    )
    .join('; ');
};

export const formatEducationsForAICandidate = (
  educations?: EducationEntry[]
): string => {
  if (!educations || educations.length === 0) return 'No education listed.';
  return educations
    .map(
      (edu) =>
        `Level: ${edu.level || 'N/A'}, Degree: ${edu.degreeName || 'N/A'}, Institute: ${edu.instituteName || 'N/A'}, Batch: ${edu.startYear || 'N/A'}-${edu.endYear || 'N/A'}, Specialization: ${edu.specialization || 'N/A'}, Course Type: ${edu.courseType || 'N/A'}. Description: ${edu.description || 'N/A'}`
    )
    .join('; ');
};

export const formatLanguagesForAICandidate = (
  languages?: LanguageEntry[]
): string => {
  if (!languages || languages.length === 0) return 'No languages listed.';
  return languages
    .map(
      (lang) =>
        `${lang.languageName} (Proficiency: ${lang.proficiency}, Read: ${lang.canRead ? 'Y' : 'N'}, Write: ${lang.canWrite ? 'Y' : 'N'}, Speak: ${lang.canSpeak ? 'Y' : 'N'})`
    )
    .join(', ');
};
