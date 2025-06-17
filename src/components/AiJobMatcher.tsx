
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link'; // Added import
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { aiPoweredJobMatching, type AIPoweredJobMatchingInput, type AIPoweredJobMatchingOutput } from '@/ai/flows/ai-powered-job-matching';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { mockJobs } from '@/lib/mockData'; // For example job postings

export function AiJobMatcher() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobSeekerProfile, setJobSeekerProfile] = useState('');
  const [jobPostings, setJobPostings] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIPoweredJobMatchingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role === 'jobSeeker') {
      let profileText = `Name: ${user.name}\nEmail: ${user.email}\n`;
      if (user.headline) profileText += `Headline: ${user.headline}\n`;
      if (user.skills && user.skills.length > 0) {
        profileText += `Skills: ${user.skills.join(', ')}\n`;
      }
      if (user.experience) {
        profileText += `Experience:\n${user.experience}\n`;
      }
      if (user.portfolioUrl) profileText += `Portfolio: ${user.portfolioUrl}\n`;
      if (user.linkedinUrl) profileText += `LinkedIn: ${user.linkedinUrl}\n`;
      if (user.preferredLocations && user.preferredLocations.length > 0) {
        profileText += `Preferred Locations: ${user.preferredLocations.join(', ')}\n`;
      }
      if (user.jobSearchStatus) profileText += `Job Search Status: ${user.jobSearchStatus}\n`;
      if (user.desiredSalary) profileText += `Desired Salary: $${user.desiredSalary.toLocaleString()}\n`;
      
      if (user.parsedResumeText) { // This might be redundant if experience is well-populated
         profileText += `\n--- Resume Summary (additional context) ---\n${user.parsedResumeText}`;
      }
      setJobSeekerProfile(profileText.trim());
    }
    
    // Pre-fill job postings with mock data for demonstration
    const examplePostings = mockJobs.slice(0, 3).map(job => 
      `Job ID: ${job.id}\nTitle: ${job.title}\nCompany: ${job.company}\nDescription: ${job.description}\nSkills: ${job.skills.join(', ')}\nLocation: ${job.location}\nType: ${job.type}\nRemote: ${job.isRemote}\nSalary: ${job.salaryMin ? `$${job.salaryMin}-` : ''}${job.salaryMax ? `$${job.salaryMax}` : 'N/A'}\n`
    ).join('\n---\n');
    setJobPostings(examplePostings);

  }, [user]);

  const handleSubmit = async () => {
    if (!user || user.role !== 'jobSeeker') {
      toast({
        title: 'Access Denied',
        description: 'AI Job Matcher is for job seekers. Please log in with a job seeker account.',
        variant: 'destructive',
      });
      return;
    }
    if (!jobSeekerProfile.trim() || !jobPostings.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please ensure your profile information is available and provide job postings.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const input: AIPoweredJobMatchingInput = {
        jobSeekerProfile,
        jobPostings,
      };
      const aiResult = await aiPoweredJobMatching(input);
      setResult(aiResult);
    } catch (e) {
      console.error("AI Matching Error:", e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
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
                <p className="text-muted-foreground">This feature is available for job seeker accounts. Employers can post jobs and manage applications through the employer portal.</p>
            </CardContent>
        </Card>
    )
  }


  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
          <Sparkles className="text-primary h-6 w-6" />
          AI-Powered Job Matcher
        </CardTitle>
        <CardDescription>
          Your profile details (auto-filled if available) and job postings below will be used by our AI to recommend relevant jobs. 
          The job postings are pre-filled with examples.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="jobSeekerProfile" className="text-lg">Your Profile Summary (Auto-Generated)</Label>
          <Textarea
            id="jobSeekerProfile"
            value={jobSeekerProfile}
            onChange={(e) => setJobSeekerProfile(e.target.value)}
            placeholder="Your profile details will appear here. You can edit them if needed before matching."
            rows={10}
            className="mt-1 bg-muted/20"
            aria-label="Job Seeker Profile Input"
          />
           <p className="text-xs text-muted-foreground mt-1">This summary is generated from your profile. You can <Link href="/profile" className="underline text-primary">edit your full profile here</Link>.</p>
        </div>
        <div>
          <Label htmlFor="jobPostings" className="text-lg">Job Postings (Example Data)</Label>
          <Textarea
            id="jobPostings"
            value={jobPostings}
            onChange={(e) => setJobPostings(e.target.value)}
            placeholder="Paste job descriptions here, one per line or separated by '---'..."
            rows={12}
            className="mt-1"
            aria-label="Job Postings Input"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <Button onClick={handleSubmit} disabled={isLoading || !user} size="lg">
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          Get Matches
        </Button>
        {!user && <p className="text-sm text-destructive text-center">Please log in as a job seeker to use the AI Matcher.</p>}
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        {result && (
          <Card className="mt-4 bg-muted/30">
            <CardHeader>
              <CardTitle className="text-xl">Matching Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-md">Relevant Job IDs:</h4>
                {result.relevantJobIDs.length > 0 ? (
                  <ul className="list-disc list-inside mt-1">
                    {result.relevantJobIDs.map(id => <li key={id}>{id}</li>)}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific job IDs matched from the provided postings. See reasoning.</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-md">Reasoning:</h4>
                <p className="text-sm whitespace-pre-wrap">{result.reasoning}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardFooter>
    </Card>
  );
}
