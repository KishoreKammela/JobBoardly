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

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: authLoading, loginUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      const redirectPath = searchParams.get('redirect');
      if (
        user.role === 'admin' ||
        user.role === 'superAdmin' ||
        user.role === 'moderator'
      ) {
        toast({
          title: 'Admin Login Successful',
          description: 'Redirecting to dashboard...',
        });
        router.replace(redirectPath || '/admin');
      } else {
        toast({
          title: 'Access Denied',
          description:
            'This login is for administrators, super administrators, or moderators only. Your account does not have these privileges.',
          variant: 'destructive',
        });
        if (user.role === 'jobSeeker') router.replace('/jobs');
        else if (user.role === 'employer')
          router.replace('/employer/posted-jobs');
        else router.replace('/');
      }
    }
    if (!authLoading) {
      setIsLoading(false); // Stop main form loading spinner if it was active
    }
  }, [user, authLoading, router, searchParams, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginUser(email, password);
      // On successful login, AuthContext will update, and the useEffect above will handle redirection and toasts.
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
      setIsLoading(false);
    }
  };

  if (authLoading && !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-headline">
            Platform Management Login
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
              Sign In
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
