'use server';
/**
 * @fileOverview This file defines the AI-powered job matching flow.
 *
 * It takes a job seeker's profile (skills, experience) and suggests relevant job positions.
 *
 * @exported
 * - `aiPoweredJobMatching`: The main function to trigger the job matching flow.
 * - `AIPoweredJobMatchingInput`: The input type for the `aiPoweredJobMatching` function.
 * - `AIPoweredJobMatchingOutput`: The output type for the `aiPoweredJobMatching` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPoweredJobMatchingInputSchema = z.object({
  jobSeekerProfile: z
    .string()
    .describe('A detailed profile of the job seeker, including skills, experience, and preferences.'),
  jobPostings: z
    .string()
    .describe('A list of available job postings with descriptions of the requirements and the role itself.'),
});

export type AIPoweredJobMatchingInput = z.infer<typeof AIPoweredJobMatchingInputSchema>;

const AIPoweredJobMatchingOutputSchema = z.object({
  relevantJobIDs: z
    .array(z.string())
    .describe('An array of job IDs that are most relevant to the job seeker.'),
  reasoning: z.string().describe('Explanation of why these jobs were picked.'),
});

export type AIPoweredJobMatchingOutput = z.infer<typeof AIPoweredJobMatchingOutputSchema>;

export async function aiPoweredJobMatching(input: AIPoweredJobMatchingInput): Promise<AIPoweredJobMatchingOutput> {
  return aiPoweredJobMatchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredJobMatchingPrompt',
  input: {schema: AIPoweredJobMatchingInputSchema},
  output: {schema: AIPoweredJobMatchingOutputSchema},
  prompt: `You are an AI job matching expert. Given a job seeker's profile and a list of job postings, you will identify the most relevant jobs for the job seeker.

Job Seeker Profile: {{{jobSeekerProfile}}}

Job Postings: {{{jobPostings}}}

Based on the provided information, identify the job IDs that are most relevant to the job seeker. Explain your reasoning for the selection.  Return the job IDs in the relevantJobIDs array.

Consider skills match, experience, and any preferences expressed in the profile.

Ensure the output is correctly formatted JSON.
`,
});

const aiPoweredJobMatchingFlow = ai.defineFlow(
  {
    name: 'aiPoweredJobMatchingFlow',
    inputSchema: AIPoweredJobMatchingInputSchema,
    outputSchema: AIPoweredJobMatchingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
