
'use server';
/**
 * @fileOverview Parses a job description document (provided as a data URI) and extracts structured information.
 *
 * @exported
 * - `parseJobDescriptionFlow`: The main function to trigger job description parsing.
 * - `ParseJobDescriptionInput`: The input type for the `parseJobDescriptionFlow` function.
 * - `ParseJobDescriptionOutput`: The output type (structured job data) for the `parseJobDescriptionFlow` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ParsedJobData } from '@/types'; // Using the type from global types

const ParseJobDescriptionInputSchema = z.object({
  jobDescriptionDataUri: z
    .string()
    .describe(
      "A job description document (e.g., PDF, DOCX, TXT) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ParseJobDescriptionInput = z.infer<typeof ParseJobDescriptionInputSchema>;

// Define Zod schema based on ParsedJobData from types.ts
const ParseJobDescriptionOutputSchema = z.object({
  title: z.string().optional().describe('The job title.'),
  description: z.string().optional().describe('The main body of the job description, including responsibilities and qualifications.'),
  skills: z.array(z.string()).optional().describe('A list of required or preferred skills for the job.'),
  location: z.string().optional().describe('The location of the job (e.g., "San Francisco, CA", "Remote").'),
  jobType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']).optional().describe('The type of employment (e.g., Full-time, Contract).'),
  salaryMin: z.number().optional().describe('Minimum salary, if specified.'),
  salaryMax: z.number().optional().describe('Maximum salary, if specified.'),
  // companyName: z.string().optional().describe('The name of the company hiring (if discernible and not already known).'),
}).describe('Structured information extracted from the job description document.');

export type ParseJobDescriptionOutput = z.infer<typeof ParseJobDescriptionOutputSchema>;


export async function parseJobDescriptionFlow(input: ParseJobDescriptionInput): Promise<ParseJobDescriptionOutput> {
  return jobDescriptionParserFlow(input);
}

const jobDescriptionParserPrompt = ai.definePrompt({
  name: 'jobDescriptionParserPrompt',
  input: {schema: ParseJobDescriptionInputSchema},
  output: {schema: ParseJobDescriptionOutputSchema},
  prompt: `You are an expert job description parser. Analyze the following job description document and extract key information.

Job Description Document:
{{media url=jobDescriptionDataUri}}

Extract the following details and structure them according to the output schema:
- Job Title.
- Full Job Description (responsibilities, qualifications, about the role, etc.). Try to capture the main content.
- Required or Preferred Skills (as a list of strings).
- Job Location (e.g., "City, State", "Remote").
- Job Type (e.g., "Full-time", "Part-time", "Contract", "Internship").
- Salary range if specified (minimum and maximum values).

Prioritize accuracy. If some information is not clearly available, omit the field rather than guessing.
For skills, extract distinct skills. For salary, provide numbers if possible.
Ensure the output is valid JSON matching the provided schema.
`,
});

const jobDescriptionParserFlow = ai.defineFlow(
  {
    name: 'jobDescriptionParserFlow',
    inputSchema: ParseJobDescriptionInputSchema,
    outputSchema: ParseJobDescriptionOutputSchema,
  },
  async (input: ParseJobDescriptionInput): Promise<ParseJobDescriptionOutput> => {
    const {output} = await jobDescriptionParserPrompt(input);
    
    if (!output) {
        console.warn('Job description parsing returned no output, returning empty structure.');
        return {
            title: undefined,
            description: undefined,
            skills: [],
            location: undefined,
            jobType: undefined,
            salaryMin: undefined,
            salaryMax: undefined,
        };
    }
    return output;
  }
);
