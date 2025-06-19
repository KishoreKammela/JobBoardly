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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: authLoading, loginUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      const redirectPath = searchParams.get('redirect');
      if (user.role === 'admin' || user.role === 'superAdmin') {
        router.replace(redirectPath || '/admin');
      } else if (redirectPath && redirectPath.startsWith('/admin')) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access the admin area.',
          variant: 'destructive',
        });
        if (user.role === 'jobSeeker') router.replace('/jobs');
        else if (user.role === 'employer')
          router.replace('/employer/posted-jobs');
        else router.replace('/');
      } else if (redirectPath) {
        router.replace(redirectPath);
      } else {
        if (user.role === 'jobSeeker') router.replace('/jobs');
        else if (user.role === 'employer')
          router.replace('/employer/posted-jobs');
        else router.replace('/');
      }
    }
  }, [user, authLoading, router, searchParams, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const loggedInFirebaseUser = await loginUser(email, password);
      const userDocRef = doc(db, 'users', loggedInFirebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (
        userDocSnap.exists() &&
        (userDocSnap.data().role === 'admin' ||
          userDocSnap.data().role === 'superAdmin')
      ) {
        toast({
          title: 'Admin Login Successful',
          description: 'Redirecting to dashboard...',
        });
        // Redirection will be handled by useEffect
      } else if (userDocSnap.exists()) {
        toast({
          title: 'Access Denied',
          description:
            'This login is for administrators only. You have been logged in to your regular account.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login Successful',
          description:
            'User profile not immediately found. Redirecting based on context.',
        });
      }
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
    }
    setIsLoading(false);
  };

  if (authLoading) {
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
