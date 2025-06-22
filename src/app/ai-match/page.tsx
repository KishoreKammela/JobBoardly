'use client';
import { AiJobMatcher } from '@/components/AiJobMatcher';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AiMatchPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in as a job seeker to use the AI Matcher.',
        variant: 'destructive',
      });
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (user.role !== 'jobSeeker') {
      toast({
        title: 'Access Denied',
        description: 'The AI Job Matcher is for job seekers only.',
        variant: 'destructive',
      });
      router.replace(user.role === 'employer' ? '/employer/posted-jobs' : '/');
    }
  }, [user, loading, router, pathname, toast]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user && user.role !== 'jobSeeker') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Redirecting...</p>
        <Loader2 className="h-10 w-10 animate-spin text-primary ml-2" />
      </div>
    );
  }

  if (user && user.status === 'suspended') {
    return (
      <div className="container mx-auto py-10 max-w-2xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Account Suspended</AlertTitle>
          <AlertDescription>
            Your account is currently suspended. The AI Job Matcher feature is
            unavailable. Please contact support for assistance.
            <Button variant="link" asChild className="mt-2 block px-0">
              <Link href="/jobs">Browse Jobs Manually</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <AiJobMatcher />
    </div>
  );
}
