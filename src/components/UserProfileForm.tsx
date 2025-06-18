
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import type { UserProfile, Company } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function UserProfileForm() {
  const { user, company, updateUserProfile, updateCompanyProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const initialUserFormData: Partial<UserProfile> = {
    name: '', // User's personal name
    avatarUrl: '', // User's personal avatar
    // Job seeker fields
    headline: '',
    skills: [],
    experience: '',
    education: '',
    availability: 'Flexible',
    portfolioUrl: '',
    linkedinUrl: '',
    preferredLocations: [],
    jobSearchStatus: 'activelyLooking',
    desiredSalary: undefined,
  };

  const initialCompanyFormData: Partial<Company> = {
    name: '', // Company name
    description: '',
    websiteUrl: '',
    logoUrl: '',
    bannerImageUrl: '',
  };

  const [userFormData, setUserFormData] = useState<Partial<UserProfile>>(initialUserFormData);
  const [companyFormData, setCompanyFormData] = useState<Partial<Company>>(initialCompanyFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [skillsInput, setSkillsInput] = useState('');
  const [locationsInput, setLocationsInput] = useState('');

  useEffect(() => {
    if (user) {
      setUserFormData({
        name: user.name || '',
        avatarUrl: user.avatarUrl || '',
        headline: user.headline || '',
        skills: user.skills || [],
        experience: user.experience || '',
        education: user.education || '',
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
        });
      }
    } else {
      setUserFormData(initialUserFormData);
      setCompanyFormData(initialCompanyFormData);
      setSkillsInput('');
      setLocationsInput('');
    }
  }, [user, company]);

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({ ...prev, [name]: name === 'desiredSalary' ? (value ? parseFloat(value) : undefined) : value }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSkillsInput(val);
    setUserFormData(prev => ({ ...prev, skills: val.split(',').map(skill => skill.trim()).filter(skill => skill) }));
  };

  const handleLocationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocationsInput(val);
    setUserFormData(prev => ({ ...prev, preferredLocations: val.split(',').map(loc => loc.trim()).filter(loc => loc) }));
  };

  const handleSelectChange = (name: keyof UserProfile, value: string) => {
    setUserFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      // Update user's personal profile
      const userUpdatePayload: Partial<UserProfile> = {
        name: userFormData.name,
        avatarUrl: userFormData.avatarUrl,
      };
      if (user.role === 'jobSeeker') {
        userUpdatePayload.headline = userFormData.headline;
        userUpdatePayload.skills = userFormData.skills;
        userUpdatePayload.experience = userFormData.experience;
        userUpdatePayload.education = userFormData.education;
        userUpdatePayload.availability = userFormData.availability;
        userUpdatePayload.portfolioUrl = userFormData.portfolioUrl;
        userUpdatePayload.linkedinUrl = userFormData.linkedinUrl;
        userUpdatePayload.preferredLocations = userFormData.preferredLocations;
        userUpdatePayload.jobSearchStatus = userFormData.jobSearchStatus;
        userUpdatePayload.desiredSalary = userFormData.desiredSalary;
      }
      await updateUserProfile(userUpdatePayload);

      // If employer and company admin, update company profile
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
      if (user.role === 'jobSeeker') {
        router.push('/jobs');
      } else if (user.role === 'employer') {
        router.push('/employer/posted-jobs');
      }
    } catch (error) {
        console.error("Profile update error:", error);
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
        <CardHeader><CardTitle>Loading Profile...</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent><p>Please log in to view and edit your profile.</p></CardContent>
      </Card>
    );
  }

  const isJobSeeker = user.role === 'jobSeeker';
  const isCompanyAdmin = user.role === 'employer' && user.isCompanyAdmin;

  return (
    <div className="space-y-8">
      {/* User's Personal Profile Section */}
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <User /> {isJobSeeker ? "Your Job Seeker Profile" : "Your Recruiter Profile"}
          </CardTitle>
          <CardDescription>Manage your personal details. {isCompanyAdmin && "Company details are managed below."}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="userName">Full Name</Label>
                <Input id="userName" name="name" value={userFormData.name || ''} onChange={handleUserChange} required />
              </div>
              <div>
                <Label htmlFor="userEmail">Email Address</Label>
                <Input id="userEmail" name="email" type="email" value={user.email || ''} readOnly disabled className="bg-muted/50" />
              </div>
            </div>
            <div>
              <Label htmlFor="userAvatarUrl">Your Avatar URL</Label>
              <Input id="userAvatarUrl" name="avatarUrl" placeholder="https://example.com/your-avatar.png" value={userFormData.avatarUrl || ''} onChange={handleUserChange} />
            </div>

            {isJobSeeker && (
              <>
                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input id="headline" name="headline" placeholder="e.g., Senior Software Engineer | AI Enthusiast" value={userFormData.headline || ''} onChange={handleUserChange} />
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
                  <Label htmlFor="experience">Experience (Markdown supported)</Label>
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
                  <Label htmlFor="education">Education (Markdown supported)</Label>
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
                    <Input id="portfolioUrl" name="portfolioUrl" placeholder="https://yourportfolio.com" value={userFormData.portfolioUrl || ''} onChange={handleUserChange} />
                  </div>
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                    <Input id="linkedinUrl" name="linkedinUrl" placeholder="https://linkedin.com/in/yourprofile" value={userFormData.linkedinUrl || ''} onChange={handleUserChange} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="preferredLocations">Preferred Locations (comma-separated)</Label>
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
                    <Select value={userFormData.jobSearchStatus || 'activelyLooking'} onValueChange={(value) => handleSelectChange('jobSearchStatus', value)}>
                      <SelectTrigger id="jobSearchStatus"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activelyLooking">Actively Looking</SelectItem>
                        <SelectItem value="openToOpportunities">Open to Opportunities</SelectItem>
                        <SelectItem value="notLooking">Not Looking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="desiredSalary">Desired Salary (Annual)</Label>
                    <Input id="desiredSalary" name="desiredSalary" type="number" placeholder="e.g., 90000" value={userFormData.desiredSalary || ''} onChange={handleUserChange} />
                  </div>
                </div>
                <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Select value={userFormData.availability || 'Flexible'} onValueChange={(value) => handleSelectChange('availability', value)}>
                      <SelectTrigger id="availability"><SelectValue placeholder="Select availability" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Immediate">Immediate</SelectItem>
                        <SelectItem value="2 Weeks Notice">2 Weeks Notice</SelectItem>
                        <SelectItem value="1 Month Notice">1 Month Notice</SelectItem>
                        <SelectItem value="Flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </>
            )}
            {/* Save button for personal profile changes */}
            {!isCompanyAdmin && (
                 <Button type="submit" disabled={isLoading || authLoading} className="w-full sm:w-auto mt-4">
                    {(isLoading || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Personal Profile
                </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Company Profile Section - only for Company Admins */}
      {isCompanyAdmin && company && user.companyId && (
        <Card className="w-full shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center gap-2">
                <Building /> Company Profile
            </CardTitle>
            <CardDescription>Manage your company's public information. Changes here affect your public company page.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6"> {/* Submit still calls the main handleSubmit */}
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" name="name" value={companyFormData.name || ''} onChange={handleCompanyChange} required />
              </div>
              <div>
                <Label htmlFor="companyWebsiteUrl">Company Website URL</Label>
                <Input id="companyWebsiteUrl" name="websiteUrl" placeholder="https://yourcompany.com" value={companyFormData.websiteUrl || ''} onChange={handleCompanyChange} />
              </div>
              <div>
                <Label htmlFor="companyLogoUrl">Company Logo URL</Label>
                <Input id="companyLogoUrl" name="logoUrl" placeholder="https://example.com/logo.png" value={companyFormData.logoUrl || ''} onChange={handleCompanyChange} />
              </div>
              <div>
                <Label htmlFor="companyBannerImageUrl">Company Banner Image URL</Label>
                <Input id="companyBannerImageUrl" name="bannerImageUrl" placeholder="https://example.com/banner.png" value={companyFormData.bannerImageUrl || ''} onChange={handleCompanyChange} />
              </div>
              <div>
                <Label htmlFor="companyDescription">Company Description (Markdown supported)</Label>
                <Textarea
                  id="companyDescription"
                  name="description"
                  value={companyFormData.description || ''}
                  onChange={handleCompanyChange}
                  rows={6}
                  placeholder="Briefly describe your company..."
                />
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* General Save Button - handles both user and company saves if applicable */}
      <div className="mt-8">
        <Button onClick={handleSubmit} disabled={isLoading || authLoading} className="w-full sm:w-auto text-lg py-6 px-8">
          {(isLoading || authLoading) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Save All Changes
        </Button>
      </div>

    </div>
  );
}
