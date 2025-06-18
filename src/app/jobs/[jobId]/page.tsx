
"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Job } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { MapPin, Briefcase, DollarSign, Bookmark, ExternalLink, Building, CheckCircle, Loader2, AlertCircle, Share2, CalendarDays } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { formatCurrencyINR } from '@/lib/utils';
import Link from 'next/link'; // Import Link

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, applyForJob, hasAppliedForJob, saveJob, unsaveJob, isJobSaved } = useAuth();
  const { toast } = useToast();
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (jobId) {
      const fetchJob = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const jobDocRef = doc(db, 'jobs', jobId);
          const jobDocSnap = await getDoc(jobDocRef);
          if (jobDocSnap.exists()) {
            const data = jobDocSnap.data();
            const jobData = {
              id: jobDocSnap.id,
              ...data,
              postedDate: data.postedDate instanceof Timestamp ? data.postedDate.toDate().toISOString().split('T')[0] : data.postedDate,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
              updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            } as Job;
            setJob(jobData);
            if (user && user.role === 'jobSeeker') {
              setApplied(hasAppliedForJob(jobId));
              setSaved(isJobSaved(jobId));
            }
          } else {
            setError('Job not found.');
          }
        } catch (e) {
          console.error('Error fetching job details:', e);
          setError('Failed to load job details. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchJob();
    }
  }, [jobId, user, hasAppliedForJob, isJobSaved]);

  const handleApply = async () => {
    if (!job) return;
    if (user && user.role === 'jobSeeker') {
      await applyForJob(job.id);
      setApplied(true);
      toast({
        title: 'Applied!',
        description: `You've applied for ${job.title} at ${job.company}.`,
      });
    } else if (!user) {
      toast({ title: 'Login Required', description: 'Please log in as a job seeker to apply.', variant: 'destructive' });
    } else if (user.role === 'employer') {
        toast({ title: 'Action Not Allowed', description: 'Employers cannot apply for jobs.', variant: 'destructive' });
    }
  };

  const handleSaveToggle = async () => {
    if (!job) return;
     if (!user || user.role !== 'jobSeeker') {
      toast({ title: "Login Required", description: "Please log in as a job seeker to save jobs.", variant: "destructive" });
      return;
    }
    if (saved) {
      await unsaveJob(job.id);
      setSaved(false);
      toast({ title: "Job Unsaved", description: `${job.title} removed from your saved jobs.` });
    } else {
      await saveJob(job.id);
      setSaved(true);
      toast({ title: "Job Saved!", description: `${job.title} added to your saved jobs.` });
    }
  };

  const handleShare = () => {
    if(!job) return;
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link Copied!', description: 'Job link copied to clipboard.' });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Job</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-xl text-muted-foreground">Job not found.</p>
      </div>
    );
  }

  const companyLogo = job.companyLogoUrl || `https://placehold.co/128x128.png?text=${job.company?.substring(0,2).toUpperCase() || 'C'}`;
  const salaryDisplay = job.salaryMin && job.salaryMax ?
    `${formatCurrencyINR(job.salaryMin)} - ${formatCurrencyINR(job.salaryMax)} p.a.` :
    (job.salaryMin ? `${formatCurrencyINR(job.salaryMin)} p.a.` : (job.salaryMax ? `${formatCurrencyINR(job.salaryMax)} p.a.` : 'Not Disclosed'));

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="shadow-xl">
        <CardHeader className="bg-muted/30 p-6 rounded-t-lg">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Image
              src={companyLogo}
              alt={`${job.company} logo`}
              width={100}
              height={100}
              className="rounded-lg border-2 border-primary/20 object-contain p-1 bg-background"
              data-ai-hint="company logo"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold font-headline text-primary mb-1">{job.title}</h1>
              <div className="flex items-center gap-2 text-lg text-foreground mb-1">
                <Building className="h-5 w-5 text-muted-foreground" />
                {job.companyId ? (
                  <Link href={`/companies/${job.companyId}`} className="hover:underline">
                    {job.company}
                  </Link>
                ) : (
                  <span>{job.company}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
                {job.isRemote && <Badge variant="outline" className="ml-2">Remote</Badge>}
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary" className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />{job.type}</Badge>
                {(job.salaryMin || job.salaryMax) && (
                  <Badge variant="secondary" className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" />{salaryDisplay}</Badge>
                )}
                 <Badge variant="secondary" className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Posted: {new Date(job.postedDate as string).toLocaleDateString()}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3 font-headline">Job Description</h2>
                <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
                  {job.description}
                </div>
              </section>

              {job.skills && job.skills.length > 0 && (
                <section>
                  <Separator className="my-6" />
                  <h2 className="text-xl font-semibold mb-3 font-headline">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(skill => (
                      <Badge key={skill} variant="default" className="text-sm px-3 py-1">{skill}</Badge>
                    ))}
                  </div>
                </section>
              )}
            </div>
            <aside className="w-full sm:w-64 space-y-4">
               {user && user.role === 'jobSeeker' && (
                applied ? (
                    <Button size="lg" disabled variant="outline" className="w-full text-green-600 border-green-600">
                        <CheckCircle className="mr-2 h-5 w-5" /> Applied
                    </Button>
                ) : (
                    <Button size="lg" onClick={handleApply} className="w-full">
                        Apply Now <ExternalLink className="ml-2 h-5 w-5" />
                    </Button>
                )
               )}
               {!user && ( // For non-logged in users
                  <Button size="lg" onClick={handleApply} className="w-full">
                      Apply Now <ExternalLink className="ml-2 h-5 w-5" />
                  </Button>
               )}
                <Button variant="outline" size="lg" onClick={handleSaveToggle} className="w-full">
                    <Bookmark className={`mr-2 h-5 w-5 ${saved ? 'fill-primary text-primary' : ''}`} />
                    {saved ? 'Job Saved' : 'Save Job'}
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare} className="w-full">
                    <Share2 className="mr-2 h-5 w-5" /> Share Job
                </Button>
            </aside>
          </div>
        </CardContent>
        <CardFooter className="p-6 border-t bg-muted/20 rounded-b-lg">
           <p className="text-xs text-muted-foreground">Job ID: {job.id}. If you encounter any issues applying, please contact the company directly.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
