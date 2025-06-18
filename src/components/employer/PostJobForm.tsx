
"use client";
import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import type { Job, ParsedJobData, Company } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Sparkles, Send, Edit } from 'lucide-react';
import { parseJobDescriptionFlow } from '@/ai/flows/parse-job-description-flow';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, serverTimestamp, doc, getDoc, Timestamp } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge'; // Added Badge

export function PostJobForm() {
  const { user, company: authCompany } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingJobId = searchParams.get('edit');

  const initialJobData: Partial<Job> = {
    type: 'Full-time',
    isRemote: false,
    applicantIds: [],
    status: 'pending', // Default status for new jobs
  };

  const [jobData, setJobData] = useState<Partial<Job>>(initialJobData);
  const [skillsInput, setSkillsInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [currentCompanyDetails, setCurrentCompanyDetails] = useState<Partial<Company>>({});

  useEffect(() => {
    const initializeForm = async () => {
      let companyDataToUse: Company | null = null;
      if (user && user.role === 'employer' && user.companyId) {
        if (authCompany) {
          companyDataToUse = authCompany;
        } else {
          const companyDocRef = doc(db, "companies", user.companyId);
          const companyDocSnap = await getDoc(companyDocRef);
          if (companyDocSnap.exists()) {
            companyDataToUse = { id: companyDocSnap.id, ...companyDocSnap.data() } as Company;
          } else {
            toast({ title: "Error", description: "Could not load your company details.", variant: "destructive"});
            return;
          }
        }

        if (companyDataToUse) {
          setCurrentCompanyDetails(companyDataToUse);
          setJobData(prev => ({
            ...prev,
            companyId: companyDataToUse!.id,
            company: companyDataToUse!.name,
            companyLogoUrl: companyDataToUse!.logoUrl,
            postedById: user.uid,
          }));
        }
      }

      if (editingJobId) {
        setIsLoadingJob(true);
        const jobDocRef = doc(db, "jobs", editingJobId);
        const jobDocSnap = await getDoc(jobDocRef);
        if (jobDocSnap.exists()) {
          const existingJob = jobDocSnap.data() as Job;
          if (user && existingJob.postedById !== user.uid && existingJob.companyId !== user.companyId) {
             toast({ title: "Unauthorized", description: "You cannot edit this job.", variant: "destructive" });
             router.push('/employer/posted-jobs');
             setIsLoadingJob(false);
             return;
          }
          setJobData({
            ...existingJob,
            postedDate: existingJob.postedDate instanceof Timestamp ? existingJob.postedDate.toDate().toISOString().split('T')[0] : existingJob.postedDate,
          });
          setSkillsInput((existingJob.skills || []).join(', '));
        } else {
          toast({ title: "Error", description: "Job to edit not found.", variant: "destructive" });
          router.push('/employer/posted-jobs');
        }
        setIsLoadingJob(false);
      } else {
        // For new jobs, ensure status is pending
        setJobData(prev => ({ ...prev, status: 'pending' }));
      }
    };
    initializeForm();
  }, [user, authCompany, editingJobId, router, toast]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setJobData(prev => ({ ...prev, [name]: checked }));
    } else {
        setJobData(prev => ({ ...prev, [name]: (name === 'salaryMin' || name === 'salaryMax') && value ? parseFloat(value) : value }));
    }
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSkillsInput(val);
    setJobData(prev => ({ ...prev, skills: val.split(',').map(skill => skill.trim()).filter(skill => skill) }));
  };

  const handleSelectChange = (name: keyof Job, value: string) => {
    setJobData(prev => ({ ...prev, [name]: value as Job['type'] })); // Assuming 'type' is the only select for Job
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleParseDocument = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a job description document to parse.", variant: "destructive" });
      return;
    }
    setIsParsing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        const parsedData: ParsedJobData = await parseJobDescriptionFlow({ jobDescriptionDataUri: dataUri });

        if (parsedData.description && parsedData.description.startsWith("Parsing Error:")) {
            toast({
                title: "Document Parsing Issue",
                description: parsedData.description,
                variant: "destructive",
                duration: 9000,
            });
             setJobData(prev => ({
              ...prev,
              title: parsedData.title || prev.title,
              skills: parsedData.skills || prev.skills,
              location: parsedData.location || prev.location,
              type: parsedData.jobType || prev.type,
              salaryMin: parsedData.salaryMin || prev.salaryMin,
              salaryMax: parsedData.salaryMax || prev.salaryMax,
            }));
        } else {
            setJobData(prev => ({
              ...prev,
              title: parsedData.title || prev.title,
              description: parsedData.description || prev.description,
              skills: parsedData.skills || prev.skills,
              location: parsedData.location || prev.location,
              type: parsedData.jobType || prev.type,
              salaryMin: parsedData.salaryMin || prev.salaryMin,
              salaryMax: parsedData.salaryMax || prev.salaryMax,
            }));
            toast({ title: "Document Parsed", description: "Job details have been pre-filled from the document." });
        }

        if (parsedData.skills && parsedData.skills.length > 0) {
            setSkillsInput(parsedData.skills.join(', '));
        }
        setFile(null);
      };
      reader.onerror = () => {
        toast({ title: "File Reading Error", description: "Could not read the selected file.", variant: "destructive" });
      };
    } catch (error) {
      console.error("Error parsing job description:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during parsing."
      toast({ title: "Parsing Error", description: `Could not parse job details. ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'employer' || !user.uid || !user.companyId) {
        toast({ title: "Unauthorized", description: "Only authenticated employers with a company can post jobs.", variant: "destructive" });
        return;
    }
    if (!jobData.title || !jobData.description) {
        toast({ title: "Missing Fields", description: "Job title and description are required.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);

    try {
        const jobPayload: Partial<Job> = {
            title: jobData.title || '',
            company: currentCompanyDetails.name || 'N/A Company',
            companyId: user.companyId,
            location: jobData.location || '',
            type: jobData.type || 'Full-time',
            description: jobData.description || '',
            isRemote: jobData.isRemote || false,
            skills: jobData.skills || [],
            salaryMin: jobData.salaryMin,
            salaryMax: jobData.salaryMax,
            companyLogoUrl: currentCompanyDetails.logoUrl,
            postedById: user.uid,
            updatedAt: serverTimestamp(),
        };

        if (editingJobId) {
            const jobDocRef = doc(db, "jobs", editingJobId);
            // When editing, the status is reset to 'pending' to trigger re-moderation by admin.
            jobPayload.status = 'pending';
            jobPayload.moderationReason = undefined; // Clear previous moderation reason
            await updateDoc(jobDocRef, jobPayload);
            toast({ title: 'Job Updated & Resubmitted for Approval!', description: `${jobData.title} has been updated and sent for review.` });
        } else {
            jobPayload.postedDate = new Date().toISOString().split('T')[0];
            jobPayload.applicantIds = [];
            jobPayload.createdAt = serverTimestamp();
            jobPayload.status = 'pending'; // New jobs are pending approval
            const jobsCollectionRef = collection(db, "jobs");
            await addDoc(jobsCollectionRef, jobPayload);
            toast({ title: 'Job Submitted for Approval!', description: `${jobData.title} has been submitted and is pending review.` });
        }
        
        if (!editingJobId) {
           setJobData({
                ...initialJobData, // Reset to initial with pending status
                company: currentCompanyDetails.name, companyId: user.companyId,
                companyLogoUrl: currentCompanyDetails.logoUrl, postedById: user.uid,
            });
            setSkillsInput('');
            setFile(null);
        }
        router.push('/employer/posted-jobs');

    } catch (error) {
        console.error("Error saving job:", error);
        toast({ title: editingJobId ? "Job Update Failed" : "Job Posting Failed", description: "Could not save the job. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoadingJob) {
    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-headline">Loading Job Details...</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
    );
  }


  if (!user || user.role !== 'employer') {
    return (
      <Card>
        <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
        <CardContent><p>You must be logged in as an employer to post or edit a job.</p></CardContent>
      </Card>
    );
  }
   if (!user.companyId && !authCompany) {
    return (
      <Card>
        <CardHeader><CardTitle>Company Not Set</CardTitle></CardHeader>
        <CardContent>
            <p>Your employer account is not yet associated with a company, or company details are still loading.</p>
            <p className="mt-2">Please ensure your company profile is complete. You may need to re-login or contact support if this persists.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">
            {editingJobId ? "Edit Job Opening" : "Post New Job"} for {currentCompanyDetails.name || "Your Company"}
        </CardTitle>
        {!editingJobId && (
            <CardDescription>
            Provide the specifics for the job opening. New jobs will be submitted for admin approval. You can also upload a document (e.g., PDF, DOCX, TXT)
            and our AI will try to parse and pre-fill the fields for you. Plain text (.txt) files yield the best results for AI parsing.
            </CardDescription>
        )}
         {editingJobId && jobData.status && (
            <div className="pt-2">
              <p className="text-sm font-medium">Current Status: <Badge variant={jobData.status === 'approved' ? 'default' : jobData.status === 'rejected' ? 'destructive' : 'secondary'}>{jobData.status.toUpperCase()}</Badge></p>
              {jobData.status === 'rejected' && jobData.moderationReason && <p className="text-xs text-destructive mt-1">Admin Reason: {jobData.moderationReason}</p>}
              <p className="text-xs text-muted-foreground mt-1">Editing and saving this job will resubmit it for admin approval (status will become 'pending').</p>
            </div>
          )}
      </CardHeader>
      <CardContent className="space-y-8">
        {!editingJobId && (
          <div className="space-y-4 p-4 border rounded-md bg-muted/20">
              <Label htmlFor="jobDescriptionFile" className="text-base font-semibold">AI-Powered Parsing (Optional)</Label>
              <div className="flex items-center justify-center w-full">
              <label
                  htmlFor="jobDescriptionFile"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/40 transition-colors"
              >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-2 text-primary" />
                  <p className="mb-1 text-sm text-foreground/80">
                      <span className="font-semibold">Click to upload job description</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX, TXT (MAX. 2MB)</p>
                  </div>
                  <Input id="jobDescriptionFile" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
              </label>
              </div>
              {file && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Selected file: {file.name}</span>
                      <Button type="button" size="sm" onClick={handleParseDocument} disabled={isParsing || !file}>
                          {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                          Parse Document
                      </Button>
                  </div>
              )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" name="title" value={jobData.title || ''} onChange={handleChange} required placeholder="e.g., Senior Software Engineer"/>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={jobData.location || ''} onChange={handleChange} placeholder="e.g., San Francisco, CA or Remote"/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="type">Job Type</Label>
              <Select value={jobData.type || 'Full-time'} onValueChange={(value) => handleSelectChange('type', value as Job['type'])}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                    id="isRemote"
                    name="isRemote"
                    checked={jobData.isRemote}
                    onCheckedChange={(checked) => setJobData(prev => ({...prev, isRemote: Boolean(checked)}))}
                />
                <Label htmlFor="isRemote" className="font-medium">
                    This job is remote
                </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="skills">Required Skills (comma-separated)</Label>
            <Input
              id="skills"
              name="skills"
              value={skillsInput}
              onChange={handleSkillsChange}
              placeholder="e.g., React, Node.js, Project Management"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="salaryMin">Salary Minimum (Annual, Optional)</Label>
              <Input id="salaryMin" name="salaryMin" type="number" placeholder="e.g., 80000" value={jobData.salaryMin || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="salaryMax">Salary Maximum (Annual, Optional)</Label>
              <Input id="salaryMax" name="salaryMax" type="number" placeholder="e.g., 120000" value={jobData.salaryMax || ''} onChange={handleChange} />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              name="description"
              value={jobData.description || ''}
              onChange={handleChange}
              rows={12}
              placeholder="Provide a detailed job description, responsibilities, and qualifications..."
              required
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting || isParsing || !user?.uid || !user.companyId} className="w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingJobId ? <Edit className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />)}
            {editingJobId ? "Update & Resubmit Job" : "Submit Job for Approval"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
