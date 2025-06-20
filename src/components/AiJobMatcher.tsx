'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Sparkles, AlertTriangle, Briefcase } from 'lucide-react';
import {
  aiPoweredJobMatching,
  type AIPoweredJobMatchingInput,
  type AIPoweredJobMatchingOutput,
} from '@/ai/flows/ai-powered-job-matching';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Job,
  ExperienceEntry,
  EducationEntry,
  LanguageEntry,
} from '@/types';
import { JobCard } from '@/components/JobCard';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query as firestoreQuery,
  Timestamp,
  orderBy,
  where,
} from 'firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrencyINR } from '@/lib/utils';

const formatExperiencesForAI = (experiences?: ExperienceEntry[]): string => {
  if (!experiences || experiences.length === 0)
    return 'No work experience listed.';
  return experiences
    .map(
      (exp) =>
        `Company: ${exp.companyName || 'N/A'}\nRole: ${exp.jobRole || 'N/A'}\nDuration: ${exp.startDate || 'N/A'} to ${exp.currentlyWorking ? 'Present' : exp.endDate || 'N/A'}\n${exp.annualCTC ? `Annual CTC: ${formatCurrencyINR(exp.annualCTC)}\n` : ''}Description: ${exp.description || 'N/A'}`
    )
    .join('\n\n');
};

const formatEducationsForAI = (educations?: EducationEntry[]): string => {
  if (!educations || educations.length === 0) return 'No education listed.';
  return educations
    .map(
      (edu) =>
        `Level: ${edu.level || 'N/A'}\nDegree: ${edu.degreeName || 'N/A'}\nInstitute: ${edu.instituteName || 'N/A'}\nBatch: ${edu.startYear || 'N/A'} - ${edu.endYear || 'N/A'}\nSpecialization: ${edu.specialization || 'N/A'}\nCourse Type: ${edu.courseType || 'N/A'}\nDescription: ${edu.description || 'N/A'}`
    )
    .join('\n\n');
};

const formatLanguagesForAI = (languages?: LanguageEntry[]): string => {
  if (!languages || languages.length === 0) return 'No languages listed.';
  return languages
    .map(
      (lang) =>
        `${lang.languageName} (Proficiency: ${lang.proficiency}, Read: ${lang.canRead ? 'Yes' : 'No'}, Write: ${lang.canWrite ? 'Yes' : 'No'}, Speak: ${lang.canSpeak ? 'Yes' : 'No'})`
    )
    .join(', ');
};

