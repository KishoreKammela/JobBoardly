'use client';
import { useState, useEffect, type ChangeEvent } from 'react';
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
import { Loader2, Sparkles, AlertTriangle, Users } from 'lucide-react';
import {
  aiPoweredCandidateMatching,
  type AIPoweredCandidateMatchingInput,
  type AIPoweredCandidateMatchingOutput,
} from '@/ai/flows/ai-powered-candidate-matching';
import {
  parseJobDescriptionFlow,
  type ParseJobDescriptionOutput,
} from '@/ai/flows/parse-job-description-flow';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type {
  UserProfile,
  ExperienceEntry,
  EducationEntry,
  LanguageEntry,
} from '@/types';
import { CandidateCard } from '@/components/employer/CandidateCard';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query as firestoreQuery,
  where,
  Timestamp,
} from 'firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useRouter, usePathname } from 'next/navigation';
import { formatCurrencyINR } from '@/lib/utils';

const formatExperiencesForAICandidate = (
  experiences?: ExperienceEntry[]
): string => {
  if (!experiences || experiences.length === 0)
    return 'No work experience listed.';
  return experiences
    .map(
      (exp) =>
        `Company: ${exp.companyName || 'N/A'}, Role: ${exp.jobRole || 'N/A'}, Duration: ${exp.startDate || 'N/A'} to ${exp.currentlyWorking ? 'Present' : exp.endDate || 'N/A'}${exp.annualCTC ? `, Annual CTC: ${formatCurrencyINR(exp.annualCTC)}` : ''}. Description: ${exp.description || 'N/A'}`
    )
    .join('; ');
};

const formatEducationsForAICandidate = (
  educations?: EducationEntry[]
): string => {
  if (!educations || educations.length === 0) return 'No education listed.';
  return educations
    .map(
      (edu) =>
        `Level: ${edu.level || 'N/A'}, Degree: ${edu.degreeName || 'N/A'}, Institute: ${edu.instituteName || 'N/A'}, Batch: ${edu.startYear || 'N/A'}-${edu.endYear || 'N/A'}, Specialization: ${edu.specialization || 'N/A'}, Course Type: ${edu.courseType || 'N/A'}. Description: ${edu.description || 'N/A'}`
    )
    .join('; ');
};

const formatLanguagesForAICandidate = (languages?: LanguageEntry[]): string => {
  if (!languages || languages.length === 0) return 'No languages listed.';
  return languages
    .map(
      (lang) =>
        `${lang.languageName} (Proficiency: ${lang.proficiency}, Read: ${lang.canRead ? 'Y' : 'N'}, Write: ${lang.canWrite ? 'Y' : 'N'}, Speak: ${lang.canSpeak ? 'Y' : 'N'})`
    )
    .join(', ');
};

