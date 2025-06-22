'use client';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Metadata for this page should be set in a server component or root layout
// For client components, we can update document.title dynamically if needed.

export default function ChangePasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    document.title = 'Change Your Password | JobBoardly';
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to change your password.',
        variant: 'destructive',
      });
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname, toast]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold font-headline">
            Change Your Password
          </h1>
          <CardDescription>
            Update your password below. Choose a strong, unique password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
