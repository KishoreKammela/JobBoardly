'use client';
import Link from 'next/link';
import { useState, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, ShieldCheck } from 'lucide-react';
import type { FirebaseError } from 'firebase/app';
// import { doc, getDoc } from 'firebase/firestore'; // No longer needed here
// import { db } from '@/lib/firebase'; // No longer needed here

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: authLoading, loginUser, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return; // Wait if auth is still processing

    if (user) {
      // User is loaded from AuthContext, now check role
      const redirectPath = searchParams.get('redirect');
      if (user.role === 'admin' || user.role === 'superAdmin') {
        toast({
          title: 'Admin Login Successful',
          description: 'Redirecting to dashboard...',
        });
        router.replace(redirectPath || '/admin');
      } else {
        // User is logged in but NOT an admin/superAdmin
        toast({
          title: 'Access Denied',
          description:
            'This login is for administrators only. Your account does not have admin privileges.',
          variant: 'destructive',
        });
        // Redirect non-admins away
        if (user.role === 'jobSeeker') router.replace('/jobs');
        else if (user.role === 'employer')
          router.replace('/employer/posted-jobs');
        else router.replace('/');
        // Consider automatically logging out users who attempt admin login without rights
        // logout(); // This might be too aggressive, current behavior is to redirect.
      }
    }
    // If !user and !authLoading, they are not logged in, so they stay on the login page.
    // Stop the main page loader once auth state is resolved.
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading, router, searchParams, toast, logout]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginUser(email, password);
      // On successful login, AuthContext will update, and the useEffect above will handle redirection and toasts.
      // No need to call setIsLoading(false) here, useEffect will handle it when authLoading changes.
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error('Admin Login error:', firebaseError.message);
      let friendlyMessage = 'Login failed. Please check your credentials.';
      if (
        firebaseError.code === 'auth/user-not-found' ||
        firebaseError.code === 'auth/wrong-password' ||
        firebaseError.code === 'auth/invalid-credential'
      ) {
        friendlyMessage = 'Invalid email or password.';
      }
      toast({
        title: 'Login Failed',
        description: friendlyMessage,
        variant: 'destructive',
      });
      setIsLoading(false); // Reset loading state on login failure
    }
  };

  // Initial loading state for the page until auth context resolves
  if (authLoading && !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  // If user is already loaded and is an admin, useEffect will redirect.
  // If user is loaded and not an admin, useEffect will redirect.
  // If not loading and no user, show login form.

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-headline">
            Administrator Login
          </CardTitle>
          <CardDescription>
            Access the JobBoardly Admin Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Admin email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Admin password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Sign In as Administrator
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-center block">
          <p>
            Need general access?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/auth/login">Job Seeker Login</Link>
            </Button>{' '}
            |{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/employer/login">Employer Login</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