export default function AiCandidateMatchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isParsingJD, setIsParsingJD] = useState(false);
  const [result, setResult] = useState<AIPoweredCandidateMatchingOutput | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const [allCandidates, setAllCandidates] = useState<UserProfile[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);
  const [matchedCandidateDetails, setMatchedCandidateDetails] = useState<
    UserProfile[]
  >([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (user.role !== 'employer') {
      router.replace('/');
    }
  }, [user, authLoading, router, pathname]);

  useEffect(() => {
    if (user && user.role === 'employer') {
      const fetchCandidates = async () => {
        setCandidatesLoading(true);
        setCandidatesError(null);
        try {
          const usersCollectionRef = collection(db, 'users');
          const q = firestoreQuery(
            usersCollectionRef,
            where('role', '==', 'jobSeeker'),
            where('isProfileSearchable', '==', true)
          );
          const querySnapshot = await getDocs(q);
          const candidatesData = querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              uid: docSnap.id,
              ...data,
              createdAt:
                data.createdAt instanceof Timestamp
                  ? data.createdAt.toDate().toISOString()
                  : data.createdAt,
              updatedAt:
                data.updatedAt instanceof Timestamp
                  ? data.updatedAt.toDate().toISOString()
                  : data.updatedAt,
              lastActive:
                data.lastActive instanceof Timestamp
                  ? data.lastActive.toDate().toISOString()
                  : data.lastActive,
            } as UserProfile;
          });
          setAllCandidates(candidatesData);
        } catch (e: unknown) {
          console.error('Error fetching candidates for AI matcher:', e);
          let message =
            'Failed to load candidates for matching. Please try again later.';
          if (e instanceof Error) {
            message = `Failed to load candidates: ${e.message}`;
          }
          setCandidatesError(message);
        } finally {
          setCandidatesLoading(false);
        }
      };
      fetchCandidates();
    } else {
      setCandidatesLoading(false);
    }
  }, [user]);

  const formatCandidatesForAI = (candidates: UserProfile[]): string => {
    return candidates
      .map((c) => {
        let profileString = `Candidate UID: ${c.uid}\n`;
        profileString += `Name: ${c.name || 'N/A'}\n`;
        if (c.email) profileString += `Email: ${c.email}\n`;
        if (c.mobileNumber) profileString += `Mobile: ${c.mobileNumber}\n`;
        if (c.headline) profileString += `Headline: ${c.headline}\n`;
        if (c.gender) profileString += `Gender: ${c.gender}\n`;
        if (c.dateOfBirth) profileString += `Date of Birth: ${c.dateOfBirth}\n`;
        if (c.homeState) profileString += `Home State: ${c.homeState}\n`;
        if (c.homeCity) profileString += `Home City: ${c.homeCity}\n`;

        if (
          c.totalYearsExperience !== undefined ||
          c.totalMonthsExperience !== undefined
        ) {
          profileString += `Total Experience: ${c.totalYearsExperience || 0} years, ${c.totalMonthsExperience || 0} months\n`;
        }

        if (c.currentCTCValue !== undefined) {
          profileString += `Current Annual CTC (INR): ${formatCurrencyINR(c.currentCTCValue)} ${c.currentCTCConfidential ? '(Confidential)' : ''}\n`;
        }
        if (c.expectedCTCValue !== undefined) {
          profileString += `Expected Annual CTC (INR): ${formatCurrencyINR(c.expectedCTCValue)} ${c.expectedCTCNegotiable ? '(Negotiable)' : ''}\n`;
        }

        if (c.skills && c.skills.length > 0) {
          profileString += `Skills: ${c.skills.join(', ')}\n`;
        }
        if (c.languages && c.languages.length > 0) {
          profileString += `Languages: ${formatLanguagesForAICandidate(c.languages)}\n`;
        }

        profileString += `Work Experience Summary:\n${formatExperiencesForAICandidate(c.experiences)}\n`;
        profileString += `Education Summary:\n${formatEducationsForAICandidate(c.educations)}\n`;

        if (c.portfolioUrl)
          profileString += `Portfolio URL: ${c.portfolioUrl}\n`;
        if (c.linkedinUrl) profileString += `LinkedIn URL: ${c.linkedinUrl}\n`;
        if (c.preferredLocations && c.preferredLocations.length > 0) {
          profileString += `Preferred Locations: ${c.preferredLocations.join(', ')}\n`;
        }
        if (c.jobSearchStatus)
          profileString += `Current Job Search Status: ${c.jobSearchStatus.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}\n`;
        if (c.availability)
          profileString += `Availability to Start: ${c.availability}\n`;

        if (c.parsedResumeText) {
          profileString += `\n--- Additional Resume Summary (from parsed document) ---\n${c.parsedResumeText}\n`;
        }
        return profileString.trim();
      })
      .join('\n\n---\n\n');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setJobDescription('');
    }
  };

  const handleParseJD = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a job description document to parse.',
        variant: 'destructive',
      });
      return;
    }
    setIsParsingJD(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        const parsedData: ParseJobDescriptionOutput =
          await parseJobDescriptionFlow({ jobDescriptionDataUri: dataUri });

        if (
          parsedData.description &&
          parsedData.description.startsWith('Parsing Error:')
        ) {
          toast({
            title: 'JD Parsing Issue',
            description: parsedData.description,
            variant: 'destructive',
            duration: 9000,
          });
          setJobDescription(
            `Error during parsing: ${parsedData.description}\n\nTitle: ${parsedData.title || ''}\nSkills: ${(parsedData.skills || []).join(', ')}`
          );
        } else {
          let jdText = `Job Title: ${parsedData.title || 'Not specified'}\n`;
          jdText += `Location: ${parsedData.location || 'Not specified'}\n`;
          jdText += `Job Type: ${parsedData.jobType || 'Not specified'}\n`;
          if (parsedData.salaryMin || parsedData.salaryMax) {
            jdText += `Salary (Annual INR): ${parsedData.salaryMin ? formatCurrencyINR(parsedData.salaryMin) : 'N/A'} - ${parsedData.salaryMax ? formatCurrencyINR(parsedData.salaryMax) : 'N/A'}\n`;
          }
          jdText += `Skills: ${(parsedData.skills || []).join(', ')}\n\n`;
          jdText += `Full Description (including responsibilities, qualifications, etc.):\n${parsedData.description || 'Not specified'}`;
          setJobDescription(jdText);
          toast({
            title: 'JD Parsed',
            description: 'Job description has been extracted.',
          });
        }
        setFile(null);
      };
      reader.onerror = () => {
        toast({
          title: 'File Reading Error',
          description: 'Could not read the selected file.',
          variant: 'destructive',
        });
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown parsing error.';
      toast({
        title: 'JD Parsing Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsParsingJD(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || user.role !== 'employer') {
      toast({
        title: 'Access Denied',
        description: 'This feature is for employers.',
        variant: 'destructive',
      });
      return;
    }
    if (!jobDescription.trim()) {
      toast({
        title: 'Missing Job Description',
        description: 'Please provide a job description.',
        variant: 'destructive',
      });
      return;
    }
    if (candidatesLoading) {
      toast({
        title: 'Still loading candidates',
        description: 'Please wait until all candidates are loaded.',
        variant: 'default',
      });
      return;
    }
    if (candidatesError || allCandidates.length === 0) {
      toast({
        title: 'No Candidates Available',
        description:
          'Cannot perform matching as no searchable candidates are available or there was an error loading them.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setMatchedCandidateDetails([]);

    try {
      const candidateProfilesString = formatCandidatesForAI(allCandidates);
      const input: AIPoweredCandidateMatchingInput = {
        jobDescription,
        candidateProfiles: candidateProfilesString,
      };
      const aiResult = await aiPoweredCandidateMatching(input);
      setResult(aiResult);

      if (
        aiResult.relevantCandidateIDs &&
        aiResult.relevantCandidateIDs.length > 0
      ) {
        const matched = allCandidates.filter((c) =>
          aiResult.relevantCandidateIDs.includes(c.uid)
        );
        matched.sort(
          (a, b) =>
            aiResult.relevantCandidateIDs.indexOf(a.uid) -
            aiResult.relevantCandidateIDs.indexOf(b.uid)
        );
        setMatchedCandidateDetails(matched);

        if (matched.length === 0 && aiResult.relevantCandidateIDs.length > 0) {
          toast({
            title: 'Match IDs found, but no candidate details',
            description:
              "AI suggested candidate UIDs, but they don't correspond to known searchable profiles.",
            variant: 'default',
          });
        }
      }
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get AI-powered candidate matches. ${errorMessage}`);
      toast({
        title: 'AI Matching Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user && user.role !== 'employer') {
    return (
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Sparkles className="text-primary h-6 w-6" />
            AI Candidate Matcher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This tool is for employers to find suitable candidates.
            Redirecting...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
          <Sparkles className="text-primary h-6 w-6" /> AI Candidate Matcher
        </CardTitle>
        <CardDescription>
          Input or upload a job description. Our AI will scan our database of
          searchable candidate profiles to find the best matches for your role.
          Plain text (.txt) files give the best results for JD parsing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="jobDescriptionFile">
            Upload Job Description (Optional)
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="jobDescriptionFile"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="flex-1"
              aria-label="Upload job description file"
            />
            <Button
              type="button"
              onClick={handleParseJD}
              disabled={isParsingJD || !file}
              variant="outline"
              aria-label="Parse uploaded job description file"
            >
              {isParsingJD ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Parse File
            </Button>
          </div>
          {file && (
            <p className="text-xs text-muted-foreground">
              Selected: {file.name}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="jobDescription" className="text-lg">
            Job Description
          </Label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here, or upload a file above and click 'Parse File'."
            rows={15}
            className="mt-1 bg-muted/20"
            aria-label="Job Description Input"
          />
        </div>
        {candidatesError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{candidatesError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <Button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            candidatesLoading ||
            !user ||
            !!candidatesError ||
            isParsingJD
          }
          size="lg"
          aria-label="Find matching candidates"
        >
          {isLoading || candidatesLoading || isParsingJD ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Users className="mr-2 h-5 w-5" />
          )}
          {candidatesLoading
            ? 'Loading Searchable Candidates...'
            : isParsingJD
              ? 'Parsing JD...'
              : 'Find Matching Candidates'}
        </Button>
        {!user && (
          <p className="text-sm text-destructive text-center">
            Please log in as an employer to use this feature.
          </p>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
                  {result.reasoning || 'No reasoning provided.'}
                </p>
              </div>

              {matchedCandidateDetails.length > 0 ? (
                <div>
                  <h4 className="font-semibold text-md mt-4 mb-2">
                    Recommended Candidates ({matchedCandidateDetails.length}):
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedCandidateDetails.map((c) => (
                      <CandidateCard key={c.uid} candidate={c} />
                    ))}
                  </div>
                </div>
              ) : result.relevantCandidateIDs &&
                result.relevantCandidateIDs.length > 0 ? (
                <Alert variant="default" className="mt-4">
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    AI identified some potentially relevant candidate UIDs, but
                    they could not be matched to current searchable profiles.
                    This might happen if profiles were recently made private or
                    IDs are incorrect. See reasoning. Relevant UIDs:{' '}
                    {result.relevantCandidateIDs.join(', ')}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="default" className="mt-4">
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    No candidates were matched by the AI based on the provided
                    job description and available searchable profiles. Try
                    refining the job description or check back later for new
                    candidates.
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
