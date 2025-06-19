'use client';
import { useState, useEffect, type FormEvent } from 'react';
import type {
  UserProfile,
  Company,
  LanguageEntry,
  ExperienceEntry,
  EducationEntry,
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
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Building,
  User,
  Users,
  Info,
  ShieldCheck,
  Eye,
  EyeOff,
  Languages as LanguagesIcon, // Renamed to avoid conflict
  PlusCircle,
  Trash2,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyINR } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

// Helper function to create an empty experience entry
const createEmptyExperience = (): ExperienceEntry => ({
  id: uuidv4(),
  companyName: '',
  jobRole: '',
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  description: '',
});

// Helper function to create an empty education entry
const createEmptyEducation = (): EducationEntry => ({
  id: uuidv4(),
  level: 'Graduate',
  degreeName: '',
  instituteName: '',
  startYear: undefined,
  endYear: undefined,
  courseType: 'Full Time',
  isMostRelevant: false,
  description: '',
});

// Helper function to create an empty language entry
const createEmptyLanguage = (): LanguageEntry => ({
  id: uuidv4(),
  languageName: '',
  proficiency: 'Beginner',
  canRead: false,
  canWrite: false,
  canSpeak: false,
});

export function UserProfileForm() {
  const {
    user,
    company,
    updateUserProfile,
    updateCompanyProfile,
    loading: authLoading,
  } = useAuth();
  const { toast } = useToast();

  const initialUserFormData: Partial<UserProfile> = {
    name: '',
    avatarUrl: '',
    headline: '',
    skills: [],
    experiences: [],
    educations: [],
    languages: [],
    mobileNumber: '',
    availability: 'Flexible',
    portfolioUrl: '',
    linkedinUrl: '',
    preferredLocations: [],
    jobSearchStatus: 'activelyLooking',
    isProfileSearchable: true,
    gender: 'Prefer not to say',
    dateOfBirth: '',
    currentCTCValue: undefined,
    currentCTCConfidential: false,
    expectedCTCValue: undefined,
    expectedCTCNegotiable: false,
    homeState: '',
    homeCity: '',
  };

  const initialCompanyFormData: Partial<Company> = {
    name: '',
    description: '',
    websiteUrl: '',
    logoUrl: '',
    bannerImageUrl: '',
    status: 'pending',
  };

  const [userFormData, setUserFormData] =
    useState<Partial<UserProfile>>(initialUserFormData);
  const [companyFormData, setCompanyFormData] = useState<Partial<Company>>(
    initialCompanyFormData
  );
  const [isLoading, setIsLoading] = useState(false);
  const [skillsInput, setSkillsInput] = useState('');
  const [locationsInput, setLocationsInput] = useState('');

  const [companyRecruiters, setCompanyRecruiters] = useState<UserProfile[]>([]);
  const [isFetchingRecruiters, setIsFetchingRecruiters] = useState(false);

  useEffect(() => {
    if (user) {
      setUserFormData({
        name: user.name || '',
        avatarUrl: user.avatarUrl || '',
        headline: user.headline || '',
        skills: user.skills || [],
        experiences: user.experiences || [createEmptyExperience()], // Initialize with one empty if none
        educations: user.educations || [createEmptyEducation()], // Initialize with one empty if none
        languages: user.languages || [createEmptyLanguage()], // Initialize with one empty if none
        mobileNumber: user.mobileNumber || '',
        availability: user.availability || 'Flexible',
        portfolioUrl: user.portfolioUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        preferredLocations: user.preferredLocations || [],
        jobSearchStatus: user.jobSearchStatus || 'activelyLooking',
        isProfileSearchable:
          user.isProfileSearchable !== undefined
            ? user.isProfileSearchable
            : true,
        gender: user.gender || 'Prefer not to say',
        dateOfBirth: user.dateOfBirth || '',
        currentCTCValue: user.currentCTCValue,
        currentCTCConfidential: user.currentCTCConfidential || false,
        expectedCTCValue: user.expectedCTCValue,
        expectedCTCNegotiable: user.expectedCTCNegotiable || false,
        homeState: user.homeState || '',
        homeCity: user.homeCity || '',
        parsedResumeText: user.parsedResumeText || '',
      });
      setSkillsInput((user.skills || []).join(', '));
      setLocationsInput((user.preferredLocations || []).join(', '));

      if (user.role === 'employer' && company) {
        setCompanyFormData({
          name: company.name || '',
          description: company.description || '',
          websiteUrl: company.websiteUrl || '',
          logoUrl: company.logoUrl || '',
          bannerImageUrl: company.bannerImageUrl || '',
          status: company.status || 'pending',
        });

        if (
          user.isCompanyAdmin &&
          company.recruiterUids &&
          company.recruiterUids.length > 0
        ) {
          const fetchRecruiters = async () => {
            setIsFetchingRecruiters(true);
            try {
              const recruitersQueryLimit = 30;
              const fetchedRecruiters: UserProfile[] = [];
              for (
                let i = 0;
                i < company.recruiterUids.length;
                i += recruitersQueryLimit
              ) {
                const batchUids = company.recruiterUids.slice(
                  i,
                  i + recruitersQueryLimit
                );
                if (batchUids.length > 0) {
                  const q = query(
                    collection(db, 'users'),
                    where('__name__', 'in', batchUids)
                  );
                  const snapshot = await getDocs(q);
                  snapshot.docs.forEach((d) =>
                    fetchedRecruiters.push({
                      uid: d.id,
                      ...d.data(),
                    } as UserProfile)
                  );
                }
              }
              setCompanyRecruiters(fetchedRecruiters);
            } catch (error) {
              console.error('Error fetching company recruiters:', error);
              toast({
                title: 'Error',
                description: 'Could not load recruiter details.',
                variant: 'destructive',
              });
            } finally {
              setIsFetchingRecruiters(false);
            }
          };
          fetchRecruiters();
        } else {
          setCompanyRecruiters([]);
        }
      }
    } else {
      setUserFormData(initialUserFormData);
      setCompanyFormData(initialCompanyFormData);
      setSkillsInput('');
      setLocationsInput('');
      setCompanyRecruiters([]);
    }
  }, [user, company, toast]);

  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setUserFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : (name === 'currentCTCValue' || name === 'expectedCTCValue') && value
            ? parseFloat(value)
            : value,
    }));
  };

  const handleUserSelectChange = (name: keyof UserProfile, value: string) => {
    setUserFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSwitchChange = (
    name: keyof UserProfile,
    checked: boolean
  ) => {
    setUserFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCompanyFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSkillsInput(val);
    setUserFormData((prev) => ({
      ...prev,
      skills: val
        .split(',')
        .map((skill) => skill.trim())
        .filter((skill) => skill),
    }));
  };

  const handleLocationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocationsInput(val);
    setUserFormData((prev) => ({
      ...prev,
      preferredLocations: val
        .split(',')
        .map((loc) => loc.trim())
        .filter((loc) => loc),
    }));
  };

  // Handlers for dynamic array fields (Experience, Education, Language)
  const handleArrayFieldChange = <T extends { id: string }>(
    arrayName: keyof Pick<
      UserProfile,
      'experiences' | 'educations' | 'languages'
    >,
    index: number,
    field: keyof T,
    value: any,
    type?: string
  ) => {
    setUserFormData((prev) => {
      const newArray = [...((prev[arrayName] as T[]) || [])];
      if (newArray[index]) {
        newArray[index] = {
          ...newArray[index],
          [field]:
            type === 'checkbox'
              ? (value as unknown as HTMLInputElement).checked
              : type === 'number' && value
                ? parseFloat(value)
                : value,
        };
      }
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = <T extends { id: string }>(
    arrayName: keyof Pick<
      UserProfile,
      'experiences' | 'educations' | 'languages'
    >,
    creatorFunc: () => T
  ) => {
    setUserFormData((prev) => ({
      ...prev,
      [arrayName]: [...((prev[arrayName] as T[]) || []), creatorFunc()],
    }));
  };

  const removeArrayItem = <T extends { id: string }>(
    arrayName: keyof Pick<
      UserProfile,
      'experiences' | 'educations' | 'languages'
    >,
    idToRemove: string
  ) => {
    setUserFormData((prev) => ({
      ...prev,
      [arrayName]: ((prev[arrayName] as T[]) || []).filter(
        (item) => item.id !== idToRemove
      ),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    // Filter out empty/incomplete array entries before saving
    const finalExperiences = (userFormData.experiences || []).filter(
      (exp) => exp.companyName && exp.jobRole
    );
    const finalEducations = (userFormData.educations || []).filter(
      (edu) => edu.degreeName && edu.instituteName
    );
    const finalLanguages = (userFormData.languages || []).filter(
      (lang) => lang.languageName
    );

    try {
      const userUpdatePayload: Partial<UserProfile> = {
        name: userFormData.name,
        avatarUrl: userFormData.avatarUrl,
        updatedAt: new Date().toISOString(), // Ensure updatedAt is updated
      };
      if (user.role === 'jobSeeker') {
        Object.assign(userUpdatePayload, {
          headline: userFormData.headline,
          skills: userFormData.skills,
          experiences: finalExperiences,
          educations: finalEducations,
          languages: finalLanguages,
          mobileNumber: userFormData.mobileNumber,
          availability: userFormData.availability,
          portfolioUrl: userFormData.portfolioUrl,
          linkedinUrl: userFormData.linkedinUrl,
          preferredLocations: userFormData.preferredLocations,
          jobSearchStatus: userFormData.jobSearchStatus,
          isProfileSearchable: userFormData.isProfileSearchable,
          gender: userFormData.gender,
          dateOfBirth: userFormData.dateOfBirth,
          currentCTCValue: userFormData.currentCTCValue,
          currentCTCConfidential: userFormData.currentCTCConfidential,
          expectedCTCValue: userFormData.expectedCTCValue,
          expectedCTCNegotiable: userFormData.expectedCTCNegotiable,
          homeState: userFormData.homeState,
          homeCity: userFormData.homeCity,
          parsedResumeText: userFormData.parsedResumeText, // Keep this from resume parsing
        });
      }
      await updateUserProfile(userUpdatePayload);

      if (user.role === 'employer' && user.isCompanyAdmin && user.companyId) {
        const companyUpdatePayload: Partial<Company> = {
          name: companyFormData.name,
          description: companyFormData.description,
          websiteUrl: companyFormData.websiteUrl,
          logoUrl: companyFormData.logoUrl,
          bannerImageUrl: companyFormData.bannerImageUrl,
        };
        await updateCompanyProfile(user.companyId, companyUpdatePayload);
      }

      toast({
        title: 'Profile Updated',
        description: 'Your information has been successfully updated.',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Profile...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to view and edit your profile.</p>
        </CardContent>
      </Card>
    );
  }

  const isJobSeeker = user.role === 'jobSeeker';
  const isCompanyAdmin = user.role === 'employer' && user.isCompanyAdmin;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Details Card */}
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <User /> Personal Information
          </CardTitle>
          <CardDescription>Manage your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="userName">Full Name</Label>
              <Input
                id="userName"
                name="name"
                value={userFormData.name || ''}
                onChange={handleUserChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="userEmail">Email Address</Label>
              <Input
                id="userEmail"
                name="email"
                type="email"
                value={user.email || ''}
                readOnly
                disabled
                className="bg-muted/50"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="userAvatarUrl">Your Avatar URL</Label>
            <Input
              id="userAvatarUrl"
              name="avatarUrl"
              placeholder="https://example.com/your-avatar.png"
              value={userFormData.avatarUrl || ''}
              onChange={handleUserChange}
              data-ai-hint="avatar photo"
            />
          </div>
          {isJobSeeker && (
            <>
              <div>
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  name="headline"
                  placeholder="e.g., Senior Software Engineer | AI Enthusiast"
                  value={userFormData.headline || ''}
                  onChange={handleUserChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    placeholder="e.g., +919876543210"
                    value={userFormData.mobileNumber || ''}
                    onChange={handleUserChange}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={userFormData.gender || 'Prefer not to say'}
                    onValueChange={(value) =>
                      handleUserSelectChange('gender', value)
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={userFormData.dateOfBirth || ''}
                    onChange={handleUserChange}
                  />
                </div>
                <div>
                  <Label htmlFor="skillsInput">
                    Key Skills (comma-separated)
                  </Label>
                  <Input
                    id="skillsInput"
                    name="skillsInput"
                    value={skillsInput}
                    onChange={handleSkillsChange}
                    placeholder="e.g., React, Node.js, Project Management"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="homeState">Home State</Label>
                  <Input
                    id="homeState"
                    name="homeState"
                    value={userFormData.homeState || ''}
                    onChange={handleUserChange}
                    placeholder="e.g., California"
                  />
                </div>
                <div>
                  <Label htmlFor="homeCity">Home City</Label>
                  <Input
                    id="homeCity"
                    name="homeCity"
                    value={userFormData.homeCity || ''}
                    onChange={handleUserChange}
                    placeholder="e.g., San Francisco"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Job Seeker Specific Sections */}
      {isJobSeeker && (
        <>
          {/* Professional Summary Card */}
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                Professional Summary
              </CardTitle>
              <CardDescription>
                A brief overview of your career. This can be auto-filled from
                your resume.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="parsedResumeText"
                name="parsedResumeText"
                value={userFormData.parsedResumeText || ''}
                onChange={handleUserChange}
                rows={6}
                placeholder="Your professional summary, often extracted from your resume..."
              />
            </CardContent>
          </Card>

          {/* Compensation Card */}
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline">
                Compensation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                  <Label htmlFor="currentCTCValue">
                    Current Annual CTC (INR)
                  </Label>
                  <Input
                    id="currentCTCValue"
                    name="currentCTCValue"
                    type="number"
                    placeholder="e.g., 1600000"
                    value={userFormData.currentCTCValue || ''}
                    onChange={handleUserChange}
                  />
                  {userFormData.currentCTCValue && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Formatted:{' '}
                      {formatCurrencyINR(userFormData.currentCTCValue)}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <Checkbox
                    id="currentCTCConfidential"
                    name="currentCTCConfidential"
                    checked={userFormData.currentCTCConfidential}
                    onCheckedChange={(checked) =>
                      handleUserSwitchChange(
                        'currentCTCConfidential',
                        Boolean(checked)
                      )
                    }
                  />
                  <Label htmlFor="currentCTCConfidential">Confidential</Label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                  <Label htmlFor="expectedCTCValue">
                    Expected Annual CTC (INR)
                  </Label>
                  <Input
                    id="expectedCTCValue"
                    name="expectedCTCValue"
                    type="number"
                    placeholder="e.g., 2000000"
                    value={userFormData.expectedCTCValue || ''}
                    onChange={handleUserChange}
                  />
                  {userFormData.expectedCTCValue && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Formatted:{' '}
                      {formatCurrencyINR(userFormData.expectedCTCValue)}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <Checkbox
                    id="expectedCTCNegotiable"
                    name="expectedCTCNegotiable"
                    checked={userFormData.expectedCTCNegotiable}
                    onCheckedChange={(checked) =>
                      handleUserSwitchChange(
                        'expectedCTCNegotiable',
                        Boolean(checked)
                      )
                    }
                  />
                  <Label htmlFor="expectedCTCNegotiable">Negotiable</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experiences Card */}
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <Briefcase /> Work Experience
              </CardTitle>
              <CardDescription>
                Detail your professional background.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(userFormData.experiences || []).map((exp, index) => (
                <Card key={exp.id} className="p-4 bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <Label htmlFor={`exp-company-${exp.id}`}>
                        Company Name *
                      </Label>
                      <Input
                        id={`exp-company-${exp.id}`}
                        value={exp.companyName}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            'experiences',
                            index,
                            'companyName',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exp-role-${exp.id}`}>Job Role *</Label>
                      <Input
                        id={`exp-role-${exp.id}`}
                        value={exp.jobRole}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            'experiences',
                            index,
                            'jobRole',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 items-end">
                    <div>
                      <Label htmlFor={`exp-start-${exp.id}`}>
                        Start Date (YYYY-MM)
                      </Label>
                      <Input
                        id={`exp-start-${exp.id}`}
                        type="month"
                        value={exp.startDate}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            'experiences',
                            index,
                            'startDate',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exp-end-${exp.id}`}>
                        End Date (YYYY-MM)
                      </Label>
                      <Input
                        id={`exp-end-${exp.id}`}
                        type="month"
                        value={exp.endDate}
                        disabled={exp.currentlyWorking}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            'experiences',
                            index,
                            'endDate',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Checkbox
                        id={`exp-current-${exp.id}`}
                        checked={exp.currentlyWorking}
                        onCheckedChange={(checked) =>
                          handleArrayFieldChange(
                            'experiences',
                            index,
                            'currentlyWorking',
                            checked
                          )
                        }
                      />
                      <Label htmlFor={`exp-current-${exp.id}`}>
                        Currently working here
                      </Label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`exp-ctc-${exp.id}`}>
                      Annual CTC (INR, Optional)
                    </Label>
                    <Input
                      id={`exp-ctc-${exp.id}`}
                      type="number"
                      value={exp.annualCTC || ''}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          'experiences',
                          index,
                          'annualCTC',
                          e.target.value,
                          'number'
                        )
                      }
                    />
                  </div>
                  <div className="mt-3">
                    <Label htmlFor={`exp-desc-${exp.id}`}>Description</Label>
                    <Textarea
                      id={`exp-desc-${exp.id}`}
                      value={exp.description}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          'experiences',
                          index,
                          'description',
                          e.target.value
                        )
                      }
                      rows={3}
                    />
                  </div>
                  {(userFormData.experiences || []).length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('experiences', exp.id)}
                      className="mt-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Remove Experience
                    </Button>
                  )}
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  addArrayItem('experiences', createEmptyExperience)
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Experience
              </Button>
            </CardContent>
          </Card>

          {/* Education Card */}
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <GraduationCap /> Education
              </CardTitle>
              <CardDescription>
                Your educational qualifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(userFormData.educations || []).map((edu, index) => (
                <Card key={edu.id} className="p-4 bg-muted/30">
                  <div>
                    <Label htmlFor={`edu-level-${edu.id}`}>Level *</Label>
                    <Select
                      value={edu.level}
                      onValueChange={(value) =>
                        handleArrayFieldChange(
                          'educations',
                          index,
                          'level',
                          value
                        )
                      }
                    >
                      <SelectTrigger id={`edu-level-${edu.id}`}>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Post Graduate">
                          Post Graduate
                        </SelectItem>
                        <SelectItem value="Graduate">Graduate</SelectItem>
                        <SelectItem value="Schooling (XII)">
                          Schooling (XII)
                        </SelectItem>
                        <SelectItem value="Schooling (X)">
                          Schooling (X)
                        </SelectItem>
                        <SelectItem value="Certification / Other">
                          Certification / Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                    <div>
                      <Label htmlFor={`edu-degree-${edu.id}`}>
                        Degree/Certificate Name *
                      </Label>
                      <Input
                        id={`edu-degree-${edu.id}`}
                        value={edu.degreeName}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            'educations',
                            index,
                            'degreeName',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edu-institute-${edu.id}`}>
                        Institute Name *
                      </Label>
                      <Input
                        id={`edu-institute-${edu.id}`}
                        value={edu.instituteName}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            'educations',
                            index,
                            'instituteName',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <Label htmlFor={`edu-startYear-${edu.id}`}>
                        Start Year
                      </Label>
                      <Input
                        id={`edu-startYear-${edu.id}`}
                        type="number"
                        placeholder="YYYY"
                        value={edu.startYear || ''}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            'educations',
                            index,
                            'startYear',
                            e.target.value,
                            'number'
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edu-endYear-${edu.id}`}>End Year</Label>
                      <Input
                        id={`edu-endYear-${edu.id}`}
                        type="number"
                        placeholder="YYYY"
                        value={edu.endYear || ''}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            'educations',
                            index,
                            'endYear',
                            e.target.value,
                            'number'
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 items-end">
                    <div>
                      <Label htmlFor={`edu-specialization-${edu.id}`}>
                        Specialization
                      </Label>
                      <Input
                        id={`edu-specialization-${edu.id}`}
                        value={edu.specialization || ''}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            'educations',
                            index,
                            'specialization',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edu-courseType-${edu.id}`}>
                        Course Type
                      </Label>
                      <Select
                        value={edu.courseType || 'Full Time'}
                        onValueChange={(value) =>
                          handleArrayFieldChange(
                            'educations',
                            index,
                            'courseType',
                            value
                          )
                        }
                      >
                        <SelectTrigger id={`edu-courseType-${edu.id}`}>
                          <SelectValue placeholder="Select course type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full Time">Full Time</SelectItem>
                          <SelectItem value="Part Time">Part Time</SelectItem>
                          <SelectItem value="Distance Learning">
                            Distance Learning
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id={`edu-relevant-${edu.id}`}
                      checked={edu.isMostRelevant}
                      onCheckedChange={(checked) =>
                        handleArrayFieldChange(
                          'educations',
                          index,
                          'isMostRelevant',
                          checked
                        )
                      }
                    />
                    <Label htmlFor={`edu-relevant-${edu.id}`}>
                      This is my most relevant/important educational
                      qualification
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor={`edu-desc-${edu.id}`}>Description</Label>
                    <Textarea
                      id={`edu-desc-${edu.id}`}
                      value={edu.description}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          'educations',
                          index,
                          'description',
                          e.target.value
                        )
                      }
                      rows={2}
                    />
                  </div>
                  {(userFormData.educations || []).length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('educations', edu.id)}
                      className="mt-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Remove Education
                    </Button>
                  )}
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('educations', createEmptyEducation)}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Education
              </Button>
            </CardContent>
          </Card>

          {/* Languages Card */}
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <LanguagesIcon /> Languages
              </CardTitle>
              <CardDescription>
                Languages you know and your proficiency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(userFormData.languages || []).map((lang, index) => (
                <Card key={lang.id} className="p-4 bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <Label htmlFor={`lang-name-${lang.id}`}>
                        Language Name *
                      </Label>
                      <Input
                        id={`lang-name-${lang.id}`}
                        value={lang.languageName}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            'languages',
                            index,
                            'languageName',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`lang-proficiency-${lang.id}`}>
                        Proficiency *
                      </Label>
                      <Select
                        value={lang.proficiency}
                        onValueChange={(value) =>
                          handleArrayFieldChange(
                            'languages',
                            index,
                            'proficiency',
                            value
                          )
                        }
                      >
                        <SelectTrigger id={`lang-proficiency-${lang.id}`}>
                          <SelectValue placeholder="Select proficiency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Native">Native</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-read-${lang.id}`}
                        checked={lang.canRead}
                        onCheckedChange={(checked) =>
                          handleArrayFieldChange(
                            'languages',
                            index,
                            'canRead',
                            checked
                          )
                        }
                      />
                      <Label htmlFor={`lang-read-${lang.id}`}>Read</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-write-${lang.id}`}
                        checked={lang.canWrite}
                        onCheckedChange={(checked) =>
                          handleArrayFieldChange(
                            'languages',
                            index,
                            'canWrite',
                            checked
                          )
                        }
                      />
                      <Label htmlFor={`lang-write-${lang.id}`}>Write</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-speak-${lang.id}`}
                        checked={lang.canSpeak}
                        onCheckedChange={(checked) =>
                          handleArrayFieldChange(
                            'languages',
                            index,
                            'canSpeak',
                            checked
                          )
                        }
                      />
                      <Label htmlFor={`lang-speak-${lang.id}`}>Speak</Label>
                    </div>
                  </div>
                  {(userFormData.languages || []).length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('languages', lang.id)}
                      className="mt-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Remove Language
                    </Button>
                  )}
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('languages', createEmptyLanguage)}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Language
              </Button>
            </CardContent>
          </Card>

          {/* Preferences & Links Card */}
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline">
                Preferences & Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    name="portfolioUrl"
                    placeholder="https://yourportfolio.com"
                    value={userFormData.portfolioUrl || ''}
                    onChange={handleUserChange}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={userFormData.linkedinUrl || ''}
                    onChange={handleUserChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="preferredLocations">
                  Preferred Locations (comma-separated)
                </Label>
                <Input
                  id="preferredLocations"
                  name="preferredLocations"
                  value={locationsInput}
                  onChange={handleLocationsChange}
                  placeholder="e.g., San Francisco, Remote, New York"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="jobSearchStatus">Job Search Status</Label>
                  <Select
                    value={userFormData.jobSearchStatus || 'activelyLooking'}
                    onValueChange={(value) =>
                      handleUserSelectChange('jobSearchStatus', value)
                    }
                  >
                    <SelectTrigger id="jobSearchStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activelyLooking">
                        Actively Looking
                      </SelectItem>
                      <SelectItem value="openToOpportunities">
                        Open to Opportunities
                      </SelectItem>
                      <SelectItem value="notLooking">Not Looking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={userFormData.availability || 'Flexible'}
                    onValueChange={(value) =>
                      handleUserSelectChange('availability', value)
                    }
                  >
                    <SelectTrigger id="availability">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Immediate">Immediate</SelectItem>
                      <SelectItem value="2 Weeks Notice">
                        2 Weeks Notice
                      </SelectItem>
                      <SelectItem value="1 Month Notice">
                        1 Month Notice
                      </SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <Switch
                  id="isProfileSearchable"
                  checked={!!userFormData.isProfileSearchable}
                  onCheckedChange={(checked) =>
                    handleUserSwitchChange('isProfileSearchable', checked)
                  }
                  aria-label="Profile searchable toggle"
                />
                <Label
                  htmlFor="isProfileSearchable"
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  {userFormData.isProfileSearchable ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}{' '}
                  My profile is searchable by employers
                </Label>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Company Profile Card (for Company Admins) */}
      {isCompanyAdmin && company && user.companyId && (
        <Card className="w-full shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-headline flex items-center gap-2">
                  <Building /> Company Profile
                </CardTitle>
                <CardDescription>
                  Manage your company&apos;s public information. Changes here
                  affect your public company page. Profile status changes are
                  handled by site admins.
                </CardDescription>
              </div>
              <Badge
                variant={
                  companyFormData.status === 'approved'
                    ? 'default'
                    : companyFormData.status === 'rejected' ||
                        companyFormData.status === 'suspended'
                      ? 'destructive'
                      : 'secondary'
                }
                className="text-sm"
              >
                <ShieldCheck className="mr-1.5 h-4 w-4" />{' '}
                {companyFormData.status?.toUpperCase()}
              </Badge>
            </div>
            {(companyFormData.status === 'rejected' ||
              companyFormData.status === 'suspended') &&
              company.moderationReason && (
                <p className="text-sm text-destructive mt-1">
                  Admin Reason: {company.moderationReason}
                </p>
              )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="name"
                value={companyFormData.name || ''}
                onChange={handleCompanyChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="companyWebsiteUrl">Company Website URL</Label>
              <Input
                id="companyWebsiteUrl"
                name="websiteUrl"
                placeholder="https://yourcompany.com"
                value={companyFormData.websiteUrl || ''}
                onChange={handleCompanyChange}
              />
            </div>
            <div>
              <Label htmlFor="companyLogoUrl">Company Logo URL</Label>
              <Input
                id="companyLogoUrl"
                name="logoUrl"
                placeholder="https://example.com/logo.png"
                value={companyFormData.logoUrl || ''}
                onChange={handleCompanyChange}
                data-ai-hint="company logo"
              />
            </div>
            <div>
              <Label htmlFor="companyBannerImageUrl">
                Company Banner Image URL
              </Label>
              <Input
                id="companyBannerImageUrl"
                name="bannerImageUrl"
                placeholder="https://example.com/banner.png"
                value={companyFormData.bannerImageUrl || ''}
                onChange={handleCompanyChange}
                data-ai-hint="company banner"
              />
            </div>
            <div>
              <Label htmlFor="companyDescription">
                Company Description (Markdown supported)
              </Label>
              <Textarea
                id="companyDescription"
                name="description"
                value={companyFormData.description || ''}
                onChange={handleCompanyChange}
                rows={6}
                placeholder="Briefly describe your company..."
              />
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users /> Recruiters ({companyRecruiters.length})
              </h3>
              {isFetchingRecruiters ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading recruiters...
                </div>
              ) : companyRecruiters.length > 0 ? (
                <div className="space-y-3">
                  {companyRecruiters.map((rec) => (
                    <div
                      key={rec.uid}
                      className="flex items-center gap-3 p-2 border rounded-md bg-muted/20"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            rec.avatarUrl || `https://placehold.co/40x40.png`
                          }
                          alt={rec.name}
                          data-ai-hint="recruiter avatar"
                        />
                        <AvatarFallback>
                          {rec.name?.[0]?.toUpperCase() || 'R'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {rec.name} {rec.uid === user.uid && '(You)'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rec.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recruiters currently associated with this company besides
                  yourself.
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                <Info className="inline h-3 w-3 mr-1" />
                Recruiter management (inviting, removing) is handled by site
                administrators.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <CardFooter>
        <Button
          type="submit"
          disabled={isLoading || authLoading}
          className="w-full sm:w-auto text-lg py-6 px-8 ml-auto"
        >
          {(isLoading || authLoading) && (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          )}
          Save All Changes
        </Button>
      </CardFooter>
    </form>
  );
}
