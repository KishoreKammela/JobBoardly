
"use client";
// This file is effectively replaced by src/app/my-jobs/page.tsx
// It can be deleted, but for safety, I'm leaving its content commented out
// or simply making it redirect if somehow accessed.
// In a real scenario, you would delete this file and its containing folder.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function OldAppliedJobsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/my-jobs'); // Redirect to the new page
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="ml-3">Redirecting to My Jobs...</p>
    </div>
  );
}