export function AiJobMatcher() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobSeekerProfile, setJobSeekerProfile] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIPoweredJobMatchingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [matchedJobsDetails, setMatchedJobsDetails] = useState<Job[]>([]);

  useEffect(() => {
    if (user && user.role === 'jobSeeker') {
      let profileText = `Job Seeker Profile:\n`;
      profileText += `Name: ${user.name || 'N/A'}\n`;
      profileText += `Email: ${user.email || 'N/A'}\n`;
      if (user.mobileNumber) profileText += `Mobile: ${user.mobileNumber}\n`;
      if (user.headline) profileText += `Headline: ${user.headline}\n`;
      if (user.gender) profileText += `Gender: ${user.gender}\n`;
      if (user.dateOfBirth)
        profileText += `Date of Birth: ${user.dateOfBirth}\n`;
      if (user.homeState) profileText += `Home State: ${user.homeState}\n`;
      if (user.homeCity) profileText += `Home City: ${user.homeCity}\n`;

      if (
        user.totalYearsExperience !== undefined ||
        user.totalMonthsExperience !== undefined
      ) {
        profileText += `Total Experience: ${user.totalYearsExperience || 0} years, ${user.totalMonthsExperience || 0} months\n`;
      }

      if (user.currentCTCValue !== undefined) {
        profileText += `Current Annual CTC (INR): ${formatCurrencyINR(user.currentCTCValue)} ${user.currentCTCConfidential ? '(Confidential)' : ''}\n`;
      }
      if (user.expectedCTCValue !== undefined) {
        profileText += `Expected Annual CTC (INR): ${formatCurrencyINR(user.expectedCTCValue)} ${user.expectedCTCNegotiable ? '(Negotiable)' : ''}\n`;
      }

      if (user.skills && user.skills.length > 0) {
        profileText += `Skills: ${user.skills.join(', ')}\n`;
      }
      if (user.languages && user.languages.length > 0) {
        profileText += `Languages: ${formatLanguagesForAI(user.languages)}\n`;
      }

      profileText += `\n--- Work Experience ---\n${formatExperiencesForAI(user.experiences)}\n`;
      profileText += `\n--- Education ---\n${formatEducationsForAI(user.educations)}\n`;

      if (user.portfolioUrl)
        profileText += `Portfolio URL: ${user.portfolioUrl}\n`;
      if (user.linkedinUrl)
        profileText += `LinkedIn URL: ${user.linkedinUrl}\n`;

      if (user.preferredLocations && user.preferredLocations.length > 0) {
        profileText += `Preferred Locations: ${user.preferredLocations.join(', ')}\n`;
      }
      if (user.jobSearchStatus)
        profileText += `Current Job Search Status: ${user.jobSearchStatus.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}\n`;
      if (user.availability)
        profileText += `Availability to Start: ${user.availability}\n`;

      if (user.parsedResumeText) {
        profileText += `\n--- Additional Resume Summary (from parsed document) ---\n${user.parsedResumeText}`;
      }
      setJobSeekerProfile(profileText.trim());
    }
  }, [user]);

  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      setJobsError(null);
      try {
        const jobsCollectionRef = collection(db, 'jobs');
        const q = firestoreQuery(
          jobsCollectionRef,
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            postedDate:
              data.postedDate instanceof Timestamp
                ? data.postedDate.toDate().toISOString().split('T')[0]
                : data.postedDate,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt,
          } as Job;
        });
        setAllJobs(jobsData);
      } catch (e: unknown) {
        console.error('Error fetching jobs for AI matcher:', e);
        setJobsError(
          'Failed to load jobs for matching. Please try again later.'
        );
      } finally {
        setJobsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const formatJobsForAI = (jobs: Job[]): string => {
    return jobs
      .map(
        (job) =>
          `Job ID: ${job.id}\nTitle: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nType: ${job.type}\nRemote: ${job.isRemote}\nDescription:\n${job.description}\nRequired Skills: ${(job.skills || []).join(', ')}\nSalary Range (Annual INR): ${job.salaryMin ? formatCurrencyINR(job.salaryMin) : 'N/A'} - ${job.salaryMax ? formatCurrencyINR(job.salaryMax) : 'N/A'}\n`
      )
      .join('\n---\n');
  };

  const handleSubmit = async () => {
    if (!user || user.role !== 'jobSeeker') {
      toast({
        title: 'Access Denied',
        description:
          'AI Job Matcher is for job seekers. Please log in with a job seeker account.',
        variant: 'destructive',
      });
      return;
    }
    if (!jobSeekerProfile.trim()) {
      toast({
        title: 'Missing Information',
        description:
          'Please ensure your profile information is available. Edit your profile if needed.',
        variant: 'destructive',
      });
      return;
    }
    if (jobsLoading) {
      toast({
        title: 'Still loading jobs',
        description: 'Please wait until all jobs are loaded before matching.',
        variant: 'default',
      });
      return;
    }
    if (jobsError || allJobs.length === 0) {
      toast({
        title: 'No Jobs Available',
        description:
          'Cannot perform matching as no jobs are available or there was an error loading them.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setMatchedJobsDetails([]);

    try {
      const jobPostingsString = formatJobsForAI(allJobs);
      const input: AIPoweredJobMatchingInput = {
        jobSeekerProfile,
        jobPostings: jobPostingsString,
      };
      const aiResult = await aiPoweredJobMatching(input);
      setResult(aiResult);

      if (aiResult.relevantJobIDs && aiResult.relevantJobIDs.length > 0) {
        const matched = allJobs.filter((job) =>
          aiResult.relevantJobIDs.includes(job.id)
        );
        matched.sort(
          (a, b) =>
            aiResult.relevantJobIDs.indexOf(a.id) -
            aiResult.relevantJobIDs.indexOf(b.id)
        );
        setMatchedJobsDetails(matched);

        if (matched.length === 0 && aiResult.relevantJobIDs.length > 0) {
          toast({
            title: 'Match IDs found, but no job details',
            description:
              "AI suggested job IDs, but they don't correspond to known listings. See reasoning.",
            variant: 'default',
          });
        }
      }
    } catch (e: unknown) {
      console.error('AI Matching Error:', e);
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get AI-powered job matches. ${errorMessage}`);
      toast({
        title: 'AI Matching Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (user && user.role !== 'jobSeeker') {
    return (
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Sparkles className="text-primary h-6 w-6" />
            AI-Powered Job Matcher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature is available for job seeker accounts. Employers can
            post jobs and manage applications through the employer portal.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
          <Sparkles className="text-primary h-6 w-6" />
          AI-Powered Job Matcher
        </CardTitle>
        <CardDescription>
          Your profile details (auto-filled if available) will be used by our AI
          to recommend relevant jobs from our entire database of listings.
          Review and edit the summary below for this session if needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="jobSeekerProfile" className="text-lg">
            Your Profile Summary (Editable for this session)
          </Label>
          <Textarea
            id="jobSeekerProfile"
            value={jobSeekerProfile}
            onChange={(e) => setJobSeekerProfile(e.target.value)}
            placeholder="Your profile details will appear here. You can edit them if needed before matching."
            rows={15}
            className="mt-1 bg-muted/20"
            aria-label="Job Seeker Profile Input"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This summary is generated from your full profile. Changes here are
            temporary and only affect this matching session. To permanently
            update your details,{' '}
            <Link href="/profile" className="underline text-primary">
              edit your profile here
            </Link>
            .
          </p>
        </div>
        {jobsError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{jobsError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || jobsLoading || !user || !!jobsError}
          size="lg"
          aria-label="Get AI Job Matches"
        >
          {isLoading || jobsLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          {jobsLoading ? 'Loading Jobs...' : 'Get Matches'}
        </Button>
        {!user && (
          <p className="text-sm text-destructive text-center">
            Please log in as a job seeker to use the AI Matcher.
          </p>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && !isLoading && (
          <Card className="mt-4 bg-muted/30 w-full">
            <CardHeader>
              <CardTitle className="text-xl">Matching Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-md mb-2">AI Reasoning:</h4>
                <p className="text-sm whitespace-pre-wrap bg-background p-3 rounded-md border">
                  {result.reasoning || 'No reasoning provided by AI.'}
                </p>
              </div>

              {matchedJobsDetails.length > 0 ? (
                <div>
                  <h4 className="font-semibold text-md mt-4 mb-2">
                    Recommended Jobs ({matchedJobsDetails.length}):
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedJobsDetails.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              ) : result.relevantJobIDs && result.relevantJobIDs.length > 0 ? (
                <Alert variant="default" className="mt-4">
                  <Briefcase className="h-4 w-4" />
                  <AlertDescription>
                    AI identified some potentially relevant job IDs, but they
                    could not be matched to current listings. This might happen
                    if jobs were recently removed or their status changed. See
                    reasoning above. Relevant IDs:{' '}
                    {result.relevantJobIDs.join(', ')}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="default" className="mt-4">
                  <Briefcase className="h-4 w-4" />
                  <AlertDescription>
                    No specific jobs were matched by the AI based on your
                    current profile and available listings. Try refining your
                    profile summary or check back later for new job postings.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </CardFooter>
    </Card>
  );
}
