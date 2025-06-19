'use server';
/**
 * @fileOverview This file defines the AI-powered candidate matching flow for employers.
 *
 * It takes a job description and a list of candidate profiles (including detailed work experience, education, skills, languages, preferences like salary and location),
 * then suggests relevant candidates whose profiles are marked as searchable.
 *
 * @exported
 * - `aiPoweredCandidateMatching`: The main function to trigger the candidate matching flow.
 * - `AIPoweredCandidateMatchingInput`: The input type for the function.
 * - `AIPoweredCandidateMatchingOutput`: The output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIPoweredCandidateMatchingInputSchema = z.object({
  jobDescription: z
    .string()
    .describe(
      'A detailed job description, including responsibilities, qualifications, preferred skills, location, job type, and salary range (if available, in INR).'
    ),
  candidateProfiles: z
    .string()
    .describe(
      'A list/collection of candidate profiles (only those marked as searchable by the job seeker). Each profile should include: Candidate UID, Name, Email (optional), Mobile (optional), Headline, Skills (comma-separated list), Languages (comma-separated list), detailed Work Experience Summary (Markdown format preferred for structure), detailed Education Summary, Portfolio URL (optional), LinkedIn URL (optional), Preferred Locations (comma-separated list), Current Job Search Status (e.g., Actively Looking), Availability to Start (e.g., Immediate), Desired Annual Salary in INR (e.g., "₹12LPA (raw: 1200000)"), and any additional summary from their parsed resume document.'
    ),
});

export type AIPoweredCandidateMatchingInput = z.infer<
  typeof AIPoweredCandidateMatchingInputSchema
>;
export type AIPoweredCandidateMatchingInput = z.infer<
  typeof AIPoweredCandidateMatchingInputSchema
>;

const AIPoweredCandidateMatchingOutputSchema = z.object({
  relevantCandidateIDs: z
    .array(z.string())
    .describe(
      'An array of candidate UIDs that are most relevant to the job description, ordered by relevance (most relevant first).'
    ),
  reasoning: z
    .string()
    .describe(
      'A detailed explanation of why these specific candidates were selected. For each candidate, highlight how their skills, experience, education, languages, salary expectations, and preferences align with the job description. Mention any potential misalignments if significant but outweighed by other factors.'
    ),
});

export type AIPoweredCandidateMatchingOutput = z.infer<
  typeof AIPoweredCandidateMatchingOutputSchema
>;
export type AIPoweredCandidateMatchingOutput = z.infer<
  typeof AIPoweredCandidateMatchingOutputSchema
>;

export async function aiPoweredCandidateMatching(
  input: AIPoweredCandidateMatchingInput
): Promise<AIPoweredCandidateMatchingOutput> {
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
1.  Thoroughly analyze the job description, noting key responsibilities, required and preferred skills, language requirements (if any), experience level, location, job type, and salary range (if provided).
2.  Carefully review each candidate's profile. Pay close attention to their skills, languages, detailed work experience (roles, responsibilities, duration), education, stated preferences (preferred locations, desired salary in INR, job search status, availability), and any resume summary.
3.  Identify the candidate UIDs that are the MOST relevant matches for the job description.
4.  Provide a detailed reasoning for your selections. For each recommended candidate, explain how their profile aligns with the job's requirements. Highlight specific matches in skills, experience, education, languages, salary expectations (if their desired salary is compatible with the job's range or market rates), and location preferences. Also, note any potential minor misalignments if the overall match is strong.
5.  Return the UIDs of the matched candidates in the 'relevantCandidateIDs' array, ideally ordered by relevance (most relevant first).
6.  Ensure your output is a correctly formatted JSON object matching the defined output schema.

Prioritize candidates whose skills and experience closely align with the core requirements of the job description.
Consider factors like years of experience, specific technical skills, language proficiency, cultural fit (if discernible), and alignment of preferences (salary, location).
If no candidates are a strong match, return an empty 'relevantCandidateIDs' array and explain why in the 'reasoning' field.
`,
});

const aiPoweredCandidateMatchingFlow = ai.defineFlow(
  {
    name: 'aiPoweredCandidateMatchingFlow',
    inputSchema: AIPoweredCandidateMatchingInputSchema,
    outputSchema: AIPoweredCandidateMatchingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
  async (input) => {
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
