// src/app/employer/login/page.tsx
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
import { Loader2, LogIn, Github, Shell, Chrome } from 'lucide-react';
import type { FirebaseError } from 'firebase/app';
import {
  googleProvider,
  githubProvider,
  microsoftProvider,
} from '@/lib/firebase';
import { Separator } from '@/components/ui/separator';
import { ADMIN_LIKE_ROLES } from '@/lib/constants';

export default function EmployerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { user, loading: authLoading, loginUser, signInWithSocial } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    document.title = 'Employer Login - Access Your Dashboard | JobBoardly';
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      const redirectPath = searchParams.get('redirect');
      if (redirectPath) {
        router.replace(redirectPath);
      } else {
        if (user.role === 'employer') router.replace('/employer/posted-jobs');
        else if (user.role === 'jobSeeker') router.replace('/jobs');
        else if (ADMIN_LIKE_ROLES.includes(user.role)) router.replace('/admin');
        else router.replace('/');
      }
    }
  }, [user, authLoading, router, searchParams]);

  const handleLoginSuccess = (userName: string) => {
    toast({
      title: 'Login Successful',
      description: `Welcome back, ${userName}! Redirecting...`,
    });
    setLoginSuccess(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userProfile = await loginUser(email, password);
      handleLoginSuccess(userProfile.name);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error('Login error:', firebaseError.message);
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

  const handleSocialLogin = async (
    providerName: 'google' | 'github' | 'microsoft'
  ) => {
    setIsSocialLoading(providerName);
    try {
      let authProvider;
      if (providerName === 'google') authProvider = googleProvider;
      else if (providerName === 'github') authProvider = githubProvider;
      else if (providerName === 'microsoft') authProvider = microsoftProvider;
      else return;

      const userProfile = await signInWithSocial(authProvider, 'employer');
      handleLoginSuccess(userProfile.name);
      // Redirection is handled by the useEffect hook
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      console.error(`${providerName} login error:`, firebaseError);
      toast({
        title: 'Social Login Failed',
        description: `Could not sign in with ${providerName}. ${firebaseError.message}`,
        variant: 'destructive',
      });
    }
    setIsSocialLoading(null);
  };

  if (authLoading || loginSuccess) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !authLoading) return null;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-150px)] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">
            Employer Login
          </CardTitle>
          <CardDescription>
            Sign in to manage your job postings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Company Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="hr@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Company email address for login"
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
                aria-label="Password for login"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !!isSocialLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Sign In as Employer
            </Button>
          </form>
          <Separator className="my-6" />
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading || !!isSocialLoading}
            >
              {isSocialLoading === 'google' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Chrome className="mr-2 h-4 w-4" />
              )}{' '}
              Sign in with Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading || !!isSocialLoading}
            >
              {isSocialLoading === 'github' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}{' '}
              Sign in with GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('microsoft')}
              disabled={isLoading || !!isSocialLoading}
            >
              {isSocialLoading === 'microsoft' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shell className="mr-2 h-4 w-4" />
              )}{' '}
              Sign in with Microsoft
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-sm flex flex-col items-center space-y-2">
          <p className="w-full text-center">
            Don&apos;t have an employer account?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link
                href={`/employer/register${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}
              >
                Register your company
              </Link>
            </Button>
          </p>
          <p className="w-full text-center">
            Are you a job seeker?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link
                href={`/auth/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}
              >
                Login here
              </Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
