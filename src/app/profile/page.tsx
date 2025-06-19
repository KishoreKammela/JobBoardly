
'use client';
import { UserProfileForm } from '@/components/UserProfileForm';
import { ResumeUploadForm } from '@/components/ResumeUploadForm';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Download, Eye } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { PrintableProfileComponent } from '@/components/PrintableProfile';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const printableProfileRef = useRef<HTMLDivElement>(null);

  const handlePrintProfile = useReactToPrint({
    content: () => printableProfileRef.current,
    documentTitle: `${user?.name || 'UserProfile'}_JobBoardly`,
    onPrintError: (_error: Error) =>
      alert('There was an error printing the profile. Please try again.'),
  });

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
    if (user.role === 'jobSeeker') return 'My Profile';
    if (user.role === 'employer' && user.isCompanyAdmin)
      return 'Manage Company Profile & Your Recruiter Info';
    if (user.role === 'employer') return 'My Recruiter Profile';
    if (user.role === 'admin' || user.role === 'superAdmin')
      return `${user.role === 'superAdmin' ? 'Super Admin' : 'Admin'} Profile`;
    return 'Profile';
  };

  const pageDescription = () => {
    if (!user) return 'Please log in to view your profile.';
    if (user.role === 'jobSeeker')
      return 'View and manage your account details and professional information. Upload your resume first for AI parsing to help pre-fill sections.';
    if (user.role === 'employer' && user.isCompanyAdmin)
      return "Edit your company's public details and your personal recruiter information.";
    if (user.role === 'employer')
      return 'Manage your personal recruiter details.';
    if (user.role === 'admin' || user.role === 'superAdmin')
      return `Manage your ${user.role === 'superAdmin' ? 'Super Admin' : 'Admin'} profile details.`;
    return 'Manage your account details.';
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
        {user.role === 'jobSeeker' && (
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
