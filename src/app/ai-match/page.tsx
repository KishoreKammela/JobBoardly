
"use client";
import { AiJobMatcher } from '@/components/AiJobMatcher';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AiMatchPage() {
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
    <div>
      <AiJobMatcher />
    </div>
  );
}
