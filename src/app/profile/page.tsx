
"use client";
import { UserProfileForm } from '@/components/UserProfileForm';
import { ResumeUploadForm } from '@/components/ResumeUploadForm';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  const isJobSeeker = user?.role === 'jobSeeker';
  const isEmployer = user?.role === 'employer';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">
          {isJobSeeker && "My Profile"}
          {isEmployer && "Company Profile"}
          {!user && "Profile"} 
        </h1>
        <p className="text-muted-foreground">
          {isJobSeeker && "View and manage your account details and professional information."}
          {isEmployer && "View and manage your company's details and information."}
          {!user && "Please log in to view your profile."}
        </p>
      </div>
      <Separator />
      {user && <UserProfileForm />}
      
      {isJobSeeker && (
        <>
          <Separator />
          <ResumeUploadForm />
        </>
      )}
    </div>
  );
}
