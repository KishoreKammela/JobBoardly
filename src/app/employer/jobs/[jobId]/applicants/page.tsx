'use client';
import { JobApplicantsDisplay } from '@/components/employer/JobApplicantsDisplay';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { user, loading, isLoggingOut } = useAuth();
  const router = useRouter();
  const currentPathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (loading || isLoggingOut) return;
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in as an employer to view job applicants.',
        variant: 'destructive',
      });
      router.replace(
        `/employer/login?redirect=${encodeURIComponent(currentPathname)}`
      );
    } else if (user.role !== 'employer') {
      toast({
        title: 'Access Denied',
        description: 'This page is for employers only.',
        variant: 'destructive',
      });
      router.replace('/');
    }
  }, [user, loading, router, currentPathname, toast, isLoggingOut]);

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
