// src/components/employer/PostJobForm.tsx
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
  JobExperienceLevel,
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
import { useAuth } from '@/contexts/Auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  UploadCloud,
  Sparkles,
  Send,
  Edit,
  PlusCircle,
  Trash2,
  CalendarDays,
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parse, isValid } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const initialJobDataState: Partial<Job> = {
  type: 'Full-time',
  isRemote: false,
  status: 'pending',
  salaryMin: undefined,
  salaryMax: undefined,
  payTransparency: true,
  benefits: '', // Changed from []
  industry: '',
  department: '',
  experienceLevel: 'Entry-Level',
  minExperienceYears: undefined,
  maxExperienceYears: undefined,
  educationQualification: '',
  applicationDeadline: undefined,
  screeningQuestions: [],
  responsibilities: '', // Added
  requirements: '', // Added
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

const experienceLevelOptions: JobExperienceLevel[] = [
  'Entry-Level',
  'Mid-Level',
  'Senior-Level',
  'Lead',
  'Manager',
  'Executive',
];

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

  const appDeadlineDate =
    jobData.applicationDeadline &&
    typeof jobData.applicationDeadline === 'string' &&
    isValid(parse(jobData.applicationDeadline, 'yyyy-MM-dd', new Date()))
      ? parse(jobData.applicationDeadline, 'yyyy-MM-dd', new Date())
      : jobData.applicationDeadline instanceof Timestamp
        ? jobData.applicationDeadline.toDate()
        : undefined;

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
            ...initialJobDataState,
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
            applicationDeadline:
              existingJob.applicationDeadline instanceof Timestamp
                ? existingJob.applicationDeadline
                    .toDate()
                    .toISOString()
                    .split('T')[0]
                : (existingJob.applicationDeadline as string | undefined),
            screeningQuestions: (existingJob.screeningQuestions || []).map(
              (q) => ({ ...q, id: q.id || uuidv4() })
            ),
            payTransparency: existingJob.payTransparency ?? true,
            benefits: existingJob.benefits || '', // Ensure it's a string
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
        if (
          name === 'salaryMin' ||
          name === 'salaryMax' ||
          name === 'minExperienceYears' ||
          name === 'maxExperienceYears'
        ) {
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
    setJobData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (fieldName: keyof Job, date: Date | undefined) => {
    setJobData((prev) => ({
      ...prev,
      [fieldName]: date ? format(date, 'yyyy-MM-dd') : undefined,
    }));
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
          parsedData.responsibilities &&
          parsedData.responsibilities.startsWith('Parsing Error:')
        ) {
          toast({
            title: 'Document Parsing Issue',
            description: parsedData.responsibilities,
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
            industry: parsedData.industry || prev.industry,
            department: parsedData.department || prev.department,
            roleDesignation: parsedData.roleDesignation || prev.roleDesignation,
            experienceLevel: parsedData.experienceLevel || prev.experienceLevel,
            minExperienceYears:
              parsedData.minExperienceYears ?? prev.minExperienceYears,
            maxExperienceYears:
              parsedData.maxExperienceYears ?? prev.maxExperienceYears,
            educationQualification:
              parsedData.educationQualification || prev.educationQualification,
            applicationDeadline:
              parsedData.applicationDeadline || prev.applicationDeadline,
            payTransparency: parsedData.payTransparency ?? prev.payTransparency,
            benefits: parsedData.benefits || prev.benefits,
          }));
        } else {
          setJobData((prev) => ({
            ...prev,
            title: parsedData.title || prev.title,
            responsibilities:
              parsedData.responsibilities || prev.responsibilities,
            requirements: parsedData.requirements || prev.requirements,
            skills: parsedData.skills || prev.skills,
            location: parsedData.location || prev.location,
            type: parsedData.jobType || prev.type,
            salaryMin: parsedData.salaryMin ?? prev.salaryMin,
            salaryMax: parsedData.salaryMax ?? prev.salaryMax,
            industry: parsedData.industry || prev.industry,
            department: parsedData.department || prev.department,
            roleDesignation: parsedData.roleDesignation || prev.roleDesignation,
            experienceLevel:
              parsedData.experienceLevel ||
              prev.experienceLevel ||
              'Entry-Level',
            minExperienceYears:
              parsedData.minExperienceYears ?? prev.minExperienceYears,
            maxExperienceYears:
              parsedData.maxExperienceYears ?? prev.maxExperienceYears,
            educationQualification:
              parsedData.educationQualification || prev.educationQualification,
            applicationDeadline:
              parsedData.applicationDeadline || prev.applicationDeadline,
            payTransparency:
              parsedData.payTransparency ?? prev.payTransparency ?? true,
            benefits: parsedData.benefits || prev.benefits || '',
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
    if (
      !jobData.title ||
      !jobData.responsibilities ||
      !jobData.requirements ||
      !jobData.industry ||
      !jobData.department ||
      !jobData.experienceLevel
    ) {
      toast({
        title: 'Missing Fields',
        description:
          'Job title, responsibilities, requirements, industry, department, and experience level are required.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const jobPayloadForFirestore: Record<string, unknown> = {
        title: jobData.title,
        company: currentCompanyDetails.name || 'N/A Company',
        companyId: user.companyId,
        location: jobData.location || '',
        type: jobData.type || 'Full-time',
        responsibilities: jobData.responsibilities,
        requirements: jobData.requirements,
        isRemote: jobData.isRemote || false,
        skills: jobData.skills || [],
        salaryMin: jobData.salaryMin === undefined ? null : jobData.salaryMin,
        salaryMax: jobData.salaryMax === undefined ? null : jobData.salaryMax,
        payTransparency: jobData.payTransparency ?? true,
        benefits: jobData.benefits || '',
        industry: jobData.industry,
        department: jobData.department,
        roleDesignation: jobData.roleDesignation || null,
        experienceLevel: jobData.experienceLevel,
        minExperienceYears:
          jobData.minExperienceYears === undefined
            ? null
            : jobData.minExperienceYears,
        maxExperienceYears:
          jobData.maxExperienceYears === undefined
            ? null
            : jobData.maxExperienceYears,
        educationQualification: jobData.educationQualification || null,
        applicationDeadline: jobData.applicationDeadline
          ? Timestamp.fromDate(new Date(jobData.applicationDeadline as string))
          : null,
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
        (updatedQuestions[index] as Record<string, unknown>)[field as string] =
          value;
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

  const handleFormSubmitWithConfirmation = async (e: FormEvent) => {
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
            {editingJobId ? 'Edit Job Opening' : 'Create Job Posting'} for{' '}
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
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/40 transition-colors`}
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

          <form
            onSubmit={handleFormSubmitWithConfirmation}
            className="space-y-6"
          >
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Core Job Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">
                Job Responsibilities & Requirements
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="responsibilities">Responsibilities *</Label>
                  <Textarea
                    id="responsibilities"
                    name="responsibilities"
                    value={jobData.responsibilities || ''}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Detail the key responsibilities and day-to-day tasks..."
                    required
                    aria-label="Job Responsibilities"
                  />
                </div>
                <div>
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    value={jobData.requirements || ''}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Outline the necessary qualifications, skills, and experience..."
                    required
                    aria-label="Job Requirements"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">
                Compensation and Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="salaryMin">Salary Minimum (Annual INR)</Label>
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
                  <Label htmlFor="salaryMax">Salary Maximum (Annual INR)</Label>
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
              <div className="flex items-center space-x-2 pt-4">
                <Checkbox
                  id="payTransparency"
                  name="payTransparency"
                  checked={jobData.payTransparency ?? true}
                  onCheckedChange={(checked) =>
                    setJobData((prev) => ({
                      ...prev,
                      payTransparency: Boolean(checked),
                    }))
                  }
                  aria-labelledby="payTransparencyLabel"
                />
                <Label
                  htmlFor="payTransparency"
                  className="font-medium"
                  id="payTransparencyLabel"
                >
                  Show salary range to applicants
                </Label>
              </div>
              <div className="mt-4">
                <Label htmlFor="benefits">
                  Benefits (Describe the perks and benefits)
                </Label>
                <Textarea
                  id="benefits"
                  name="benefits"
                  value={jobData.benefits || ''}
                  onChange={handleChange}
                  placeholder="e.g., Health Insurance, Paid Time Off, Remote Work options, Professional Development..."
                  aria-label="Benefits"
                  rows={4}
                />
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">
                Additional Job Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={jobData.industry || ''}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Technology, Finance, Healthcare"
                    aria-label="Industry"
                  />
                </div>
                <div>
                  <Label htmlFor="department">
                    Functional Area/Department *
                  </Label>
                  <Input
                    id="department"
                    name="department"
                    value={jobData.department || ''}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Engineering, Marketing, Sales"
                    aria-label="Department"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="roleDesignation">
                  Role/Designation (Specific Title)
                </Label>
                <Input
                  id="roleDesignation"
                  name="roleDesignation"
                  value={jobData.roleDesignation || ''}
                  onChange={handleChange}
                  placeholder="e.g., Frontend Lead, Product Marketing Manager"
                  aria-label="Role Designation"
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="experienceLevel">Experience Level *</Label>
                <Select
                  value={jobData.experienceLevel || 'Entry-Level'}
                  onValueChange={(value) =>
                    handleSelectChange(
                      'experienceLevel',
                      value as JobExperienceLevel
                    )
                  }
                  required
                >
                  <SelectTrigger
                    id="experienceLevel"
                    aria-label="Select experience level"
                  >
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevelOptions.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <Label htmlFor="minExperienceYears">
                    Min. Years of Experience
                  </Label>
                  <Input
                    id="minExperienceYears"
                    name="minExperienceYears"
                    type="number"
                    placeholder="e.g., 2"
                    value={
                      jobData.minExperienceYears === undefined
                        ? ''
                        : jobData.minExperienceYears
                    }
                    onChange={handleChange}
                    min="0"
                    aria-label="Minimum Years of Experience"
                  />
                </div>
                <div>
                  <Label htmlFor="maxExperienceYears">
                    Max. Years of Experience
                  </Label>
                  <Input
                    id="maxExperienceYears"
                    name="maxExperienceYears"
                    type="number"
                    placeholder="e.g., 5"
                    value={
                      jobData.maxExperienceYears === undefined
                        ? ''
                        : jobData.maxExperienceYears
                    }
                    onChange={handleChange}
                    min="0"
                    aria-label="Maximum Years of Experience"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="educationQualification">
                  Education Qualification
                </Label>
                <Input
                  id="educationQualification"
                  name="educationQualification"
                  value={jobData.educationQualification || ''}
                  onChange={handleChange}
                  placeholder="e.g., Bachelor's in CS, MBA"
                  aria-label="Education Qualification"
                />
              </div>
            </Card>

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

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">
                Application Process
              </h3>
              <div>
                <Label htmlFor="applicationDeadline">
                  Application Deadline
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!jobData.applicationDeadline && 'text-muted-foreground'}`}
                      aria-label="Pick application deadline"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {appDeadlineDate ? (
                        format(appDeadlineDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={appDeadlineDate}
                      onSelect={(date) =>
                        handleDateChange('applicationDeadline', date)
                      }
                      captionLayout="dropdown"
                      fromYear={new Date().getFullYear()}
                      toYear={new Date().getFullYear() + 5}
                      defaultMonth={appDeadlineDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </Card>

            <div className="space-y-4 p-4 border rounded-md">
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
