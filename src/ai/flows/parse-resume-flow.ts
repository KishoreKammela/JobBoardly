
'use server';
/**
 * @fileOverview Parses a resume document (provided as a data URI) and extracts structured information.
 *
 * @exported
 * - `parseResumeFlow`: The main function to trigger resume parsing.
 * - `ParseResumeInput`: The input type for the `parseResumeFlow` function.
 * - `ParseResumeOutput`: The output type (structured resume data) for the `parseResumeFlow` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ParsedResumeData } from '@/types'; // Using the type from global types

const ParseResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume document (e.g., PDF, DOCX) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ParseResumeInput = z.infer<typeof ParseResumeInputSchema>;

// Define Zod schema based on ParsedResumeData from types.ts
const ParseResumeOutputSchema = z.object({
  name: z.string().optional().describe('The full name of the candidate.'),
  email: z.string().email().optional().describe('The email address of the candidate.'),
  headline: z.string().optional().describe('A professional headline or summary for the candidate (e.g., "Senior Software Engineer").'),
  skills: z.array(z.string()).optional().describe('A list of skills extracted from the resume.'),
  experience: z.string().optional().describe('A summary of the work experience, preferably in Markdown format if structure can be inferred.'),
  portfolioUrl: z.string().url().optional().describe('URL to a personal portfolio, if available.'),
  linkedinUrl: z.string().url().optional().describe('URL to a LinkedIn profile, if available.'),
  // Add other fields from ParsedResumeData as needed, e.g., education
  // education: z.array(z.object({ institution: z.string(), degree: z.string(), year: z.string().optional() })).optional().describe("Educational background."),
}).describe('Structured information extracted from the resume.');

export type ParseResumeOutput = z.infer<typeof ParseResumeOutputSchema>;


export async function parseResumeFlow(input: ParseResumeInput): Promise<ParseResumeOutput> {
  return resumeParserFlow(input);
}

const resumeParserPrompt = ai.definePrompt({
  name: 'resumeParserPrompt',
  input: {schema: ParseResumeInputSchema},
  output: {schema: ParseResumeOutputSchema},
  prompt: `You are an expert resume parser. Analyze the following resume document and extract key information.

Resume Document:
{{media url=resumeDataUri}}

Extract the following details and structure them according to the output schema:
- Candidate's full name.
- Candidate's email address.
- A concise professional headline or summary.
- A list of technical and soft skills.
- A summary of their work experience. If possible, format it nicely, perhaps using Markdown for structure if you can infer sections like job titles, companies, and dates.
- URLs for their portfolio and LinkedIn profile, if present.

Prioritize accuracy. If some information is not clearly available, omit the field rather than guessing.
Ensure the output is valid JSON matching the provided schema.
`,
});

const resumeParserFlow = ai.defineFlow(
  {
    name: 'resumeParserFlow',
    inputSchema: ParseResumeInputSchema,
    outputSchema: ParseResumeOutputSchema,
  },
  async (input: ParseResumeInput): Promise<ParseResumeOutput> => {
    // In a real scenario, you might add pre-processing or post-processing steps here.
    // For example, converting DOCX to text before sending to LLM if the model handles images/PDFs better.
    
    const {output} = await resumeParserPrompt(input);
    
    if (!output) {
        // Fallback to a default structure or mock data if parsing fails or returns nothing
        // This is important for a better user experience than a hard error.
        console.warn('Resume parsing returned no output, returning empty structure.');
        return {
            name: undefined,
            email: undefined,
            headline: undefined,
            skills: [],
            experience: undefined,
            portfolioUrl: undefined,
            linkedinUrl: undefined,
        };
    }
    return output;
  }
);
