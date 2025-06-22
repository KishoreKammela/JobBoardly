// src/app/employer/ai-candidate-match/_lib/utils.ts
import type {
  ExperienceEntry,
  EducationEntry,
  LanguageEntry,
  UserProfile,
} from '@/types';
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
        `${lang.languageName} (Proficiency: ${lang.proficiency}, Read: ${lang.canRead ? 'Yes' : 'No'}, Write: ${lang.canWrite ? 'Yes' : 'No'}, Speak: ${lang.canSpeak ? 'Yes' : 'No'})`
    )
    .join(', ');
};

export const formatCandidatesForAI = (candidates: UserProfile[]): string => {
  return candidates
    .map((c) => {
      let profileString = `Candidate UID: ${c.uid}\n`;
      profileString += `Name: ${c.name || 'N/A'}\n`;
      if (c.email) profileString += `Email: ${c.email}\n`;
      if (c.mobileNumber) profileString += `Mobile: ${c.mobileNumber}\n`;
      if (c.headline) profileString += `Headline: ${c.headline}\n`;
      if (c.gender) profileString += `Gender: ${c.gender}\n`;
      if (c.dateOfBirth) profileString += `Date of Birth: ${c.dateOfBirth}\n`;
      if (c.homeState) profileString += `Home State: ${c.homeState}\n`;
      if (c.homeCity) profileString += `Home City: ${c.homeCity}\n`;

      if (
        c.totalYearsExperience !== undefined ||
        c.totalMonthsExperience !== undefined
      ) {
        profileString += `Total Experience: ${c.totalYearsExperience || 0} years, ${c.totalMonthsExperience || 0} months\n`;
      }

      if (c.currentCTCValue !== undefined) {
        profileString += `Current Annual CTC (INR): ${formatCurrencyINR(c.currentCTCValue)} ${c.currentCTCConfidential ? '(Confidential)' : ''}\n`;
      }
      if (c.expectedCTCValue !== undefined) {
        profileString += `Expected Annual CTC (INR): ${formatCurrencyINR(c.expectedCTCValue)} ${c.expectedCTCNegotiable ? '(Negotiable)' : ''}\n`;
      }

      if (c.skills && c.skills.length > 0) {
        profileString += `Skills: ${c.skills.join(', ')}\n`;
      }
      if (c.languages && c.languages.length > 0) {
        profileString += `Languages: ${formatLanguagesForAICandidate(c.languages)}\n`;
      }

      profileString += `Work Experience Summary:\n${formatExperiencesForAICandidate(c.experiences)}\n`;
      profileString += `Education Summary:\n${formatEducationsForAICandidate(c.educations)}\n`;

      if (c.portfolioUrl) profileString += `Portfolio URL: ${c.portfolioUrl}\n`;
      if (c.linkedinUrl) profileString += `LinkedIn URL: ${c.linkedinUrl}\n`;
      if (c.preferredLocations && c.preferredLocations.length > 0) {
        profileString += `Preferred Locations: ${c.preferredLocations.join(', ')}\n`;
      }
      if (c.jobSearchStatus)
        profileString += `Current Job Search Status: ${c.jobSearchStatus.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}\n`;
      if (c.noticePeriod) profileString += `Notice Period: ${c.noticePeriod}\n`;

      if (c.parsedResumeText) {
        profileString += `\n--- Additional Resume Summary (from parsed document) ---\n${c.parsedResumeText}\n`;
      }
      return profileString.trim();
    })
    .join('\n\n---\n\n');
};
