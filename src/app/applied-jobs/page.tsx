
"use client";
// This file is deprecated and its functionality is covered by src/app/my-jobs/page.tsx
// It is recommended to delete this file.
// For safety, if accessed, it will redirect.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DeprecatedAppliedJobsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/my-jobs'); // Redirect to the new consolidated page
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="ml-3">This page is no longer used. Redirecting to My Jobs...</p>
    </div>
  );
}
