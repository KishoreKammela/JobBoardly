
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
      "A resume document (e.g., PDF, DOCX) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. For AI parsing with current model, plain text (.txt) is recommended for best results."
    ),
});
export type ParseResumeInput = z.infer<typeof ParseResumeInputSchema>;

// Define Zod schema based on ParsedResumeData from types.ts
const ParseResumeOutputSchema = z.object({
  name: z.string().optional().describe('The full name of the candidate.'),
  email: z.string().email().optional().describe('The email address of the candidate.'),
  headline: z.string().optional().describe('A professional headline or summary for the candidate (e.g., "Senior Software Engineer").'),
  skills: z.array(z.string()).optional().describe('A list of skills extracted from the resume.'),
  experience: z.string().optional().describe('A summary of the work experience, preferably in Markdown format if structure can be inferred. May contain an error message if parsing failed due to file type.'),
  portfolioUrl: z.string().url().optional().describe('URL to a personal portfolio, if available.'),
  linkedinUrl: z.string().url().optional().describe('URL to a LinkedIn profile, if available.'),
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
If the document content appears to be an error message about file processing, summarize that error.
`,
});

const resumeParserFlow = ai.defineFlow(
  {
    name: 'resumeParserFlow',
    inputSchema: ParseResumeInputSchema,
    outputSchema: ParseResumeOutputSchema,
  },
  async (input: ParseResumeInput): Promise<ParseResumeOutput> => {
    const [header] = input.resumeDataUri.split(',');
    let mimeType = header.match(/:(.*?);/)?.[1];

    if (mimeType) {
      mimeType = mimeType.trim(); // Trim whitespace from extracted MIME type
    }

    const unsupportedMediaMimeTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/pdf', // .pdf
      'application/vnd.oasis.opendocument.text', // .odt
    ];

    if (mimeType && unsupportedMediaMimeTypes.includes(mimeType)) {
      console.warn(
        `Resume Parsing: MIME type ${mimeType} is not suitable for direct processing with the current AI model configuration expecting image/video or plain text for the 'media' tag. ` +
        `Consider extracting text content from such documents before sending for AI analysis.`
      );
      return {
        experience: `Parsing Error: The uploaded file type (${mimeType}) cannot be directly processed by the AI. Please try uploading a plain text file (.txt) or ensure the content is pasted directly if supported.`,
        skills: [], // Ensure skills is always an array
      };
    }
    
    const {output} = await resumeParserPrompt(input);
    
    if (!output) {
        console.warn('Resume parsing returned no output from AI, returning empty structure.');
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
