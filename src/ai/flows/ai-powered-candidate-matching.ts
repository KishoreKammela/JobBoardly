'use server';
/**
 * @fileOverview This file defines the AI-powered candidate matching flow for employers.
 *
 * It takes a job description (including new fields like industry, experience level, etc.) and a list of candidate profiles,
 * then suggests relevant candidates whose profiles are marked as searchable.
 *
 * @exported
 * - `aiPoweredCandidateMatching`: The main function to trigger the candidate matching flow.
 * - `AIPoweredCandidateMatchingInput`: The input type for the function.
 * - `AIPoweredCandidateMatchingOutput`: The output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIPoweredCandidateMatchingInputSchema = z.object({
  jobDescription: z.string().describe(
    'A detailed job description, including title, responsibilities, requirements, preferred skills, location, job type, salary range (if available, in INR) and pay transparency, benefits (string), industry, department/functional area, role/designation, experience level (e.g., Entry-Level, Mid-Level), min/max years of experience, education qualification, and application deadline (YYYY-MM-DD).' // Updated description, responsibilities, requirements, benefits
  ),
  candidateProfiles: z
    .string()
    .describe(
      'A list/collection of candidate profiles (only those marked as searchable by the job seeker). Each profile should include: Candidate UID, Name, Email (optional), Mobile (optional), Headline, Skills (comma-separated list), Languages (comma-separated list with proficiency and read/write/speak abilities, e.g., "English (Advanced, RWS), Spanish (Intermediate, R)"), Total Years of Professional Experience (e.g., "5 years, 6 months"), detailed Work Experience (each entry with: Company Name, Job Role, Duration, Description, Annual CTC), detailed Education (each entry with: Level, Degree, Institute, Batch, Specialization, Course Type, Description), Portfolio URL (optional), LinkedIn URL (optional), Preferred Locations (comma-separated list), Current Job Search Status (e.g., Actively Looking), Availability to Start (e.g., Immediate), Current Annual CTC in INR (e.g., "₹16LPA (Confidential)"), Expected Annual CTC in INR (e.g., "₹20LPA (Negotiable)"), Gender, Date of Birth, Home State, Home City, and any additional summary from their parsed resume document.'
    ),
});

export type AIPoweredCandidateMatchingInput = z.infer<
  typeof AIPoweredCandidateMatchingInputSchema
>;

const AIPoweredCandidateMatchingOutputSchema = z.object({
  relevantCandidateIDs: z
    .array(z.string())
    .describe(
      'An array of candidate UIDs that are most relevant to the job description, ordered by relevance (most relevant first).'
    ),
  reasoning: z.string().describe(
    'A detailed explanation of why these specific candidates were selected. For each candidate, highlight how their skills, total experience, detailed work experience (roles, responsibilities, CTCs), detailed education (specializations, course types), languages (proficiency), salary expectations (current and expected CTC vs job range if pay transparency is enabled), preferences (location, availability, job search status), personal details (gender, DOB, home location), and resume summary align with the job description (including its responsibilities, requirements, industry, department, required experience level, years of experience, and education qualification). Mention any potential misalignments if significant but outweighed by other factors.' // Updated job details
  ),
});

export type AIPoweredCandidateMatchingOutput = z.infer<
  typeof AIPoweredCandidateMatchingOutputSchema
>;

export async function aiPoweredCandidateMatching(
  input: AIPoweredCandidateMatchingInput
): Promise<AIPoweredCandidateMatchingOutput> {
  return aiPoweredCandidateMatchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredCandidateMatchingPrompt',
  input: { schema: AIPoweredCandidateMatchingInputSchema },
  output: { schema: AIPoweredCandidateMatchingOutputSchema },
  prompt: `You are an expert AI recruitment assistant. Your task is to match candidates to a given job description from a pool of searchable candidate profiles.

Job Description:
{{{jobDescription}}}

Searchable Candidate Profiles:
{{{candidateProfiles}}}

Based on the provided information:
1.  Thoroughly analyze the job description, noting key responsibilities, requirements, required and preferred skills, language requirements (if any), experience level (e.g., "Entry-Level", "Mid-Level", "Senior-Level") and specific min/max years of experience if specified, location, job type, salary range (and whether pay transparency is enabled for applicants), benefits (as string), industry, department/functional area, role/designation, and education qualification.
2.  Carefully review each candidate's profile. Pay close attention to their:
    - Skills (technical and soft)
    - Languages (including proficiency and RWS abilities)
    - Total Years of Professional Experience (e.g., "5 years, 6 months")
    - Detailed Work Experience (roles, responsibilities, duration, specific achievements, and annual CTC for each role)
    - Detailed Education (level, degree, institute, specialization, course type, graduation year)
    - Stated Preferences (preferred locations, expected salary in INR, job search status, current CTC, availability to start)
    - Personal Details (gender, date of birth, home state/city, if they might influence location or cultural fit, though be cautious with biases)
    - Any summary from their resume document.
3.  Identify the candidate UIDs that are the MOST relevant matches for the job description.
4.  Provide a detailed reasoning for your selections. For each recommended candidate, explain how their comprehensive profile aligns with the job's responsibilities and requirements. Highlight specific matches in skills, total experience (vs. job's required experience level and years), depth and type of experience (including specific roles and responsibilities), education (vs. job's education qualification), languages, salary expectations (if their expected salary is compatible with the job's range if pay transparency is enabled, considering their current CTC), location preferences, and industry/department alignment. Also, note any potential minor misalignments if the overall match is strong.
5.  Return the UIDs of the matched candidates in the 'relevantCandidateIDs' array, ideally ordered by relevance (most relevant first).
6.  Ensure your output is a correctly formatted JSON object matching the defined output schema.

Prioritize candidates whose skills and experience (including total years and specific experience level) closely align with the core responsibilities and requirements of the job description.
Consider factors like years of experience, specific technical skills, language proficiency, cultural fit (if discernible), alignment of preferences (salary, location), industry match, and education.
If no candidates are a strong match, return an empty 'relevantCandidateIDs' array and explain why in the 'reasoning' field.
`,
});

const aiPoweredCandidateMatchingFlow = ai.defineFlow(
  {
    name: 'aiPoweredCandidateMatchingFlow',
    inputSchema: AIPoweredCandidateMatchingInputSchema,
    outputSchema: AIPoweredCandidateMatchingOutputSchema,
  },
  async (input: AIPoweredCandidateMatchingInput) => {
    const { output } = await prompt(input);
    if (!output) {
      console.warn('AI Candidate Matching flow returned no output from AI.');
      return {
        relevantCandidateIDs: [],
        reasoning:
          'AI did not return a valid response or found no matches based on the provided job description and candidate profiles.',
      };
    }
    return output;
  }
);
