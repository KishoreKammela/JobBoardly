// src/app/profile/page.tsx
'use client';
import { UserProfileForm } from '@/components/UserProfileForm';
import { ResumeUploadForm } from '@/components/resume-upload-form';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { useUserProfile } from '@/contexts/UserProfile/UserProfileContext';
import {
  Loader2,
  Download,
  Eye,
  AlertTriangle,
  Briefcase,
  Users,
  FileText,
  Check,
  BarChart,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { PrintableProfile } from '@/components/printable-profile';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/contexts/Company/CompanyContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { getCompanyJobStats } from '@/services/job.services';
import {
  getCompanyApplicationStats,
  getRecentApplicationsByCompanyId,
} from '@/services/application.services';
import type { RecruitmentStats, Application } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function RecruitmentManagerDashboard({ companyId }: { companyId: string }) {
  const [stats, setStats] = useState<RecruitmentStats | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [jobStats, appStats, recentAppsData] = await Promise.all([
          getCompanyJobStats(companyId),
          getCompanyApplicationStats(companyId),
          getRecentApplicationsByCompanyId(companyId, 5),
        ]);
        setStats({ ...jobStats, ...appStats });
        setRecentApps(recentAppsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [companyId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
        <BarChart /> Recruitment Manager Dashboard
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Positions
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.openJobs ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalApplications ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Apps (7d)</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.newApplicationsLast7Days ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Candidates Hired
            </CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.applicationsByStatus?.Hired ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            The latest applications across all your company&apos;s job postings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentApps.length > 0 ? (
            <div className="space-y-4">
              {recentApps.map((app) => (
                <div key={app.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={
                        app.applicantAvatarUrl ||
                        `https://placehold.co/100x100.png`
                      }
                      alt={app.applicantName}
                    />
                    <AvatarFallback>
                      {app.applicantName?.[0] || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <Link
                        href={`/employer/candidates/${app.applicantId}`}
                        className="hover:underline text-primary"
                      >
                        {app.applicantName}
                      </Link>{' '}
                      applied for{' '}
                      <Link
                        href={`/employer/jobs/${app.jobId}/applicants`}
                        className="hover:underline"
                      >
                        {app.jobTitle}
                      </Link>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {app.applicantHeadline}
                    </p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(app.appliedAt as string), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recent applications.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const { user: userProfile, loading: profileLoading } = useUserProfile();
  const { firebaseUser, isLoggingOut, loading: authLoading } = useAuth();
  const { company } = useCompany();
  const router = useRouter();
  const pathname = usePathname();
  const printableProfileRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrintProfile = useReactToPrint({
    content: () => printableProfileRef.current,
    documentTitle: `${userProfile?.name || 'UserProfile'}_JobBoardly`,
    onPrintError: (_error: Error) =>
      alert('There was an error printing the profile. Please try again.'),
  });

  const loading = profileLoading || authLoading;

  useEffect(() => {
    if (authLoading || isLoggingOut) return;
    if (!firebaseUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to view your profile.',
        variant: 'destructive',
      });
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [firebaseUser, authLoading, router, pathname, toast, isLoggingOut]);

  if (loading || !userProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const pageTitle = () => {
    if (!userProfile) return 'Profile';
    if (userProfile.role === 'jobSeeker') return 'My Profile';
    if (userProfile.role === 'employer' && userProfile.isCompanyAdmin)
      return 'Company Admin Hub';
    if (userProfile.role === 'employer') return 'My Recruiter Profile';
    if (userProfile.role === 'admin') return 'Admin Profile';
    if (userProfile.role === 'superAdmin') return 'Super Admin Profile';
    if (userProfile.role === 'moderator') return 'Moderator Profile';
    return 'Profile';
  };

  const pageDescription = () => {
    if (!userProfile) return 'Please log in to view and edit your profile.';
    if (userProfile.role === 'jobSeeker') {
      if (userProfile.status === 'suspended') {
        return 'Your account is suspended. Some profile editing features are disabled.';
      }
      return 'View and manage your account details and professional information. Upload your resume first for AI parsing to help pre-fill sections.';
    }
    if (userProfile.role === 'employer' && userProfile.isCompanyAdmin)
      return 'Oversee company-wide recruitment metrics and manage your personal recruiter information.';
    if (userProfile.role === 'employer')
      return 'Manage your personal recruiter details.';
    if (
      userProfile.role === 'admin' ||
      userProfile.role === 'superAdmin' ||
      userProfile.role === 'moderator'
    )
      return `Manage your ${userProfile.role === 'superAdmin' ? 'Super Admin' : userProfile.role === 'admin' ? 'Admin' : 'Moderator'} profile details.`;
    return 'Manage your account details.';
  };

  const renderAccountStatusAlert = () => {
    if (userProfile.status === 'suspended') {
      const suspendMessage =
        userProfile.role === 'jobSeeker'
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
      userProfile.role === 'employer' &&
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
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-headline">
            {pageTitle()}
          </h1>
          <p className="text-muted-foreground">{pageDescription()}</p>
        </div>
        {userProfile.role === 'jobSeeker' &&
          userProfile.status !== 'suspended' && (
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

      {userProfile.role === 'employer' &&
        userProfile.isCompanyAdmin &&
        userProfile.companyId && (
          <RecruitmentManagerDashboard companyId={userProfile.companyId} />
        )}

      {userProfile.role === 'jobSeeker' && (
        <>
          <ResumeUploadForm />
          <Separator />
        </>
      )}

      <UserProfileForm />

      {userProfile.role === 'jobSeeker' && (
        <div style={{ display: 'none' }}>
          <PrintableProfile ref={printableProfileRef} user={userProfile} />
        </div>
      )}
    </div>
  );
}
