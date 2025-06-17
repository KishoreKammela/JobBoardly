
'use server';
/**
 * @fileOverview This file defines the AI-powered candidate matching flow for employers.
 *
 * It takes a job description and a list of candidate profiles, then suggests relevant candidates.
 *
 * @exported
 * - `aiPoweredCandidateMatching`: The main function to trigger the candidate matching flow.
 * - `AIPoweredCandidateMatchingInput`: The input type for the function.
 * - `AIPoweredCandidateMatchingOutput`: The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPoweredCandidateMatchingInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('A detailed job description, including responsibilities, qualifications, and preferred skills.'),
  candidateProfiles: z
    .string()
    .describe('A list/collection of candidate profiles. Each profile should include candidate ID (uid), skills, experience, headline, and other relevant information.'),
});

export type AIPoweredCandidateMatchingInput = z.infer<typeof AIPoweredCandidateMatchingInputSchema>;

const AIPoweredCandidateMatchingOutputSchema = z.object({
  relevantCandidateIDs: z
    .array(z.string())
    .describe('An array of candidate UIDs that are most relevant to the job description.'),
  reasoning: z.string().describe('Explanation of why these candidates were picked, highlighting key matches.'),
});

export type AIPoweredCandidateMatchingOutput = z.infer<typeof AIPoweredCandidateMatchingOutputSchema>;

export async function aiPoweredCandidateMatching(input: AIPoweredCandidateMatchingInput): Promise<AIPoweredCandidateMatchingOutput> {
  return aiPoweredCandidateMatchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredCandidateMatchingPrompt',
  input: {schema: AIPoweredCandidateMatchingInputSchema},
  output: {schema: AIPoweredCandidateMatchingOutputSchema},
  prompt: `You are an expert AI recruitment assistant. Your task is to match candidates to a given job description.
You will receive a detailed job description and a collection of candidate profiles.

Job Description:
{{{jobDescription}}}

Candidate Profiles:
{{{candidateProfiles}}}

Based on the provided information, analyze each candidate profile against the job description.
Identify the candidate UIDs that are the most relevant matches.
Provide a clear reasoning for your selections, highlighting specific skills, experience, or qualifications that make each candidate a strong fit.
Return the UIDs of the matched candidates in the 'relevantCandidateIDs' array and your explanation in the 'reasoning' field.

Prioritize candidates whose skills and experience closely align with the core requirements of the job description.
Consider factors like years of experience, specific technical skills, and cultural fit if discernible from the profiles.

Ensure the output is correctly formatted JSON.
`,
});

const aiPoweredCandidateMatchingFlow = ai.defineFlow(
  {
    name: 'aiPoweredCandidateMatchingFlow',
    inputSchema: AIPoweredCandidateMatchingInputSchema,
    outputSchema: AIPoweredCandidateMatchingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        // Handle cases where AI might return no output or an unexpected format
        console.warn('AI Candidate Matching flow returned no output from AI.');
        return { relevantCandidateIDs: [], reasoning: 'AI did not return a valid response or found no matches.' };
    }
    return output;
  }
);
