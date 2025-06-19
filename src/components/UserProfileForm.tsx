
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
  Languages as LanguagesIcon,
  PlusCircle,
  Trash2,
  Briefcase,
  GraduationCap,
  CalendarDays,
  DollarSign,
  Sparkles,
  Award,
  Clock,
  Save,
  Home,
  Cake,
  Phone,
  AtSign, // Alternative to Mail if needed for consistency
} from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyINR } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { format, parse, isValid } from 'date-fns';

const createEmptyExperience = (): ExperienceEntry => ({
  id: uuidv4(),
  companyName: '',
  jobRole: '',
  startDate: undefined,
  endDate: undefined,
  currentlyWorking: false,
  description: '',
  annualCTC: undefined,
});

const createEmptyEducation = (): EducationEntry => ({
  id: uuidv4(),
  level: 'Graduate',
  degreeName: '',
  instituteName: '',
  startYear: undefined,
  endYear: undefined,
  specialization: '',
  courseType: 'Full Time',
  isMostRelevant: false,
  description: '',
});

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
    experiences: [createEmptyExperience()],
    educations: [createEmptyEducation()],
    languages: [createEmptyLanguage()],
    mobileNumber: '',
    availability: 'Flexible',
    portfolioUrl: '',
    linkedinUrl: '',
    preferredLocations: [],
    jobSearchStatus: 'activelyLooking',
    isProfileSearchable: true,
    gender: 'Prefer not to say',
    dateOfBirth: undefined,
    currentCTCValue: undefined,
    currentCTCConfidential: false,
    expectedCTCValue: undefined,
    expectedCTCNegotiable: false,
    homeState: '',
    homeCity: '',
    parsedResumeText: '',
    totalYearsExperience: 0,
    totalMonthsExperience: 0,
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
        experiences:
          user.experiences && user.experiences.length > 0
            ? user.experiences.map((exp) => ({
                ...createEmptyExperience(),
                ...exp,
                companyName: exp.companyName || '',
                jobRole: exp.jobRole || '',
                description: exp.description || '',
                startDate:
                  exp.startDate &&
                  isValid(parse(exp.startDate, 'yyyy-MM-dd', new Date()))
                    ? exp.startDate
                    : undefined,
                endDate:
                  exp.endDate &&
                  isValid(parse(exp.endDate, 'yyyy-MM-dd', new Date()))
                    ? exp.endDate
                    : undefined,
              }))
            : [createEmptyExperience()],
        educations:
          user.educations && user.educations.length > 0
            ? user.educations.map((edu) => ({
                ...createEmptyEducation(),
                ...edu,
                degreeName: edu.degreeName || '',
                instituteName: edu.instituteName || '',
                description: edu.description || '',
                specialization: edu.specialization || '',
              }))
            : [createEmptyEducation()],
        languages:
          user.languages && user.languages.length > 0
            ? user.languages.map((lang) => ({
                ...createEmptyLanguage(),
                ...lang,
                languageName: lang.languageName || '',
              }))
            : [createEmptyLanguage()],
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
        dateOfBirth: user.dateOfBirth
          ? isValid(parse(user.dateOfBirth, 'yyyy-MM-dd', new Date()))
            ? user.dateOfBirth
            : undefined
          : undefined,
        currentCTCValue:
          user.currentCTCValue === null ? undefined : user.currentCTCValue,
        currentCTCConfidential: user.currentCTCConfidential || false,
        expectedCTCValue:
          user.expectedCTCValue === null ? undefined : user.expectedCTCValue,
        expectedCTCNegotiable: user.expectedCTCNegotiable || false,
        homeState: user.homeState || '',
        homeCity: user.homeCity || '',
        parsedResumeText: user.parsedResumeText || '',
        totalYearsExperience: user.totalYearsExperience || 0,
        totalMonthsExperience: user.totalMonthsExperience || 0,
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
                i < (company.recruiterUids || []).length;
                i += recruitersQueryLimit
              ) {
                const batchUids = (company.recruiterUids || []).slice(
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
  }, [user, company]);

  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setUserFormData((prev) => {
      let newValue: any = value;
      if (type === 'checkbox') {
        newValue = checked;
      } else if (
        name === 'currentCTCValue' ||
        name === 'expectedCTCValue' ||
        name === 'totalYearsExperience' ||
        name === 'totalMonthsExperience'
      ) {
        newValue = value === '' ? undefined : parseFloat(value);
        if (isNaN(newValue as number)) newValue = undefined;
        if (name === 'totalMonthsExperience' && newValue !== undefined) {
          newValue = Math.max(0, Math.min(11, newValue));
        }
        if (name === 'totalYearsExperience' && newValue !== undefined) {
          newValue = Math.max(0, newValue);
        }
      }
      return { ...prev, [name]: newValue };
    });
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

  const handleDateOfBirthChange = (date: Date | undefined) => {
    setUserFormData((prev) => ({
      ...prev,
      dateOfBirth: date ? format(date, 'yyyy-MM-dd') : undefined,
    }));
  };

  const handleExperienceDateChange = (
    index: number,
    fieldName: 'startDate' | 'endDate',
    date: Date | undefined
  ) => {
    setUserFormData((prev) => {
      const newExperiences = [...(prev.experiences || [])];
      if (newExperiences[index]) {
        newExperiences[index] = {
          ...newExperiences[index],
          [fieldName]: date ? format(date, 'yyyy-MM-dd') : undefined,
        };
      }
      return { ...prev, experiences: newExperiences };
    });
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

  const handleArrayFieldChange = <T extends { id: string }>(
    arrayName: keyof Pick<
      UserProfile,
      'experiences' | 'educations' | 'languages'
    >,
    index: number,
    field: keyof T,
    value: any,
    inputType?: string
  ) => {
    setUserFormData((prev) => {
      const newArray = [...((prev[arrayName] as T[]) || [])];
      if (newArray[index]) {
        let processedValue = value;
        if (inputType === 'checkbox') {
          processedValue = (value as unknown as HTMLInputElement).checked;
        } else if (inputType === 'number') {
          if (
            field === 'annualCTC' ||
            field === 'startYear' ||
            field === 'endYear'
          ) {
            processedValue =
              value === ''
                ? undefined
                : field === 'annualCTC'
                  ? parseFloat(value)
                  : parseInt(value, 10);
            if (isNaN(processedValue as number)) processedValue = undefined;
          }
        }
        newArray[index] = {
          ...newArray[index],
          [field]: processedValue,
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

    const finalExperiences = (userFormData.experiences || [])
      .filter((exp) => exp.companyName || exp.jobRole)
      .map((exp) => ({
        ...exp,
        companyName: exp.companyName || '',
        jobRole: exp.jobRole || '',
        description: exp.description || '',
        startDate: exp.startDate,
        endDate: exp.endDate,
      }));

    const finalEducations = (userFormData.educations || [])
      .filter((edu) => edu.degreeName || edu.instituteName)
      .map((edu) => ({
        ...edu,
        degreeName: edu.degreeName || '',
        instituteName: edu.instituteName || '',
        description: edu.description || '',
        specialization: edu.specialization || '',
      }));

    const finalLanguages = (userFormData.languages || [])
      .filter((lang) => lang.languageName)
      .map((lang) => ({ ...lang, languageName: lang.languageName || '' }));

    try {
      const userUpdatePayload: Partial<UserProfile> = {
        name: userFormData.name || '',
        avatarUrl: userFormData.avatarUrl || '',
      };
      if (user.role === 'jobSeeker') {
        Object.assign(userUpdatePayload, {
          headline: userFormData.headline || '',
          skills: userFormData.skills || [],
          experiences: finalExperiences,
          educations: finalEducations,
          languages: finalLanguages,
          mobileNumber: userFormData.mobileNumber || '',
          availability: userFormData.availability || 'Flexible',
          portfolioUrl: userFormData.portfolioUrl || '',
          linkedinUrl: userFormData.linkedinUrl || '',
          preferredLocations: userFormData.preferredLocations || [],
          jobSearchStatus: userFormData.jobSearchStatus || 'activelyLooking',
          isProfileSearchable: userFormData.isProfileSearchable,
          gender: userFormData.gender || 'Prefer not to say',
          dateOfBirth: userFormData.dateOfBirth,
          currentCTCValue: userFormData.currentCTCValue,
          currentCTCConfidential: userFormData.currentCTCConfidential || false,
          expectedCTCValue: userFormData.expectedCTCValue,
          expectedCTCNegotiable: userFormData.expectedCTCNegotiable || false,
          homeState: userFormData.homeState || '',
          homeCity: userFormData.homeCity || '',
          parsedResumeText: userFormData.parsedResumeText || '',
          totalYearsExperience: userFormData.totalYearsExperience || 0,
          totalMonthsExperience: userFormData.totalMonthsExperience || 0,
        });
      }
      await updateUserProfile(userUpdatePayload);

      if (user.role === 'employer' && user.isCompanyAdmin && user.companyId) {
        const companyUpdatePayload: Partial<Company> = {
          name: companyFormData.name || '',
          description: companyFormData.description || '',
          websiteUrl: companyFormData.websiteUrl || '',
          logoUrl: companyFormData.logoUrl || '',
          bannerImageUrl: companyFormData.bannerImageUrl || '',
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
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <p>Please log in to view and edit your profile.</p>;
  }

  const isJobSeeker = user.role === 'jobSeeker';
  const isCompanyAdmin = user.role === 'employer' && user.isCompanyAdmin;

  const dobDate =
    userFormData.dateOfBirth &&
    isValid(parse(userFormData.dateOfBirth, 'yyyy-MM-dd', new Date()))
      ? parse(userFormData.dateOfBirth, 'yyyy-MM-dd', new Date())
      : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <User /> Personal Information
          </CardTitle>
          <CardDescription>Manage your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="userName">Full Name</Label>
                <Input
                  id="userName"
                  name="name"
                  value={userFormData.name || ''}
                  onChange={handleUserChange}
                  required
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <Label htmlFor="userEmail" className="flex items-center gap-1">
                  <AtSign className="h-4 w-4 text-muted-foreground" /> Email
                  Address
                </Label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="userAvatarUrl"
                  className="flex items-center gap-1"
                >
                  <User className="h-4 w-4 text-muted-foreground" /> Avatar URL
                </Label>
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
                <div>
                  <Label
                    htmlFor="mobileNumber"
                    className="flex items-center gap-1"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" /> Mobile
                    Number
                  </Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    placeholder="e.g., +919876543210"
                    value={userFormData.mobileNumber || ''}
                    onChange={handleUserChange}
                  />
                </div>
              )}
            </div>

            {isJobSeeker && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div>
                    <Label
                      htmlFor="dateOfBirth"
                      className="flex items-center gap-1"
                    >
                      <Cake className="h-4 w-4 text-muted-foreground" /> Date of
                      Birth
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!userFormData.dateOfBirth && 'text-muted-foreground'}`}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {dobDate ? (
                            format(dobDate, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dobDate}
                          onSelect={handleDateOfBirthChange}
                          captionLayout="dropdown"
                          fromYear={1950}
                          toYear={new Date().getFullYear() - 10}
                          defaultMonth={dobDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="gender" className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />{' '}
                      Gender
                    </Label>
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
                    <Label
                      htmlFor="homeCity"
                      className="flex items-center gap-1"
                    >
                      <Home className="h-4 w-4 text-muted-foreground" /> Home
                      City
                    </Label>
                    <Input
                      id="homeCity"
                      name="homeCity"
                      value={userFormData.homeCity || ''}
                      onChange={handleUserChange}
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="homeState"
                      className="flex items-center gap-1"
                    >
                      <Home className="h-4 w-4 text-muted-foreground" /> Home
                      State
                    </Label>
                    <Input
                      id="homeState"
                      name="homeState"
                      value={userFormData.homeState || ''}
                      onChange={handleUserChange}
                      placeholder="e.g., Maharashtra"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {isJobSeeker && (
        <>
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <Sparkles /> Professional Details
              </CardTitle>
              <CardDescription>
                Highlight your professional summary, skills, total experience,
                and compensation expectations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="headline">
                    Headline (Your Professional Tagline)
                  </Label>
                  <Input
                    id="headline"
                    name="headline"
                    placeholder="e.g., Senior Software Engineer | AI Enthusiast"
                    value={userFormData.headline || ''}
                    onChange={handleUserChange}
                  />
                </div>
                <div>
                  <Label htmlFor="parsedResumeText">
                    Professional Summary (from Resume or Manually Entered)
                  </Label>
                  <Textarea
                    id="parsedResumeText"
                    name="parsedResumeText"
                    value={userFormData.parsedResumeText || ''}
                    onChange={handleUserChange}
                    rows={6}
                    placeholder="A brief overview of your career, skills, and goals. Often extracted from your resume."
                  />
                </div>
                <div>
                  <Label
                    htmlFor="skillsInput"
                    className="flex items-center gap-1.5"
                  >
                    <Award /> Key Skills (comma-separated)
                  </Label>
                  <Input
                    id="skillsInput"
                    name="skillsInput"
                    value={skillsInput}
                    onChange={handleSkillsChange}
                    placeholder="e.g., React, Node.js, Project Management, Agile"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div>
                    <Label
                      htmlFor="totalYearsExperience"
                      className="flex items-center gap-1.5"
                    >
                      <Clock /> Total Years of Experience
                    </Label>
                    <Input
                      id="totalYearsExperience"
                      name="totalYearsExperience"
                      type="number"
                      placeholder="e.g., 5"
                      value={
                        userFormData.totalYearsExperience === undefined
                          ? ''
                          : userFormData.totalYearsExperience
                      }
                      onChange={handleUserChange}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalMonthsExperience">
                      Total Months (0-11)
                    </Label>
                    <Input
                      id="totalMonthsExperience"
                      name="totalMonthsExperience"
                      type="number"
                      placeholder="e.g., 6"
                      value={
                        userFormData.totalMonthsExperience === undefined
                          ? ''
                          : userFormData.totalMonthsExperience
                      }
                      onChange={handleUserChange}
                      min="0"
                      max="11"
                    />
                  </div>
                </div>
                <hr />
                <h3 className="text-lg font-semibold flex items-center gap-1.5 pt-2">
                  <DollarSign /> Compensation
                </h3>
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
                      value={
                        userFormData.currentCTCValue === undefined
                          ? ''
                          : userFormData.currentCTCValue
                      }
                      onChange={handleUserChange}
                    />
                    {userFormData.currentCTCValue !== undefined && (
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
                      checked={userFormData.currentCTCConfidential || false}
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
                      value={
                        userFormData.expectedCTCValue === undefined
                          ? ''
                          : userFormData.expectedCTCValue
                      }
                      onChange={handleUserChange}
                    />
                    {userFormData.expectedCTCValue !== undefined && (
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
                      checked={userFormData.expectedCTCNegotiable || false}
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
              </div>
            </CardContent>
          </Card>

          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <Briefcase /> Work Experience
              </CardTitle>
              <CardDescription>
                Detail your professional background.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(userFormData.experiences || []).map((exp, index) => {
                  const expStartDateObj =
                    exp.startDate &&
                    isValid(parse(exp.startDate, 'yyyy-MM-dd', new Date()))
                      ? parse(exp.startDate, 'yyyy-MM-dd', new Date())
                      : undefined;

                  const expEndDateObj =
                    exp.endDate &&
                    isValid(parse(exp.endDate, 'yyyy-MM-dd', new Date()))
                      ? parse(exp.endDate, 'yyyy-MM-dd', new Date())
                      : undefined;
                  return (
                    <Card key={exp.id} className="p-4 bg-muted/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <Label htmlFor={`exp-role-${exp.id}`}>Job Role</Label>
                          <Input
                            id={`exp-role-${exp.id}`}
                            value={exp.jobRole || ''}
                            onChange={(e) =>
                              handleArrayFieldChange(
                                'experiences',
                                index,
                                'jobRole',
                                e.target.value
                              )
                            }
                            placeholder="e.g., Software Engineer"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`exp-company-${exp.id}`}>
                            Company Name
                          </Label>
                          <Input
                            id={`exp-company-${exp.id}`}
                            value={exp.companyName || ''}
                            onChange={(e) =>
                              handleArrayFieldChange(
                                'experiences',
                                index,
                                'companyName',
                                e.target.value
                              )
                            }
                            placeholder="e.g., Tech Solutions Inc."
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <Label htmlFor={`exp-start-${exp.id}`}>
                            Start Date
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${!exp.startDate && 'text-muted-foreground'}`}
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {expStartDateObj ? (
                                  format(expStartDateObj, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={expStartDateObj}
                                onSelect={(date) =>
                                  handleExperienceDateChange(
                                    index,
                                    'startDate',
                                    date
                                  )
                                }
                                captionLayout="dropdown"
                                fromYear={1980}
                                toYear={new Date().getFullYear()}
                                defaultMonth={expStartDateObj}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label htmlFor={`exp-end-${exp.id}`}>End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                disabled={exp.currentlyWorking}
                                className={`w-full justify-start text-left font-normal ${!exp.endDate && !exp.currentlyWorking && 'text-muted-foreground'}`}
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {exp.currentlyWorking
                                  ? 'Present'
                                  : expEndDateObj
                                    ? format(expEndDateObj, 'PPP')
                                    : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={expEndDateObj}
                                disabled={exp.currentlyWorking}
                                onSelect={(date) =>
                                  handleExperienceDateChange(
                                    index,
                                    'endDate',
                                    date
                                  )
                                }
                                captionLayout="dropdown"
                                fromYear={1980}
                                toYear={new Date().getFullYear() + 10}
                                defaultMonth={expEndDateObj}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`exp-current-${exp.id}`}
                            checked={exp.currentlyWorking || false}
                            onCheckedChange={(checked) =>
                              handleArrayFieldChange(
                                'experiences',
                                index,
                                'currentlyWorking',
                                Boolean(checked)
                              )
                            }
                          />
                          <Label htmlFor={`exp-current-${exp.id}`}>
                            I currently work here
                          </Label>
                        </div>
                      </div>
                      <div className="mb-3">
                        <Label htmlFor={`exp-ctc-${exp.id}`}>
                          Annual CTC (INR, Optional)
                        </Label>
                        <Input
                          id={`exp-ctc-${exp.id}`}
                          type="number"
                          value={
                            exp.annualCTC === undefined ? '' : exp.annualCTC
                          }
                          onChange={(e) =>
                            handleArrayFieldChange(
                              'experiences',
                              index,
                              'annualCTC',
                              e.target.value,
                              'number'
                            )
                          }
                          placeholder="e.g., 1200000"
                        />
                        {exp.annualCTC !== undefined && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Formatted: {formatCurrencyINR(exp.annualCTC)}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`exp-desc-${exp.id}`}>
                          Description / Responsibilities
                        </Label>
                        <Textarea
                          id={`exp-desc-${exp.id}`}
                          value={exp.description || ''}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              'experiences',
                              index,
                              'description',
                              e.target.value
                            )
                          }
                          rows={3}
                          placeholder="Describe your role and achievements..."
                        />
                      </div>
                      {(userFormData.experiences || []).length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeArrayItem('experiences', exp.id)
                          }
                          className="mt-3 text-destructive hover:text-destructive flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" /> Remove Experience
                        </Button>
                      )}
                    </Card>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    addArrayItem('experiences', createEmptyExperience)
                  }
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" /> Add Another Experience
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <GraduationCap /> Education
              </CardTitle>
              <CardDescription>
                Your educational qualifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(userFormData.educations || []).map((edu, index) => (
                  <Card key={edu.id} className="p-4 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <Label htmlFor={`edu-level-${edu.id}`}>Level</Label>
                        <Select
                          value={edu.level || 'Graduate'}
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
                      <div>
                        <Label htmlFor={`edu-degree-${edu.id}`}>
                          Degree/Certificate Name
                        </Label>
                        <Input
                          id={`edu-degree-${edu.id}`}
                          value={edu.degreeName || ''}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              'educations',
                              index,
                              'degreeName',
                              e.target.value
                            )
                          }
                          placeholder="e.g., B.Tech, MBA"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <Label htmlFor={`edu-specialization-${edu.id}`}>
                          Specialization/Major
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
                          placeholder="e.g., Computer Science, Marketing"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edu-institute-${edu.id}`}>
                          Institute Name
                        </Label>
                        <Input
                          id={`edu-institute-${edu.id}`}
                          value={edu.instituteName || ''}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              'educations',
                              index,
                              'instituteName',
                              e.target.value
                            )
                          }
                          placeholder="e.g., University of Technology"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 items-end">
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
                      <div>
                        <Label htmlFor={`edu-startYear-${edu.id}`}>
                          Start Year
                        </Label>
                        <Input
                          id={`edu-startYear-${edu.id}`}
                          type="number"
                          placeholder="YYYY"
                          value={
                            edu.startYear === undefined ? '' : edu.startYear
                          }
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
                        <Label htmlFor={`edu-endYear-${edu.id}`}>
                          End Year
                        </Label>
                        <Input
                          id={`edu-endYear-${edu.id}`}
                          type="number"
                          placeholder="YYYY"
                          value={edu.endYear === undefined ? '' : edu.endYear}
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
                    <div className="flex items-center space-x-2 mb-3">
                      <Checkbox
                        id={`edu-relevant-${edu.id}`}
                        checked={Boolean(edu.isMostRelevant)}
                        onCheckedChange={(checked) =>
                          handleArrayFieldChange(
                            'educations',
                            index,
                            'isMostRelevant',
                            Boolean(checked)
                          )
                        }
                      />
                      <Label htmlFor={`edu-relevant-${edu.id}`}>
                        This is my most relevant/important educational
                        qualification
                      </Label>
                    </div>
                    <div>
                      <Label htmlFor={`edu-desc-${edu.id}`}>
                        Description (Optional)
                      </Label>
                      <Textarea
                        id={`edu-desc-${edu.id}`}
                        value={edu.description || ''}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            'educations',
                            index,
                            'description',
                            e.target.value
                          )
                        }
                        rows={2}
                        placeholder="Any additional details, achievements, or notes..."
                      />
                    </div>
                    {(userFormData.educations || []).length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeArrayItem('educations', edu.id)
                        }
                        className="mt-3 text-destructive hover:text-destructive flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> Remove Education
                      </Button>
                    )}
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    addArrayItem('educations', createEmptyEducation)
                  }
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" /> Add Another Education
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <LanguagesIcon /> Languages
              </CardTitle>
              <CardDescription>
                Languages you know and your proficiency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(userFormData.languages || []).map((lang, index) => (
                  <Card key={lang.id} className="p-4 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <Label htmlFor={`lang-name-${lang.id}`}>
                          Language Name
                        </Label>
                        <Input
                          id={`lang-name-${lang.id}`}
                          value={lang.languageName || ''}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              'languages',
                              index,
                              'languageName',
                              e.target.value
                            )
                          }
                          placeholder="e.g., English, Hindi"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`lang-proficiency-${lang.id}`}>
                          Proficiency
                        </Label>
                        <Select
                          value={lang.proficiency || 'Beginner'}
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
                          checked={Boolean(lang.canRead)}
                          onCheckedChange={(checked) =>
                            handleArrayFieldChange(
                              'languages',
                              index,
                              'canRead',
                              Boolean(checked)
                            )
                          }
                        />
                        <Label htmlFor={`lang-read-${lang.id}`}>Read</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-write-${lang.id}`}
                          checked={Boolean(lang.canWrite)}
                          onCheckedChange={(checked) =>
                            handleArrayFieldChange(
                              'languages',
                              index,
                              'canWrite',
                              Boolean(checked)
                            )
                          }
                        />
                        <Label htmlFor={`lang-write-${lang.id}`}>Write</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-speak-${lang.id}`}
                          checked={Boolean(lang.canSpeak)}
                          onCheckedChange={(checked) =>
                            handleArrayFieldChange(
                              'languages',
                              index,
                              'canSpeak',
                              Boolean(checked)
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
                        className="mt-2 text-destructive hover:text-destructive flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> Remove Language
                      </Button>
                    )}
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    addArrayItem('languages', createEmptyLanguage)
                  }
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" /> Add Another Language
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline">
                Preferences & Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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
                      value={
                        userFormData.jobSearchStatus || 'activelyLooking'
                      }
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
                    checked={Boolean(userFormData.isProfileSearchable)}
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
              </div>
            </CardContent>
          </Card>
        </>
      )}

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
                {(companyFormData.status || 'pending').toUpperCase()}
              </Badge>
            </div>
            {(companyFormData.status === 'rejected' ||
              companyFormData.status === 'suspended') &&
              company?.moderationReason && (
                <p className="text-sm text-destructive mt-1">
                  Admin Reason: {company.moderationReason}
                </p>
              )}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="name"
                  value={companyFormData.name || ''}
                  onChange={handleCompanyChange}
                  required
                  placeholder="e.g., Your Company Inc."
                />
              </div>
              <div>
                <Label htmlFor="companyWebsiteUrl">
                  Company Website URL
                </Label>
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
                  placeholder="Briefly describe your company, its mission, and culture..."
                />
              </div>
              <hr className="my-6" />
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
                              rec.avatarUrl ||
                              `https://placehold.co/40x40.png`
                            }
                            alt={rec.name || 'Recruiter'}
                            data-ai-hint="recruiter avatar"
                          />
                          <AvatarFallback>
                            {rec.name?.[0]?.toUpperCase() || 'R'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {rec.name || 'N/A'}{' '}
                            {rec.uid === user.uid && '(You)'}
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
                    No recruiters currently associated with this company
                    besides yourself.
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  <Info className="inline h-3 w-3 mr-1" />
                  Recruiter management (inviting, removing) is handled by site
                  administrators.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isLoading || authLoading}
          className="text-lg py-3 px-6"
        >
          {(isLoading || authLoading) && (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          )}
          <Save className="mr-2 h-5 w-5" />
          Save All Changes
        </Button>
      </div>
    </form>
  );
}
