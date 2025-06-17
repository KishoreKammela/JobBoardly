
"use client";
import { PostJobForm } from '@/components/employer/PostJobForm';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function PostJobPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (user.role !== 'employer') {
      router.replace('/'); // Or job seeker dashboard if that's more appropriate
    }
  }, [user, loading, router, pathname]);

  if (loading || !user || user.role !== 'employer') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">Post a New Job</h1>
        <p className="text-muted-foreground">Fill in the details for your job opening or upload a job description document.</p>
      </div>
      <Separator />
      <PostJobForm />
    </div>
  );
}
