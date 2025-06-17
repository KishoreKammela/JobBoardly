
"use client";
import { AppliedJobsDisplay } from '@/components/AppliedJobsDisplay';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AppliedJobsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (user.role !== 'jobSeeker') {
      // If logged in but not a job seeker, redirect to their dashboard or home
      router.replace(user.role === 'employer' ? '/employer/posted-jobs' : '/');
    }
  }, [user, loading, router, pathname]);

  if (loading || !user || user.role !== 'jobSeeker') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">My Applied Jobs</h1>
        <p className="text-muted-foreground">Here's a list of jobs you have applied to.</p>
      </div>
      <Separator />
      <AppliedJobsDisplay />
    </div>
  );
}
