
"use client";
import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Job, ParsedJobData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, FileText, Sparkles, Send } from 'lucide-react';
import { parseJobDescriptionFlow } from '@/ai/flows/parse-job-description-flow'; // Assuming this flow exists

export function PostJobForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobData, setJobData] = useState<Partial<Job>>({
    title: '',
    company: user?.role === 'employer' ? user.name : '',
    location: '',
    type: 'Full-time',
    description: '',
    skills: [],
    salaryMin: undefined,
    salaryMax: undefined,
    isRemote: false,
    postedById: user?.id,
    companyLogoUrl: user?.role === 'employer' ? user.avatarUrl : undefined,
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setJobData(prev => ({ ...prev, [name]: value as Job['type'] }));
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
        
        // Update form fields with parsed data
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
        if (parsedData.skills && parsedData.skills.length > 0) {
            setSkillsInput(parsedData.skills.join(', '));
        }
        toast({ title: "Document Parsed", description: "Job details have been pre-filled from the document." });
      };
      reader.onerror = () => {
        toast({ title: "File Reading Error", description: "Could not read the selected file.", variant: "destructive" });
      };
    } catch (error) {
      console.error("Error parsing job description:", error);
      toast({ title: "Parsing Error", description: "Could not parse job details from the document.", variant: "destructive" });
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'employer') {
        toast({ title: "Unauthorized", description: "Only employers can post jobs.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    // Simulate API call to save job
    await new Promise(resolve => setTimeout(resolve, 1500));

    const finalJobData: Job = {
        id: `job-${Date.now()}`, // Generate a mock ID
        ...jobData,
        postedDate: new Date().toISOString().split('T')[0], // Set current date
        postedById: user.id,
        company: user.name, // Employer's name from profile
        companyLogoUrl: user.avatarUrl,
    } as Job; // Type assertion as we're building it piece by piece

    console.log("Submitting Job:", finalJobData); 
    // In a real app, you'd send this to your backend
    // For now, perhaps add to a global state or localStorage for mockJobs if you want to see it listed

    setIsSubmitting(false);
    toast({
      title: 'Job Posted!',
      description: `${finalJobData.title} has been successfully posted.`,
    });
    // Optionally reset form or redirect
    setJobData({ title: '', company: user.name, location: '', type: 'Full-time', description: '', skills: [], isRemote: false, postedById: user.id, companyLogoUrl: user.avatarUrl });
    setSkillsInput('');
    setFile(null);
  };

  if (!user || user.role !== 'employer') {
    return (
      <Card>
        <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
        <CardContent><p>You must be logged in as an employer to post a job.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Job Details</CardTitle>
        <CardDescription>
          Provide the specifics for the job opening. You can also upload a document (e.g., PDF, DOCX) 
          and our AI will try to parse and pre-fill the fields for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4 p-4 border rounded-md bg-muted/20">
            <Label htmlFor="jobDescriptionFile" className="text-base font-semibold">AI-Powered Parsing</Label>
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
              <Select value={jobData.type || 'Full-time'} onValueChange={(value) => handleSelectChange('type', value)}>
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
          
          <Button type="submit" disabled={isSubmitting || isParsing} className="w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Post Job Opening
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
