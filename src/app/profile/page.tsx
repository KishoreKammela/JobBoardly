'use client';
import { UserProfileForm } from '@/components/UserProfileForm';
// ResumeUploadForm is specific to job seekers, so it might be conditionally rendered within UserProfileForm or this page
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const pageTitle = () => {
    if (!user) return 'Profile';
    if (user.role === 'jobSeeker') return 'My Job Seeker Profile';
    if (user.role === 'employer' && user.isCompanyAdmin)
      return 'Manage Company Profile & Your Recruiter Info';
    if (user.role === 'employer') return 'My Recruiter Profile';
    if (user.role === 'admin') return 'Admin Profile';
    return 'Profile';
  };

  const pageDescription = () => {
    if (!user) return 'Please log in to view your profile.';
    if (user.role === 'jobSeeker')
      return 'View and manage your account details and professional information. Upload your resume below.';
    if (user.role === 'employer' && user.isCompanyAdmin)
      return "Edit your company's public details and your personal recruiter information.";
    if (user.role === 'employer')
      return 'Manage your personal recruiter details.';
    if (user.role === 'admin')
      return 'Manage your administrator profile details.';
    return 'Manage your account details.';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">{pageTitle()}</h1>
        <p className="text-muted-foreground">{pageDescription()}</p>
      </div>
      <Separator />
      {user && <UserProfileForm />}
      {/* ResumeUploadForm is typically for job seekers. It's now integrated within UserProfileForm logic or can be added here if separated */}
      {/* If ResumeUploadForm is separate and only for job seekers:
        {user.role === 'jobSeeker' && (
          <>
            <Separator />
            <ResumeUploadForm />
          </>
        )}
      */}
    </div>
  );
}
