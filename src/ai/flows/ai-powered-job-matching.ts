'use server';
/**
 * @fileOverview This file defines the AI-powered job matching flow.
 *
 * It takes a job seeker's detailed profile (including skills, experience, education, languages, preferences like salary and location)
 * and suggests relevant job positions from a list of available, approved job postings.
 *
 * @exported
 * - `aiPoweredJobMatching`: The main function to trigger the job matching flow.
 * - `AIPoweredJobMatchingInput`: The input type for the `aiPoweredJobMatching` function.
 * - `AIPoweredJobMatchingOutput`: The output type for the `aiPoweredJobMatching` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIPoweredJobMatchingInputSchema = z.object({
  jobSeekerProfile: z
    .string()
    .describe(
      'A comprehensive profile of the job seeker. This should include: Name, Email, Mobile (optional), Headline, Skills (comma-separated list), Languages (comma-separated list with optional proficiency, e.g., "English (Fluent), Spanish (Basic)"), detailed Work Experience Summary (Markdown format preferred for structure), detailed Education Summary, Portfolio URL (optional), LinkedIn URL (optional), Preferred Locations (comma-separated list), Current Job Search Status (e.g., Actively Looking, Open to Opportunities), Availability to Start (e.g., Immediate, 2 Weeks Notice), Desired Annual Salary in INR (e.g., "₹12LPA (raw: 1200000)"), and any additional summary from a parsed resume document.'
    ),
  jobPostings: z
    .string()
    .describe(
      'A list/collection of available job postings. Each posting should include: Job ID, Title, Company, Location, Type (Full-time, Part-time, etc.), Remote status, a detailed Description (responsibilities, qualifications), Required Skills (comma-separated list), and Salary Range (Annual INR, e.g., "₹10LPA - ₹15LPA").'
    ),
});

export type AIPoweredJobMatchingInput = z.infer<
  typeof AIPoweredJobMatchingInputSchema
>;
export type AIPoweredJobMatchingInput = z.infer<
  typeof AIPoweredJobMatchingInputSchema
>;

const AIPoweredJobMatchingOutputSchema = z.object({
  relevantJobIDs: z
    .array(z.string())
    .describe(
      'An array of job IDs that are most relevant to the job seeker, ordered by relevance (most relevant first).'
    ),
  reasoning: z
    .string()
    .describe(
      "A detailed explanation of why these specific jobs were selected for the seeker, highlighting key matches between the seeker's profile (skills, experience, languages, salary expectations, location preferences) and the job requirements."
    ),
});

export type AIPoweredJobMatchingOutput = z.infer<
  typeof AIPoweredJobMatchingOutputSchema
>;
export type AIPoweredJobMatchingOutput = z.infer<
  typeof AIPoweredJobMatchingOutputSchema
>;

export async function aiPoweredJobMatching(
  input: AIPoweredJobMatchingInput
): Promise<AIPoweredJobMatchingOutput> {
export async function aiPoweredJobMatching(
  input: AIPoweredJobMatchingInput
): Promise<AIPoweredJobMatchingOutput> {
  return aiPoweredJobMatchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredJobMatchingPrompt',
  input: { schema: AIPoweredJobMatchingInputSchema },
  output: { schema: AIPoweredJobMatchingOutputSchema },
  prompt: `You are an expert AI career counselor specializing in matching job seekers with suitable job opportunities.
You will receive a detailed profile for a job seeker and a list of available, approved job postings.

Job Seeker Profile:
{{{jobSeekerProfile}}}

Available Job Postings:
{{{jobPostings}}}

Your task is to:
1.  Thoroughly analyze the job seeker's profile, paying close attention to their skills, languages (and proficiency if specified), work experience (including roles, responsibilities, and duration), education, stated preferences (such as preferred locations, desired salary in INR, and job search status), and any summary from their resume.
2.  Carefully review each job posting, focusing on the job description, required skills, language requirements, location, job type, remote status, and salary range (if provided).
3.  Identify the job IDs that are the MOST relevant matches for the job seeker. Consider a holistic match, not just keyword stuffing.
4.  Provide a detailed reasoning for your selections. Explain for each recommended job (or generally for the set of recommendations) how it aligns with the seeker's profile. Highlight specific connections, e.g., "The seeker's experience in 'Project Management' and skill 'Agile' directly match Job ID XYZ's requirements." or "Job ID ABC aligns with the seeker's desired salary range and preferred remote work option." Also consider language skills if relevant to job description.
5.  Return the job IDs in the 'relevantJobIDs' array, ideally ordered by relevance (most relevant first).
6.  Ensure your output is a correctly formatted JSON object matching the defined output schema.

Prioritize jobs that offer a strong alignment in skills, experience level, salary expectations (if seeker's desired salary falls within or near job's range), and location/remote preferences.
If the seeker's profile is sparse, make the best judgment based on the available information.
If no jobs are a good match, return an empty 'relevantJobIDs' array and explain why in the 'reasoning' field.
`,
});

const aiPoweredJobMatchingFlow = ai.defineFlow(
  {
    name: 'aiPoweredJobMatchingFlow',
    inputSchema: AIPoweredJobMatchingInputSchema,
    outputSchema: AIPoweredJobMatchingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      console.warn('AI Job Matching flow returned no output from AI.');
      return {
        relevantJobIDs: [],
        reasoning:
          'AI did not return a valid response or found no matches based on the provided profile and job listings.',
      };
    }
    return output;
  }
);
