'use server';
/**
 * @fileOverview Parses a job description document (provided as a data URI) and extracts structured information.
 *
 * @exported
 * - `parseJobDescriptionFlow`: The main function to trigger job description parsing.
 * - `ParseJobDescriptionInput`: The input type for the `parseJobDescriptionFlow` function.
 * - `ParseJobDescriptionOutput`: The output type (structured job data) for the `parseJobDescriptionFlow` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { JobExperienceLevel } from '@/types';

const ParseJobDescriptionInputSchema = z.object({
  jobDescriptionDataUri: z
    .string()
    .describe(
      "A job description document (e.g., PDF, DOCX, TXT) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. For AI parsing with current model, plain text (.txt) is recommended for best results with complex documents."
    ),
});
export type ParseJobDescriptionInput = z.infer<
  typeof ParseJobDescriptionInputSchema
>;

const ParseJobDescriptionOutputSchema = z
  .object({
    title: z.string().optional().describe('The job title.'),
    description: z
      .string()
      .optional()
      .describe(
        'The main body of the job description, including responsibilities and qualifications. May contain an error message if parsing failed due to file type.'
      ),
    skills: z
      .array(z.string())
      .optional()
      .describe('A list of required or preferred skills for the job.'),
    location: z
      .string()
      .optional()
      .describe(
        'The location of the job (e.g., "San Francisco, CA", "Remote").'
      ),
    jobType: z
      .enum(['Full-time', 'Part-time', 'Contract', 'Internship'])
      .optional()
      .describe('The type of employment (e.g., Full-time, Contract).'),
    salaryMin: z
      .number()
      .optional()
      .describe('Minimum salary (annual INR), if specified.'),
    salaryMax: z
      .number()
      .optional()
      .describe('Maximum salary (annual INR), if specified.'),
    payTransparency: z
      .boolean()
      .optional()
      .describe(
        'Whether the salary range should be shown to applicants. Defaults to true if salary is provided.'
      ),
    benefits: z
      .array(z.string())
      .optional()
      .describe('List of benefits and perks offered.'),
    industry: z
      .string()
      .optional()
      .describe('The industry the job belongs to (e.g., Technology, Finance).'),
    department: z
      .string()
      .optional()
      .describe(
        'The functional area or department (e.g., Engineering, Marketing).'
      ),
    roleDesignation: z
      .string()
      .optional()
      .describe('A more specific title for the position.'),
    experienceLevel: z
      .enum([
        'Entry-Level',
        'Mid-Level',
        'Senior-Level',
        'Lead',
        'Manager',
        'Executive',
      ])
      .optional()
      .describe('The required experience level.'),
    minExperienceYears: z
      .number()
      .optional()
      .describe('Minimum years of experience required.'),
    maxExperienceYears: z
      .number()
      .optional()
      .describe('Maximum years of experience preferred.'),
    educationQualification: z
      .string()
      .optional()
      .describe(
        "Minimum educational background required (e.g., Bachelor's Degree)."
      ),
    applicationDeadline: z
      .string()
      .optional()
      .describe('Application deadline in YYYY-MM-DD format.'),
  })
  .describe(
    'Structured information extracted from the job description document.'
  );

export type ParseJobDescriptionOutput = z.infer<
  typeof ParseJobDescriptionOutputSchema
>;

export async function parseJobDescriptionFlow(
  input: ParseJobDescriptionInput
): Promise<ParseJobDescriptionOutput> {
  return jobDescriptionParserFlowInstance(input);
}

const jobDescriptionParserPrompt = ai.definePrompt({
  name: 'jobDescriptionParserPrompt',
  input: { schema: ParseJobDescriptionInputSchema },
  output: { schema: ParseJobDescriptionOutputSchema },
  prompt: `You are an expert job description parser. Analyze the following job description document and extract key information.

Job Description Document:
{{media url=jobDescriptionDataUri}}

Extract the following details and structure them according to the output schema:
- Job Title.
- Full Job Description (responsibilities, qualifications, about the role, etc.). Try to capture the main content.
- Required or Preferred Skills (as a list of strings).
- Job Location (e.g., "City, State", "Remote").
- Job Type (e.g., "Full-time", "Part-time", "Contract", "Internship").
- Salary range if specified (minimum and maximum annual INR values).
- Pay Transparency: If salary is mentioned, assume true unless specified otherwise.
- Benefits: List of perks like health insurance, PTO. Extract as an array of strings.
- Industry: (e.g., "Technology", "Finance").
- Functional Area/Department: (e.g., "Engineering", "Marketing").
- Role/Designation: A more specific title if available.
- Experience Level: (e.g., "Entry-Level", "Mid-Level", "Senior-Level", "Lead", "Manager", "Executive").
- Minimum Years of Experience: (e.g., 2, 5).
- Maximum Years of Experience: (e.g., 5, 10).
- Education Qualification: (e.g., "Bachelor's Degree in Computer Science").
- Application Deadline: (in YYYY-MM-DD format).

Prioritize accuracy. If some information is not clearly available, omit the field rather than guessing.
For skills and benefits, extract distinct items. For salary and experience years, provide numbers if possible.
Ensure the output is valid JSON matching the provided schema.
If the document content appears to be an error message about file processing, summarize that error in the 'description' field.
If salary is mentioned, set payTransparency to true unless stated otherwise in the document. If no salary, payTransparency can be omitted or false.
`,
});

const jobDescriptionParserFlowInstance = ai.defineFlow(
  {
    name: 'jobDescriptionParserFlow',
    inputSchema: ParseJobDescriptionInputSchema,
    outputSchema: ParseJobDescriptionOutputSchema,
  },
  async (
    input: ParseJobDescriptionInput
  ): Promise<ParseJobDescriptionOutput> => {
    const [header] = input.jobDescriptionDataUri.split(',');
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
        `Job Description Parsing: MIME type ${mimeType} is not suitable for direct processing with the current AI model configuration expecting image/video or plain text for the 'media' tag. ` +
          `Consider extracting text content from such documents before sending for AI analysis.`
      );
      return {
        description: `Parsing Error: The uploaded file type (${mimeType}) cannot be directly processed by the AI. Please try uploading a plain text file (.txt) or ensure the content is pasted directly if supported.`,
        skills: [],
      };
    }

    const { output } = await jobDescriptionParserPrompt(input);

    if (!output) {
      console.warn(
        'Job description parsing returned no output from AI, returning empty structure.'
      );
      return {
        title: undefined,
        description: undefined,
        skills: [],
        location: undefined,
        jobType: undefined,
        salaryMin: undefined,
        salaryMax: undefined,
        payTransparency: undefined,
        benefits: [],
        industry: undefined,
        department: undefined,
        roleDesignation: undefined,
        experienceLevel: undefined,
        minExperienceYears: undefined,
        maxExperienceYears: undefined,
        educationQualification: undefined,
        applicationDeadline: undefined,
      };
    }
    // Ensure payTransparency default logic
    if (output.salaryMin !== undefined || output.salaryMax !== undefined) {
      if (output.payTransparency === undefined) {
        output.payTransparency = true;
      }
    } else {
      output.payTransparency = false; // If no salary, default to false or omit
    }

    return output;
  }
);
