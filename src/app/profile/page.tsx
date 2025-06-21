'use client';
import { UserProfileForm } from '@/components/UserProfileForm';
import { ResumeUploadForm } from '@/components/ResumeUploadForm';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Download, Eye, AlertTriangle } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { PrintableProfileComponent } from '@/components/PrintableProfile';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, company, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const printableProfileRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrintProfile = useReactToPrint({
    content: () => printableProfileRef.current,
    documentTitle: `${user?.name || 'UserProfile'}_JobBoardly`,
    onPrintError: (_error: Error) =>
      alert('There was an error printing the profile. Please try again.'),
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to view your profile.',
        variant: 'destructive',
      });
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname, toast]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const pageTitle = () => {
    if (!user) return 'Profile';
    if (user.role === 'jobSeeker') return 'My Profile';
    if (user.role === 'employer' && user.isCompanyAdmin)
      return 'Manage Company Profile & Your Recruiter Info';
    if (user.role === 'employer') return 'My Recruiter Profile';
    if (user.role === 'admin') return 'Admin Profile';
    if (user.role === 'superAdmin') return 'Super Admin Profile';
    if (user.role === 'moderator') return 'Moderator Profile';
    return 'Profile';
  };

  const pageDescription = () => {
    if (!user) return 'Please log in to view your profile.';
    if (user.role === 'jobSeeker') {
      if (user.status === 'suspended') {
        return 'Your account is suspended. Some profile editing features are disabled.';
      }
      return 'View and manage your account details and professional information. Upload your resume first for AI parsing to help pre-fill sections.';
    }
    if (user.role === 'employer' && user.isCompanyAdmin)
      return "Edit your company's public details and your personal recruiter information.";
    if (user.role === 'employer')
      return 'Manage your personal recruiter details.';
    if (
      user.role === 'admin' ||
      user.role === 'superAdmin' ||
      user.role === 'moderator'
    )
      return `Manage your ${user.role === 'superAdmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Moderator'} profile details.`;
    return 'Manage your account details.';
  };

  const renderAccountStatusAlert = () => {
    if (user.status === 'suspended') {
      const suspendMessage =
        user.role === 'jobSeeker'
          ? 'Your account is currently suspended by an administrator. You can still view your profile and access some settings, but actions like applying for jobs or full profile editing are disabled. Please contact support for assistance.'
          : 'Your account is currently suspended. Please contact platform administrators.';
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Account Suspended</AlertTitle>
          <AlertDescription>{suspendMessage}</AlertDescription>
        </Alert>
      );
    }
    if (
      user.role === 'employer' &&
      company &&
      (company.status === 'suspended' || company.status === 'deleted')
    ) {
      const isSuspended = company.status === 'suspended';
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>
            {isSuspended
              ? 'Company Account Suspended'
              : 'Company Account Deactivated'}
          </AlertTitle>
          <AlertDescription>
            Your company&apos;s account is currently {company.status}.{' '}
            {isSuspended
              ? 'You can only edit your personal recruiter details and settings. Company profile editing and job management are disabled.'
              : 'All profile editing and company-related actions are disabled.'}{' '}
            Please contact JobBoardly support for assistance.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-headline">
            {pageTitle()}
          </h1>
          <p className="text-muted-foreground">{pageDescription()}</p>
        </div>
        {user.role === 'jobSeeker' && user.status !== 'suspended' && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handlePrintProfile}
              variant="outline"
              className="w-full sm:w-auto"
              aria-label="Download profile as PDF"
            >
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link href="/profile/preview">
                <Eye className="mr-2 h-4 w-4" /> Preview Profile
              </Link>
            </Button>
          </div>
        )}
      </div>
      <Separator />

      {renderAccountStatusAlert()}

      {user.role === 'jobSeeker' && (
        <>
          <ResumeUploadForm />
          <Separator />
        </>
      )}

      <UserProfileForm />

      {user.role === 'jobSeeker' && (
        <div style={{ display: 'none' }}>
          <PrintableProfileComponent ref={printableProfileRef} user={user} />
        </div>
      )}
    </div>
  );
}
