'use server';
/**
 * @fileOverview This file defines the AI-powered job matching flow.
 *
 * It takes a job seeker's detailed profile (including skills, experience, education, languages, preferences like salary and location, and total experience)
 * and suggests relevant job positions from a list of available, approved job postings.
 *
 * @exported
 * - `aiPoweredJobMatching`: The main function to trigger the job matching flow.
 * - `AIPoweredJobMatchingInput`: The input type for the `aiPoweredJobMatching` function.
 * - `AIPoweredJobMatchingOutput`: The output type for the `aiPoweredJobMatching` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIPoweredJobMatchingInputSchema = z.object({
  jobSeekerProfile: z
    .string()
    .describe(
      'A comprehensive profile of the job seeker. This should include: Name, Email, Mobile (optional), Headline, Skills (comma-separated list), Languages (comma-separated list with proficiency and read/write/speak abilities, e.g., "English (Advanced, RWS), Spanish (Intermediate, R)"), Total Years of Professional Experience (e.g., "5 years, 6 months"), detailed Work Experience (each entry with: Company Name, Job Role, Duration, Description, Annual CTC), detailed Education (each entry with: Level, Degree, Institute, Batch, Specialization, Course Type, Description), Portfolio URL (optional), LinkedIn URL (optional), Preferred Locations (comma-separated list), Current Job Search Status (e.g., Actively Looking, Open to Opportunities), Notice Period (e.g., "Immediately Available", "1 Month"), Current Annual CTC in INR (e.g., "₹16LPA (Confidential)"), Expected Annual CTC in INR (e.g., "₹20LPA (Negotiable)"), Gender, Date of Birth, Home State, Home City, and any additional summary from a parsed resume document.'
    ),
  jobPostings: z
    .string()
    .describe(
      'A list/collection of available job postings. Each posting should include: Job ID, Title, Company, Location, Type (Full-time, Part-time, etc.), Remote status, detailed Responsibilities, detailed Requirements, Required Skills (comma-separated list), Salary Range (Annual INR, e.g., "₹10LPA - ₹15LPA"), Pay Transparency (boolean), Benefits (string), Industry, Department/Functional Area, Role/Designation, Experience Level (e.g., Entry-Level, Mid-Level), Min/Max Years of Experience, Education Qualification, and Application Deadline (YYYY-MM-DD).'
    ),
});

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
      "A detailed explanation of why these specific jobs were selected for the seeker, highlighting key matches between the seeker's profile (skills, total experience, detailed work experience including roles/responsibilities/CTCs, detailed education including specializations, languages with proficiency, salary expectations vs job's range, location preferences, CTC, gender, DOB, home location, notice period, job search status, and resume summary) and the job details (responsibilities, requirements, industry, department, experience level, specific years of experience, education qualification, and benefits)."
    ),
});

export type AIPoweredJobMatchingOutput = z.infer<
  typeof AIPoweredJobMatchingOutputSchema
>;

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
1.  Thoroughly analyze the job seeker's profile. Pay close attention to their:
    - Skills (technical and soft)
    - Languages (including proficiency and RWS abilities)
    - Total Years of Professional Experience (e.g., "5 years, 6 months")
    - Detailed Work Experience (roles, responsibilities, duration, specific achievements, and annual CTC for each role)
    - Detailed Education (level, degree, institute, specialization, course type, graduation year)
    - Stated Preferences (preferred locations, expected salary in INR, job search status, current CTC, notice period)
    - Personal Details (gender, date of birth, home state/city if they might influence location or cultural fit, though be cautious with biases)
    - Any summary from their resume document.
2.  Carefully review each job posting, focusing on the job's responsibilities, requirements, required skills, language requirements, location, job type, remote status, salary range (and pay transparency), benefits (as a string), industry, department, role designation, experience level, min/max years of experience, education qualification, and application deadline.
3.  Identify the job IDs that are the MOST relevant matches for the job seeker. Consider a holistic match, not just keyword stuffing.
4.  Provide a detailed reasoning for your selections. Explain for each recommended job (or generally for the set of recommendations) how it aligns with the seeker's comprehensive profile. Highlight specific connections, e.g., "The seeker's experience in 'Project Management' and skill 'Agile' directly match Job ID XYZ's requirements and responsibilities in the 'Technology' industry and 'Engineering' department." or "Job ID ABC aligns with the seeker's expected salary range, preferred remote work option, and the job's 'Mid-Level' experience requirement fits the seeker's 5 years of experience." Also consider total years of experience, language skills, educational background alignment, and how their detailed work history (specific roles and responsibilities) maps to the job's needs.
5.  Return the job IDs in the 'relevantJobIDs' array, ideally ordered by relevance (most relevant first).
6.  Ensure your output is a correctly formatted JSON object matching the defined output schema.

Prioritize jobs that offer a strong alignment in skills, depth and type of experience (including total years of experience and alignment with the job's experience level), salary expectations (if seeker's expected salary falls within or near job's range, considering current CTC and job's pay transparency), location/remote preferences, industry, and education.
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
  async (input: AIPoweredJobMatchingInput) => {
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
