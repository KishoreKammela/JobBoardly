'use client';
import { JobApplicantsDisplay } from '@/components/employer/JobApplicantsDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { user, loading } = useAuth();
  const router = useRouter();
  const currentPathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent(currentPathname)}`
      );
    } else if (user.role !== 'employer') {
      router.replace('/');
    }
  }, [user, loading, router, currentPathname]);

  if (loading || !user || user.role !== 'employer') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <JobApplicantsDisplay jobId={jobId} />
    </div>
  );
}
