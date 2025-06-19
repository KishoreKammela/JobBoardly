'use server';
/**
 * @fileOverview Parses a resume document (provided as a data URI) and extracts structured information.
 *
 * @exported
 * - `parseResumeFlow`: The main function to trigger resume parsing.
 * - `ParseResumeInput`: The input type for the `parseResumeFlow` function.
 * - `ParseResumeOutput`: The output type (structured resume data) for the `parseResumeFlow` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ParseResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume document (e.g., PDF, DOCX, TXT) or plain text as a data URI. It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. For AI parsing with current model, plain text (MIME type 'text/plain') is recommended for best results."
    ),
});
export type ParseResumeInput = z.infer<typeof ParseResumeInputSchema>;

const ParseResumeOutputSchema = z
  .object({
    name: z.string().optional().describe('The full name of the candidate.'),
    email: z
      .string()
      .optional()
      .describe('The email address of the candidate.'),
    mobileNumber: z
      .string()
      .optional()
      .describe('The phone or mobile number of the candidate.'),
    headline: z
      .string()
      .optional()
      .describe(
        'A professional headline or summary for the candidate (e.g., "Senior Software Engineer").'
      ),
    skills: z
      .array(z.string())
      .optional()
      .describe('A list of skills extracted from the resume.'),
    experience: z
      .string()
      .optional()
      .describe(
        'A detailed summary of the work experience, ideally in Markdown format or well-structured text. This will be used to populate the parsedResumeText field primarily. May contain an error message if parsing failed due to file type. Try to extract job titles, companies, dates, and responsibilities if discernible within this summary.'
      ),
    education: z
      .string()
      .optional()
      .describe(
        'A detailed summary of education, ideally in Markdown or well-structured text. This will be used to populate the parsedResumeText field primarily. Try to extract degrees, institutions, and graduation years if discernible within this summary.'
      ),
    portfolioUrl: z
      .string()
      .optional()
      .describe('URL to a personal portfolio, if available.'),
    linkedinUrl: z
      .string()
      .optional()
      .describe('URL to a LinkedIn profile, if available.'),
    totalYearsExperience: z
      .number()
      .optional()
      .describe(
        'The total years of professional work experience, if explicitly mentioned or clearly inferable from the resume content.'
      ),
  })
  .describe(
    'Structured information extracted from the resume. The "experience" and "education" fields should be comprehensive summaries that can be used for the parsedResumeText field. The AI should attempt to identify distinct job roles/companies and degrees/institutions within these summaries, and infer total years of experience if possible.'
  );

export type ParseResumeOutput = z.infer<typeof ParseResumeOutputSchema>;

export async function parseResumeFlow(
  input: ParseResumeInput
): Promise<ParseResumeOutput> {
  return resumeParserFlow(input);
}

const resumeParserPrompt = ai.definePrompt({
  name: 'resumeParserPrompt',
  input: { schema: ParseResumeInputSchema },
  output: { schema: ParseResumeOutputSchema },
  prompt: `You are an expert resume parser. Analyze the following resume document/text and extract key information.

Resume Content:
{{media url=resumeDataUri}}

Extract the following details and structure them according to the output schema:
- Candidate's full name.
- Candidate's email address.
- Candidate's phone/mobile number.
- A concise professional headline or summary (e.g., "Senior Software Engineer specializing in...").
- A list of technical and soft skills.
- A detailed summary of their work experience. For this 'experience' field, provide a comprehensive text block. If possible, format it using Markdown for structure if you can infer distinct sections like job titles, companies, and dates/durations, and key responsibilities. This entire block will be used as a reference.
- A detailed summary of their education. Similar to experience, provide a comprehensive text block for the 'education' field. If possible, use Markdown for structure, identifying degrees, institutions, and graduation years/periods. This entire block will be used as a reference.
- URLs for their personal portfolio and LinkedIn profile, if present.
- Total years of professional work experience, if explicitly stated or clearly inferable from the work history dates. Provide this as a number (e.g., 5, 10.5).

Prioritize accuracy. If some information is not clearly available, omit the field rather than guessing.
Ensure the output is valid JSON matching the provided schema.
If the document content appears to be an error message about file processing, summarize that error in the 'experience' field.
The 'experience' and 'education' fields are critical for providing a rich summary for the user to then use to fill out structured data.
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
      mimeType = mimeType.trim();
    }

    const unsupportedMediaMimeTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/pdf',
      'application/vnd.oasis.opendocument.text',
    ];

    if (mimeType && unsupportedMediaMimeTypes.includes(mimeType)) {
      console.warn(
        `Resume Parsing: MIME type ${mimeType} is not suitable for direct processing with the current AI model configuration. ` +
          `Consider extracting text content from such documents before sending for AI analysis if results are poor.`
      );
    }

    const { output } = await resumeParserPrompt(input);

    if (!output) {
      console.warn(
        'Resume parsing returned no output from AI, returning empty structure.'
      );
      return {
        name: undefined,
        email: undefined,
        mobileNumber: undefined,
        headline: undefined,
        skills: [],
        experience: undefined,
        education: undefined,
        portfolioUrl: undefined,
        linkedinUrl: undefined,
        totalYearsExperience: undefined,
      };
    }
    return output;
  }
);
