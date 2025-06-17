
"use client";
import { JobApplicantsDisplay } from '@/components/employer/JobApplicantsDisplay';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';

interface JobApplicantsPageProps {
  params: {
    jobId: string;
  };
}

export default function JobApplicantsPage({ params }: JobApplicantsPageProps) {
  const { jobId } = params;
  const { user, loading } = useAuth();
  const router = useRouter();
  const currentPathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(currentPathname)}`);
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
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">Job Applicants</h1>
        {/* We might fetch and display job title here if JobApplicantsDisplay doesn't do it */}
      </div>
      <Separator />
      <JobApplicantsDisplay jobId={jobId} />
    </div>
  );
}
