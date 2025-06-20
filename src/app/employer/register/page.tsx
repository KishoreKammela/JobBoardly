'use client';
import { EmployerRegisterForm } from '@/components/employer/EmployerRegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
// import type { Metadata } from 'next'; // Metadata object cannot be exported from client components

// Metadata for this page will be handled by the root layout.tsx or by refactoring to a Server Component structure.
// export const metadata: Metadata = {
//   title: 'Employer Registration - Join JobBoardly to Hire Talent',
//   description: 'Register your company on JobBoardly to post job openings, find candidates, and manage your hiring process with our AI-powered tools.',
//   robots: { // Typically, registration pages are not indexed for SEO
//     index: false,
//     follow: false,
//   },
//   alternates: {
//     canonical: '/employer/register',
//   },
// };

export default function EmployerRegisterPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!authLoading && user) {
      const redirectPath = searchParams.get('redirect');
      if (redirectPath) {
        router.replace(redirectPath);
      } else {
        if (user.role === 'employer') router.replace('/employer/posted-jobs');
        else if (user.role === 'jobSeeker') router.replace('/jobs');
        else if (user.role === 'admin') router.replace('/admin');
        else router.replace('/');
      }
    }
  }, [user, authLoading, router, searchParams]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  if (user && !authLoading) return null;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-150px)] items-center justify-center py-12">
      <EmployerRegisterForm />
    </div>
  );
}
