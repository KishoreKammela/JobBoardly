'use server';
/**
 * @fileOverview Generates a professional summary for a job seeker's profile
 * based on their existing profile data and a target role or company.
 *
 * @exported
 * - `generateProfileSummary`: The main function to trigger summary generation.
 * - `GenerateProfileSummaryInput`: The input type for the function.
 * - `GenerateProfileSummaryOutput`: The output type (generated summary) for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProfileSummaryInputSchema = z.object({
  jobSeekerProfileData: z
    .string()
    .describe(
      'A string containing key details from the job seeker profile, including name, headline, a summary of experiences, skills, and education.'
    ),
  targetRoleOrCompany: z
    .string()
    .optional()
    .describe(
      'The target job role, industry, or company name the summary should be tailored for. (Optional)'
    ),
});
export type GenerateProfileSummaryInput = z.infer<
  typeof GenerateProfileSummaryInputSchema
>;

const GenerateProfileSummaryOutputSchema = z.object({
  generatedSummary: z
    .string()
    .describe('The AI-generated professional summary, typically 3-5 sentences.')
    .optional(),
});
export type GenerateProfileSummaryOutput = z.infer<
  typeof GenerateProfileSummaryOutputSchema
>;

export async function generateProfileSummary(
  input: GenerateProfileSummaryInput
): Promise<GenerateProfileSummaryOutput> {
  return generateProfileSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProfileSummaryPrompt',
  input: { schema: GenerateProfileSummaryInputSchema },
  output: { schema: GenerateProfileSummaryOutputSchema },
  prompt: `You are an expert career coach and professional resume writer.
Your task is to generate a concise, impactful, and professional summary (approximately 3-5 sentences) for a job seeker.
The summary should be tailored to the 'targetRoleOrCompany' if provided.
Use the 'jobSeekerProfileData' to understand their background, skills, and experiences.

Job Seeker Profile Data:
{{{jobSeekerProfileData}}}

{{#if targetRoleOrCompany}}
Target Role/Company/Industry: {{{targetRoleOrCompany}}}
Focus the summary on highlighting experiences and skills most relevant to this target.
{{else}}
Generate a general, strong professional summary.
{{/if}}

Craft a summary that is:
- Engaging and professional in tone.
- Highlights key strengths and achievements.
- Aligns with the job seeker's career aspirations as inferable from their profile.
- Is well-written and grammatically correct.
- Avoids clichés and generic statements.

Return only the generated summary text in the 'generatedSummary' field of the JSON output.
If the profile data is too sparse to generate a meaningful summary, you can indicate that or return a very generic placeholder.
`,
});

const generateProfileSummaryFlow = ai.defineFlow(
  {
    name: 'generateProfileSummaryFlow',
    inputSchema: GenerateProfileSummaryInputSchema,
    outputSchema: GenerateProfileSummaryOutputSchema,
  },
  async (input: GenerateProfileSummaryInput) => {
    const { output } = await prompt(input);
    if (!output || !output.generatedSummary) {
      console.warn(
        'Generate Profile Summary flow returned no summary from AI.'
      );
      return {
        generatedSummary:
          'Could not generate a summary at this time. Please ensure your profile has sufficient details or try again.',
      };
    }
    return output;
  }
);
