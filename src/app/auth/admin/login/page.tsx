// src/app/auth/admin/login/page.tsx
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
import { useAuth } from '@/contexts/Auth/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, ShieldCheck } from 'lucide-react';
import type { FirebaseError } from 'firebase/app';
import { ADMIN_LIKE_ROLES } from '@/lib/constants';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { user, loading: authLoading, loginUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    document.title = 'Admin Login - Platform Management | JobBoardly';
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      const redirectPath = searchParams.get('redirect');
      if (ADMIN_LIKE_ROLES.includes(user.role)) {
        router.replace(redirectPath || '/admin');
      } else {
        router.replace('/');
      }
    }
  }, [user, authLoading, router, searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userProfile = await loginUser(email, password);
      if (ADMIN_LIKE_ROLES.includes(userProfile.role)) {
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${userProfile.name}! Redirecting...`,
        });
        setLoginSuccess(true);
      } else {
        // This is a controlled error for non-admin users.
        throw new Error('This login is for authorized platform staff only.');
      }
    } catch (error: unknown) {
      const typedError = error as FirebaseError | Error;
      let friendlyMessage =
        typedError.message || 'Login failed. Please check your credentials.';

      // Don't log our controlled error to the console as a system error.
      // Only log actual unexpected errors.
      if (
        friendlyMessage !== 'This login is for authorized platform staff only.'
      ) {
        console.error('Admin Login error:', typedError.message);
      }

      if ('code' in typedError) {
        if (
          typedError.code === 'auth/user-not-found' ||
          typedError.code === 'auth/wrong-password' ||
          typedError.code === 'auth/invalid-credential'
        ) {
          friendlyMessage = 'Invalid email or password.';
        }
      }

      toast({
        title: 'Login Failed',
        description: friendlyMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  if (authLoading || loginSuccess) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !authLoading) return null; // Let useEffect handle redirect

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold font-headline">
            Platform Management Login
          </CardTitle>
          <CardDescription>
            Access the JobBoardly Admin Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="emailAdmin">Email Address</Label>
              <Input
                id="emailAdmin"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Admin email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordAdmin">Password</Label>
              <Input
                id="passwordAdmin"
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
