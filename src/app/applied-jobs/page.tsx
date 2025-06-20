'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DeprecatedAppliedJobsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/my-jobs');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="ml-3">
        This page is no longer used. Redirecting to My Jobs...
      </p>
    </div>
  );
}
