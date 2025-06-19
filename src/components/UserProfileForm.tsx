'use client';
import { useState, useEffect, type FormEvent } from 'react';
import type { UserProfile, Company } from '@/types';
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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Building,
  User,
  Users,
  Info,
  ShieldCheck /*, Phone*/,
} from 'lucide-react'; // Removed Phone
// import { useRouter } from 'next/navigation'; // Unused router
import {
  /*doc, getDoc, updateDoc,*/ collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'; // Removed doc, getDoc, updateDoc
import { db } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyINR } from '@/lib/utils';

export function UserProfileForm() {
  const {
    user,
    company,
    updateUserProfile,
    updateCompanyProfile,
    loading: authLoading,
  } = useAuth();
  const { toast } = useToast();
  // const router = useRouter(); // Unused router

  const initialUserFormData: Partial<UserProfile> = {
    name: '',
    avatarUrl: '',
    headline: '',
    skills: [],
    experience: '',
    education: '',
    mobileNumber: '',
    availability: 'Flexible',
    portfolioUrl: '',
    linkedinUrl: '',
    preferredLocations: [],
    jobSearchStatus: 'activelyLooking',
    desiredSalary: undefined,
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
        experience: user.experience || '',
        education: user.education || '',
        mobileNumber: user.mobileNumber || '',
        availability: user.availability || 'Flexible',
        portfolioUrl: user.portfolioUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        preferredLocations: user.preferredLocations || [],
        jobSearchStatus: user.jobSearchStatus || 'activelyLooking',
        desiredSalary: user.desiredSalary,
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
      // No user, reset to defaults.
      // Keeping initialUserFormData and initialCompanyFormData separate from this logic to avoid them being in deps array
      setUserFormData({
        name: '',
        avatarUrl: '',
        headline: '',
        skills: [],
        experience: '',
        education: '',
        mobileNumber: '',
        availability: 'Flexible',
        portfolioUrl: '',
        linkedinUrl: '',
        preferredLocations: [],
        jobSearchStatus: 'activelyLooking',
        desiredSalary: undefined,
      });
      setCompanyFormData({
        name: '',
        description: '',
        websiteUrl: '',
        logoUrl: '',
        bannerImageUrl: '',
        status: 'pending',
      });
      setSkillsInput('');
      setLocationsInput('');
      setCompanyRecruiters([]);
    }
    // initialUserFormData and initialCompanyFormData are stable and don't need to be in deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, company, toast]);

  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]:
        name === 'desiredSalary'
          ? value
            ? parseFloat(value)
            : undefined
          : value,
    }));
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

  const handleSelectChange = (name: keyof UserProfile, value: string) => {
    setUserFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const userUpdatePayload: Partial<UserProfile> = {
        name: userFormData.name,
        avatarUrl: userFormData.avatarUrl,
      };
      if (user.role === 'jobSeeker') {
        Object.assign(userUpdatePayload, {
          headline: userFormData.headline,
          skills: userFormData.skills,
          experience: userFormData.experience,
          education: userFormData.education,
          mobileNumber: userFormData.mobileNumber,
          availability: userFormData.availability,
          portfolioUrl: userFormData.portfolioUrl,
          linkedinUrl: userFormData.linkedinUrl,
          preferredLocations: userFormData.preferredLocations,
          jobSearchStatus: userFormData.jobSearchStatus,
          desiredSalary: userFormData.desiredSalary,
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
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <User />{' '}
            {isJobSeeker ? 'Your Job Seeker Profile' : 'Your Recruiter Profile'}
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
                  <Label htmlFor="desiredSalary">
                    Desired Salary (Annual, INR)
                  </Label>
                  <Input
                    id="desiredSalary"
                    name="desiredSalary"
                    type="number"
                    placeholder="e.g., 1200000 for 12 LPA"
                    value={userFormData.desiredSalary || ''}
                    onChange={handleUserChange}
                  />
                  {userFormData.desiredSalary && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Formatted: {formatCurrencyINR(userFormData.desiredSalary)}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  name="skills"
                  value={skillsInput}
                  onChange={handleSkillsChange}
                  placeholder="e.g., React, Node.js, Project Management"
                />
              </div>
              <div>
                <Label htmlFor="experience">
                  Experience (Markdown supported)
                </Label>
                <Textarea
                  id="experience"
                  name="experience"
                  value={userFormData.experience || ''}
                  onChange={handleUserChange}
                  rows={10}
                  placeholder="Describe your professional experience..."
                />
              </div>
              <div>
                <Label htmlFor="education">
                  Education (Markdown supported)
                </Label>
                <Textarea
                  id="education"
                  name="education"
                  value={userFormData.education || ''}
                  onChange={handleUserChange}
                  rows={4}
                  placeholder="e.g., B.S. Computer Science - XYZ University"
                />
              </div>
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
                      handleSelectChange('jobSearchStatus', value)
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
                      handleSelectChange('availability', value)
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
            </>
          )}
        </CardContent>
      </Card>

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
                  affect your public company page.
                </CardDescription>
              </div>
              <Badge
                variant={
                  companyFormData.status === 'approved'
                    ? 'default'
                    : companyFormData.status === 'rejected'
                      ? 'destructive'
                      : 'secondary'
                }
                className="text-sm"
              >
                <ShieldCheck className="mr-1.5 h-4 w-4" />{' '}
                {companyFormData.status?.toUpperCase()}
              </Badge>
            </div>
            {companyFormData.status === 'rejected' &&
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
                <Users /> Recruiters ({companyRecruiters.length} / 3)
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
                Currently, you can have up to 3 recruiters (including admins).
                Full recruiter management features (inviting, removing) will be
                available soon.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 text-right">
        <Button
          type="submit"
          disabled={isLoading || authLoading}
          className="w-full sm:w-auto text-lg py-6 px-8"
        >
          {(isLoading || authLoading) && (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          )}
          Save All Changes
        </Button>
      </div>
    </form>
  );
}
