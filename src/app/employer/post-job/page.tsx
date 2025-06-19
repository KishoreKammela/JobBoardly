'use client';
import { PostJobForm } from '@/components/employer/PostJobForm';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PostJobPage() {
  const { user, company, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (user.role !== 'employer') {
      router.replace('/');
    }
  }, [user, loading, router, pathname]);

  if (loading || !user || user.role !== 'employer') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (
    company &&
    (company.status === 'suspended' || company.status === 'deleted')
  ) {
    return (
      <div className="container mx-auto py-10 max-w-2xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>
            {company.status === 'suspended'
              ? 'Company Account Suspended'
              : 'Company Account Deactivated'}
          </AlertTitle>
          <AlertDescription>
            Your company&apos;s account is currently {company.status}. You
            cannot post or manage jobs at this time. Please contact JobBoardly
            support for assistance.
            <Button variant="link" asChild className="mt-2 block px-0">
              <Link href="/employer/posted-jobs">Go to My Postings</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">
          Post a New Job
        </h1>
        <p className="text-muted-foreground">
          Fill in the details for your job opening or upload a job description
          document.
        </p>
      </div>
      <Separator />
      <PostJobForm />
    </div>
  );
}
