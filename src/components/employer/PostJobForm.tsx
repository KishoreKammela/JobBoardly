'use client';
import React, {
  useState,
  type ChangeEvent,
  type FormEvent,
  useEffect,
} from 'react';
import type {
  Job,
  ParsedJobData,
  Company,
  ScreeningQuestion,
  ScreeningQuestionType,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  UploadCloud,
  Sparkles,
  Send,
  Edit,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { parseJobDescriptionFlow } from '@/ai/flows/parse-job-description-flow';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyINR } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { v4 as uuidv4 } from 'uuid';

const initialJobDataState: Partial<Job> = {
  type: 'Full-time',
  isRemote: false,
  status: 'pending',
  salaryMin: undefined,
  salaryMax: undefined,
  screeningQuestions: [],
};

interface ModalState {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  onConfirmAction: (() => Promise<void>) | null;
  confirmText: string;
}

const defaultModalState: ModalState = {
  isOpen: false,
  title: '',
  description: '',
  onConfirmAction: null,
  confirmText: 'Confirm',
};

export function PostJobForm() {
  const { user, company: authCompany } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingJobId = searchParams.get('edit');

  const [jobData, setJobData] = useState<Partial<Job>>(initialJobDataState);
  const [skillsInput, setSkillsInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [currentCompanyDetails, setCurrentCompanyDetails] = useState<
    Partial<Company>
  >({});
  const [modalState, setModalState] = useState<ModalState>(defaultModalState);
  const [isModalActionLoading, setIsModalActionLoading] = useState(false);

  useEffect(() => {
    const initializeForm = async () => {
      let companyDataToUse: Company | null = null;
      if (user && user.role === 'employer' && user.companyId) {
        if (authCompany) {
          companyDataToUse = authCompany;
        } else {
          const companyDocRef = doc(db, 'companies', user.companyId);
          const companyDocSnap = await getDoc(companyDocRef);
          if (companyDocSnap.exists()) {
            companyDataToUse = {
              id: companyDocSnap.id,
              ...companyDocSnap.data(),
            } as Company;
          } else {
            toast({
              title: 'Error',
              description: 'Could not load your company details.',
              variant: 'destructive',
            });
            return;
          }
        }

        if (companyDataToUse) {
          setCurrentCompanyDetails(companyDataToUse);
          setJobData((prev) => ({
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
        const jobDocRef = doc(db, 'jobs', editingJobId);
        const jobDocSnap = await getDoc(jobDocRef);
        if (jobDocSnap.exists()) {
          const existingJob = jobDocSnap.data() as Job;
          if (
            user &&
            existingJob.postedById !== user.uid &&
            existingJob.companyId !== user.companyId
          ) {
            toast({
              title: 'Unauthorized',
              description: 'You cannot edit this job.',
              variant: 'destructive',
            });
            router.push('/employer/posted-jobs');
            setIsLoadingJob(false);
            return;
          }
          setJobData({
            ...existingJob,
            postedDate:
              existingJob.postedDate instanceof Timestamp
                ? existingJob.postedDate.toDate().toISOString().split('T')[0]
                : (existingJob.postedDate as string),
            salaryMin:
              existingJob.salaryMin === null ||
              existingJob.salaryMin === undefined
                ? undefined
                : existingJob.salaryMin,
            salaryMax:
              existingJob.salaryMax === null ||
              existingJob.salaryMax === undefined
                ? undefined
                : existingJob.salaryMax,
            screeningQuestions: (existingJob.screeningQuestions || []).map(
              (q) => ({ ...q, id: q.id || uuidv4() })
            ),
          });
          setSkillsInput((existingJob.skills || []).join(', '));
        } else {
          toast({
            title: 'Error',
            description: 'Job to edit not found.',
            variant: 'destructive',
          });
          router.push('/employer/posted-jobs');
        }
        setIsLoadingJob(false);
      } else {
        setJobData((prev) => ({
          ...initialJobDataState,
          ...prev,
          screeningQuestions: [],
          status: 'pending',
        }));
      }
    };
    initializeForm();
  }, [user, authCompany, editingJobId, router, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setJobData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setJobData((prev) => {
        let newValue: string | number | undefined = value;
        if (name === 'salaryMin' || name === 'salaryMax') {
          newValue = value === '' ? undefined : parseFloat(value);
          if (isNaN(newValue as number)) newValue = undefined;
        }
        return { ...prev, [name]: newValue };
      });
    }
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSkillsInput(val);
    setJobData((prev) => ({
      ...prev,
      skills: val
        .split(',')
        .map((skill) => skill.trim())
        .filter((skill) => skill),
    }));
  };

  const handleSelectChange = (name: keyof Job, value: string) => {
    setJobData((prev) => ({ ...prev, [name]: value as Job['type'] }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleParseDocument = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a job description document to parse.',
        variant: 'destructive',
      });
      return;
    }
    setIsParsing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        const parsedData: ParsedJobData = await parseJobDescriptionFlow({
          jobDescriptionDataUri: dataUri,
        });

        if (
          parsedData.description &&
          parsedData.description.startsWith('Parsing Error:')
        ) {
          toast({
            title: 'Document Parsing Issue',
            description: parsedData.description,
            variant: 'destructive',
            duration: 9000,
          });
          setJobData((prev) => ({
            ...prev,
            title: parsedData.title || prev.title,
            skills: parsedData.skills || prev.skills,
            location: parsedData.location || prev.location,
            type: parsedData.jobType || prev.type,
            salaryMin: parsedData.salaryMin ?? prev.salaryMin,
            salaryMax: parsedData.salaryMax ?? prev.salaryMax,
          }));
        } else {
          setJobData((prev) => ({
            ...prev,
            title: parsedData.title || prev.title,
            description: parsedData.description || prev.description,
            skills: parsedData.skills || prev.skills,
            location: parsedData.location || prev.location,
            type: parsedData.jobType || prev.type,
            salaryMin: parsedData.salaryMin ?? prev.salaryMin,
            salaryMax: parsedData.salaryMax ?? prev.salaryMax,
          }));
          toast({
            title: 'Document Parsed',
            description: 'Job details have been pre-filled from the document.',
          });
        }

        if (parsedData.skills && parsedData.skills.length > 0) {
          setSkillsInput(parsedData.skills.join(', '));
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
    } catch (error: unknown) {
      console.error('Error parsing job description:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during parsing.';
      toast({
        title: 'Parsing Error',
        description: `Could not parse job details. ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const showConfirmationModal = (
    title: string,
    description: React.ReactNode,
    action: () => Promise<void>,
    confirmText = 'Confirm'
  ) => {
    setModalState({
      isOpen: true,
      title,
      description,
      onConfirmAction: action,
      confirmText,
    });
  };

  const executeConfirmedAction = async () => {
    if (modalState.onConfirmAction) {
      setIsModalActionLoading(true);
      try {
        await modalState.onConfirmAction();
      } catch (e: unknown) {
        // Errors handled in performSaveJob
      } finally {
        setIsModalActionLoading(false);
        setModalState(defaultModalState);
      }
    }
  };

  const performSaveJob = async () => {
    if (!user || user.role !== 'employer' || !user.uid || !user.companyId) {
      toast({
        title: 'Unauthorized',
        description:
          'Only authenticated employers with a company can post jobs.',
        variant: 'destructive',
      });
      return;
    }
    if (!jobData.title || !jobData.description) {
      toast({
        title: 'Missing Fields',
        description: 'Job title and description are required.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const jobPayloadForFirestore: Record<string, unknown> = {
        title: jobData.title || '',
        company: currentCompanyDetails.name || 'N/A Company',
        companyId: user.companyId,
        location: jobData.location || '',
        type: jobData.type || 'Full-time',
        description: jobData.description || '',
        isRemote: jobData.isRemote || false,
        skills: jobData.skills || [],
        salaryMin: jobData.salaryMin === undefined ? null : jobData.salaryMin,
        salaryMax: jobData.salaryMax === undefined ? null : jobData.salaryMax,
        companyLogoUrl: currentCompanyDetails.logoUrl || null,
        postedById: user.uid,
        updatedAt: serverTimestamp(),
        status: 'pending',
        moderationReason: null,
        screeningQuestions: (jobData.screeningQuestions || []).filter(
          (q) => q.questionText.trim() !== ''
        ),
      };

      if (editingJobId) {
        const jobDocRef = doc(db, 'jobs', editingJobId);
        await updateDoc(jobDocRef, jobPayloadForFirestore);
        toast({
          title: 'Job Updated & Resubmitted for Approval!',
          description: `${jobData.title} has been updated and sent for review.`,
        });
      } else {
        jobPayloadForFirestore.postedDate = new Date()
          .toISOString()
          .split('T')[0];
        jobPayloadForFirestore.createdAt = serverTimestamp();
        const jobsCollectionRef = collection(db, 'jobs');
        await addDoc(jobsCollectionRef, jobPayloadForFirestore);
        toast({
          title: 'Job Submitted for Approval!',
          description: `${jobData.title} has been submitted and is pending review.`,
        });
      }

      if (!editingJobId) {
        setJobData({
          ...initialJobDataState,
          company: currentCompanyDetails.name,
          companyId: user.companyId,
          companyLogoUrl: currentCompanyDetails.logoUrl,
          postedById: user.uid,
          screeningQuestions: [],
        });
        setSkillsInput('');
        setFile(null);
      }
      router.push('/employer/posted-jobs');
    } catch (error: unknown) {
      console.error('Error saving job:', error);
      toast({
        title: editingJobId ? 'Job Update Failed' : 'Job Posting Failed',
        description: `Could not save the job. Error: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddScreeningQuestion = () => {
    setJobData((prev) => ({
      ...prev,
      screeningQuestions: [
        ...(prev.screeningQuestions || []),
        { id: uuidv4(), questionText: '', type: 'text', isRequired: false },
      ],
    }));
  };

  const handleScreeningQuestionChange = (
    index: number,
    field: keyof ScreeningQuestion,
    value: string | boolean
  ) => {
    setJobData((prev) => {
      const updatedQuestions = [...(prev.screeningQuestions || [])];
      if (updatedQuestions[index]) {
        (updatedQuestions[index] as any)[field] = value;
      }
      return { ...prev, screeningQuestions: updatedQuestions };
    });
  };

  const handleRemoveScreeningQuestion = (id: string) => {
    setJobData((prev) => ({
      ...prev,
      screeningQuestions: (prev.screeningQuestions || []).filter(
        (q) => q.id !== id
      ),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const modalTitle = editingJobId
      ? 'Confirm Job Update'
      : 'Confirm Job Submission';
    const modalDescription = editingJobId
      ? 'Are you sure you want to update this job? It will be resubmitted for admin approval.'
      : 'Are you sure you want to submit this job? It will be sent for admin approval.';
    const modalConfirmText = editingJobId
      ? 'Update & Resubmit'
      : 'Submit for Approval';

    showConfirmationModal(
      modalTitle,
      modalDescription,
      performSaveJob,
      modalConfirmText
    );
  };

  if (isLoadingJob) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">
            Loading Job Details...
          </CardTitle>
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
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You must be logged in as an employer to post or edit a job.</p>
        </CardContent>
      </Card>
    );
  }
  if (!user.companyId && !authCompany && !currentCompanyDetails.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Not Set</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Your employer account is not yet associated with a company, or
            company details are still loading.
          </p>
          <p className="mt-2">
            Please ensure your company profile is complete. You may need to
            re-login or contact support if this persists.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">
            {editingJobId ? 'Edit Job Opening' : 'Post New Job'} for{' '}
            {currentCompanyDetails.name || 'Your Company'}
          </CardTitle>
          {!editingJobId && (
            <CardDescription>
              Provide the specifics for the job opening. New jobs will be
              submitted for admin approval. You can also upload a document
              (e.g., PDF, DOCX, TXT) and our AI will try to parse and pre-fill
              the fields for you. Plain text (.txt) files yield the best results
              for AI parsing.
            </CardDescription>
          )}
          {editingJobId && jobData.status && (
            <div className="pt-2">
              <p className="text-sm font-medium">
                Current Status:{' '}
                <Badge
                  variant={
                    jobData.status === 'approved'
                      ? 'default'
                      : jobData.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {jobData.status.toUpperCase()}
                </Badge>
              </p>
              {jobData.status === 'rejected' && jobData.moderationReason && (
                <p className="text-xs text-destructive mt-1">
                  Rejection Reason: {jobData.moderationReason}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Editing and saving this job will resubmit it for admin approval
                (status will become &apos;pending&apos;).
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          {!editingJobId && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/20">
              <Label
                htmlFor="jobDescriptionFile"
                className="text-base font-semibold"
              >
                AI-Powered Parsing (Optional)
              </Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="jobDescriptionFile"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/40 transition-colors"
                  aria-label="Upload job description file area"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 text-primary" />
                    <p className="mb-1 text-sm text-foreground/80">
                      <span className="font-semibold">
                        Click to upload job description
                      </span>{' '}
                      or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOCX, TXT (MAX. 2MB)
                    </p>
                  </div>
                  <Input
                    id="jobDescriptionFile"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </label>
              </div>
              {file && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Selected file: {file.name}</span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleParseDocument}
                    disabled={isParsing || !file}
                    aria-label="Parse uploaded document"
                  >
                    {isParsing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
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
                <Input
                  id="title"
                  name="title"
                  value={jobData.title || ''}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Senior Software Engineer"
                  aria-label="Job Title"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={jobData.location || ''}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco, CA or Remote"
                  aria-label="Job Location"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="type">Job Type</Label>
                <Select
                  value={jobData.type || 'Full-time'}
                  onValueChange={(value) =>
                    handleSelectChange('type', value as Job['type'])
                  }
                >
                  <SelectTrigger id="type" aria-label="Select job type">
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
                  checked={jobData.isRemote || false}
                  onCheckedChange={(checked) =>
                    setJobData((prev) => ({
                      ...prev,
                      isRemote: Boolean(checked),
                    }))
                  }
                  aria-labelledby="isRemoteLabel"
                />
                <Label
                  htmlFor="isRemote"
                  className="font-medium"
                  id="isRemoteLabel"
                >
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
                aria-label="Required Skills"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="salaryMin">
                  Salary Minimum (Annual INR, Optional)
                </Label>
                <Input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  placeholder="e.g., 800000"
                  value={
                    jobData.salaryMin === undefined ? '' : jobData.salaryMin
                  }
                  onChange={handleChange}
                  aria-label="Minimum Salary"
                />
                {jobData.salaryMin !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatted: {formatCurrencyINR(jobData.salaryMin)}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="salaryMax">
                  Salary Maximum (Annual INR, Optional)
                </Label>
                <Input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  placeholder="e.g., 1200000"
                  value={
                    jobData.salaryMax === undefined ? '' : jobData.salaryMax
                  }
                  onChange={handleChange}
                  aria-label="Maximum Salary"
                />
                {jobData.salaryMax !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatted: {formatCurrencyINR(jobData.salaryMax)}
                  </p>
                )}
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
                aria-label="Job Description"
              />
            </div>

            {/* Screening Questions Section */}
            <div className="space-y-4 p-4 border rounded-md bg-muted/20">
              <h3 className="text-lg font-semibold">
                Screening Questions (Optional)
              </h3>
              {(jobData.screeningQuestions || []).map((q, index) => (
                <Card key={q.id} className="p-3 bg-background">
                  <div className="space-y-2">
                    <Label htmlFor={`sq-text-${q.id}`}>
                      Question {index + 1}
                    </Label>
                    <Input
                      id={`sq-text-${q.id}`}
                      value={q.questionText}
                      onChange={(e) =>
                        handleScreeningQuestionChange(
                          index,
                          'questionText',
                          e.target.value
                        )
                      }
                      placeholder="Enter question text"
                    />
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <div>
                        <Label htmlFor={`sq-type-${q.id}`}>Type</Label>
                        <Select
                          value={q.type}
                          onValueChange={(value) =>
                            handleScreeningQuestionChange(
                              index,
                              'type',
                              value as ScreeningQuestionType
                            )
                          }
                        >
                          <SelectTrigger id={`sq-type-${q.id}`}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Input</SelectItem>
                            <SelectItem value="yesNo">Yes/No</SelectItem>
                            {/* TODO: Add UI for options for these types */}
                            {/* <SelectItem value="multipleChoice">Multiple Choice</SelectItem> */}
                            {/* <SelectItem value="checkboxGroup">Checkbox Group</SelectItem> */}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id={`sq-required-${q.id}`}
                          checked={q.isRequired}
                          onCheckedChange={(checked) =>
                            handleScreeningQuestionChange(
                              index,
                              'isRequired',
                              Boolean(checked)
                            )
                          }
                        />
                        <Label htmlFor={`sq-required-${q.id}`}>Required</Label>
                      </div>
                    </div>
                    {/* Placeholder for options input if type is multipleChoice or checkboxGroup */}
                    {(q.type === 'multipleChoice' ||
                      q.type === 'checkboxGroup') && (
                      <div className="mt-2">
                        <Label htmlFor={`sq-options-${q.id}`}>
                          Options (comma-separated)
                        </Label>
                        <Input
                          id={`sq-options-${q.id}`}
                          value={(q.options || []).join(', ')}
                          onChange={(e) =>
                            handleScreeningQuestionChange(
                              index,
                              'options',
                              e.target.value.split(',').map((opt) => opt.trim())
                            )
                          }
                          placeholder="e.g., Option 1, Option 2, Option 3"
                          disabled // TODO: Enable when MC/Checkbox UI is fully implemented
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Multiple Choice/Checkbox options UI is not yet fully
                          implemented.
                        </p>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveScreeningQuestion(q.id)}
                      className="text-destructive hover:text-destructive flex items-center gap-1 text-xs mt-1"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </Button>
                  </div>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddScreeningQuestion}
                className="text-sm"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Screening Question
              </Button>
            </div>

            <Button
              type="submit"
              disabled={
                isSubmitting || isParsing || !user?.uid || !user.companyId
              }
              className="w-full sm:w-auto"
              aria-label={
                editingJobId
                  ? 'Update and Resubmit Job'
                  : 'Submit Job for Approval'
              }
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : editingJobId ? (
                <Edit className="mr-2 h-4 w-4" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {editingJobId
                ? 'Update & Resubmit Job'
                : 'Submit Job for Approval'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <AlertDialog
        open={modalState.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setModalState(defaultModalState);
            setIsModalActionLoading(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{modalState.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {modalState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setModalState({ ...modalState, isOpen: false })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeConfirmedAction}
              disabled={isModalActionLoading}
            >
              {isModalActionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {modalState.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
