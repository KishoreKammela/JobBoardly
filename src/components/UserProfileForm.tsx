
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import type { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter

export function UserProfileForm() {
  const { user, updateUserProfile, loading: authLoading } = useAuth(); // Using updateUserProfile
  const { toast } = useToast();
  const router = useRouter(); // Initialize router
  
  const initialFormData: Partial<UserProfile> = {
    name: '',
    email: '', // email is not directly editable here usually
    avatarUrl: '',
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
    companyName: '', // For employer
    companyWebsite: '', // For employer
    companyDescription: '', // For employer
  };

  const [formData, setFormData] = useState<Partial<UserProfile>>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [skillsInput, setSkillsInput] = useState('');
  const [locationsInput, setLocationsInput] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
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
        // For employer, name is companyName from user object
        companyName: user.role === 'employer' ? user.name : undefined, 
        companyWebsite: user.role === 'employer' ? user.companyWebsite : undefined,
        companyDescription: user.role === 'employer' ? user.companyDescription : undefined,
      });
      setSkillsInput((user.skills || []).join(', '));
      setLocationsInput((user.preferredLocations || []).join(', '));
    } else {
      setFormData(initialFormData);
      setSkillsInput('');
      setLocationsInput('');
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'desiredSalary' ? (value ? parseFloat(value) : undefined) : value }));
  };
  
  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSkillsInput(val);
    setFormData(prev => ({ ...prev, skills: val.split(',').map(skill => skill.trim()).filter(skill => skill) }));
  };

  const handleLocationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocationsInput(val);
    setFormData(prev => ({ ...prev, preferredLocations: val.split(',').map(loc => loc.trim()).filter(loc => loc) }));
  };

  const handleSelectChange = (name: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    
    // Prepare only fields that are relevant to the user's role and defined in formData
    const updatePayload: Partial<UserProfile> = {
      name: formData.name, // This will be full name for seeker, company name for employer
      avatarUrl: formData.avatarUrl,
    };

    if (user.role === 'jobSeeker') {
      updatePayload.headline = formData.headline;
      updatePayload.skills = formData.skills;
      updatePayload.experience = formData.experience;
      updatePayload.education = formData.education;
      updatePayload.availability = formData.availability;
      updatePayload.portfolioUrl = formData.portfolioUrl;
      updatePayload.linkedinUrl = formData.linkedinUrl;
      updatePayload.preferredLocations = formData.preferredLocations;
      updatePayload.jobSearchStatus = formData.jobSearchStatus;
      updatePayload.desiredSalary = formData.desiredSalary;
    } else if (user.role === 'employer') {
      // 'name' for employer is company name, already included
      updatePayload.companyWebsite = formData.companyWebsite;
      updatePayload.companyDescription = formData.companyDescription;
    }
    
    try {
        await updateUserProfile(updatePayload);
        toast({
          title: 'Profile Updated',
          description: 'Your profile information has been successfully updated.',
        });
        if (user.role === 'jobSeeker') {
          router.push('/jobs'); // Redirect to job listings for job seekers
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
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
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

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">{isJobSeeker ? "Your Job Seeker Profile" : "Your Company Profile"}</CardTitle>
        <CardDescription>Manage your personal and professional details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">{isJobSeeker ? "Full Name" : "Company Name"}</Label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" value={formData.email || user.email || ''} readOnly disabled className="bg-muted/50" />
            </div>
          </div>
          <div>
            <Label htmlFor="avatarUrl">{isJobSeeker ? "Avatar URL" : "Company Logo URL"}</Label>
            <Input id="avatarUrl" name="avatarUrl" placeholder="https://example.com/image.png" value={formData.avatarUrl || ''} onChange={handleChange} />
          </div>

          {isJobSeeker && (
            <>
              <div>
                <Label htmlFor="headline">Headline</Label>
                <Input id="headline" name="headline" placeholder="e.g., Senior Software Engineer | AI Enthusiast" value={formData.headline || ''} onChange={handleChange} />
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
                  value={formData.experience || ''}
                  onChange={handleChange}
                  rows={10}
                  placeholder="Describe your professional experience..."
                />
              </div>
              <div>
                <Label htmlFor="education">Education (Markdown supported)</Label>
                <Textarea
                  id="education"
                  name="education"
                  value={formData.education || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="e.g., B.S. Computer Science - XYZ University"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                  <Input id="portfolioUrl" name="portfolioUrl" placeholder="https://yourportfolio.com" value={formData.portfolioUrl || ''} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                  <Input id="linkedinUrl" name="linkedinUrl" placeholder="https://linkedin.com/in/yourprofile" value={formData.linkedinUrl || ''} onChange={handleChange} />
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
                  <Select value={formData.jobSearchStatus || 'activelyLooking'} onValueChange={(value) => handleSelectChange('jobSearchStatus', value)}>
                    <SelectTrigger id="jobSearchStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activelyLooking">Actively Looking</SelectItem>
                      <SelectItem value="openToOpportunities">Open to Opportunities</SelectItem>
                      <SelectItem value="notLooking">Not Looking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="desiredSalary">Desired Salary (Annual)</Label>
                  <Input id="desiredSalary" name="desiredSalary" type="number" placeholder="e.g., 90000" value={formData.desiredSalary || ''} onChange={handleChange} />
                </div>
              </div>
              <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select value={formData.availability || 'Flexible'} onValueChange={(value) => handleSelectChange('availability', value)}>
                    <SelectTrigger id="availability">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
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

          {!isJobSeeker && user.role === 'employer' && ( 
            <>
              <div>
                <Label htmlFor="companyWebsite">Company Website</Label>
                <Input id="companyWebsite" name="companyWebsite" placeholder="https://yourcompany.com" value={formData.companyWebsite || ''} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="companyDescription">Company Description (Markdown supported)</Label>
                <Textarea
                  id="companyDescription"
                  name="companyDescription"
                  value={formData.companyDescription || ''}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Briefly describe your company..."
                />
              </div>
            </>
          )}

          <Button type="submit" disabled={isLoading || authLoading} className="w-full sm:w-auto">
            {(isLoading || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
