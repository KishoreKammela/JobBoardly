'use client';
import { MyJobsDisplay } from '@/components/MyJobsDisplay'; // Renamed component
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function MyJobsPage() {
  // Renamed page function
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (user.role !== 'jobSeeker') {
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
        <h1 className="text-3xl font-bold mb-2 font-headline">My Jobs</h1>
        <p className="text-muted-foreground">
          Manage your saved and applied jobs.
        </p>
      </div>
      <Separator />
      <MyJobsDisplay />
    </div>
  );
}
