// src/app/employer/register/page.tsx
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
import {
  Loader2,
  UserPlus,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import type { FirebaseError } from 'firebase/app';
import { checkPasswordStrength, type PasswordStrength } from '@/lib/utils';
import { ADMIN_LIKE_ROLES } from '@/lib/constants';
import type { RecruiterInvitation } from '@/types';
import { getInvitationDetails } from '@/services/company.services';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EmployerRegisterPage() {
  const [recruiterName, setRecruiterName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { user, loading: authLoading, registerUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(
    checkPasswordStrength('')
  );

  const invitationId = searchParams.get('invitation');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [invitation, setInvitation] = useState<RecruiterInvitation | null>(
    null
  );
  const [invitationLoading, setInvitationLoading] = useState(!!invitationId);
  const [invitationError, setInvitationError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Employer Registration - Join JobBoardly | JobBoardly';
    if (invitationId) {
      setInvitationLoading(true);
      getInvitationDetails(invitationId)
        .then((inv) => {
          if (inv && inv.status === 'pending') {
            setInvitation(inv);
            setCompanyName(inv.companyName);
            setRecruiterName(inv.recruiterName);
            setEmail(inv.recruiterEmail);
          } else if (inv) {
            setInvitationError(
              'This invitation has already been accepted or is invalid.'
            );
          } else {
            setInvitationError('Invalid invitation link.');
          }
        })
        .catch(() => setInvitationError('Failed to verify invitation link.'))
        .finally(() => setInvitationLoading(false));
    }
  }, [invitationId]);

  useEffect(() => {
    if (!authLoading && user) {
      const redirectPath = searchParams.get('redirect');
      if (redirectPath) {
        router.replace(redirectPath);
      } else {
        if (user.role === 'employer') {
          router.replace('/profile');
        } else if (user.role === 'jobSeeker') {
          router.replace('/jobs');
        } else if (ADMIN_LIKE_ROLES.includes(user.role)) {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
      }
    }
  }, [user, authLoading, router, searchParams]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pass = e.target.value;
    setPassword(pass);
    setPasswordStrength(checkPasswordStrength(pass));
  };

  const handleRegisterSuccess = (recName: string, compName: string) => {
    toast({
      title: 'Registration Successful',
      description: `Welcome, ${recName || 'Recruiter'} from ${compName || 'your company'}! ${invitationId ? 'You have successfully joined the team.' : 'Your company profile is pending admin approval.'}`,
    });
    setRegistrationSuccess(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (invitationId && invitationError) {
      toast({
        title: 'Invalid Invitation',
        description: invitationError,
        variant: 'destructive',
      });
      return;
    }
    if (!invitationId && !companyName.trim()) {
      toast({
        title: 'Company Name Required',
        description: 'Please enter the name of your company.',
        variant: 'destructive',
      });
      return;
    }
    if (!passwordStrength.isValid) {
      toast({
        title: 'Weak Password',
        description: `Please ensure your password meets all criteria: ${passwordStrength.issues.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      await registerUser(
        email,
        password,
        recruiterName,
        'employer',
        companyName,
        invitationId || undefined
      );
      handleRegisterSuccess(recruiterName, companyName);
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      console.error('Registration error:', firebaseError.message);
      let friendlyMessage = 'Registration failed. Please try again.';
      if (firebaseError.code === 'auth/email-already-in-use') {
        friendlyMessage = 'This email address is already in use.';
      } else if (firebaseError.code === 'auth/weak-password') {
        friendlyMessage =
          'Password is too weak. Please use at least 6 characters.';
      }
      toast({
        title: 'Registration Failed',
        description: friendlyMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  if (authLoading || invitationLoading || registrationSuccess) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-2">
          {invitationLoading
            ? 'Verifying invitation...'
            : registrationSuccess
              ? 'Registration complete. Redirecting...'
              : 'Loading...'}
        </p>
      </div>
    );
  }

  if (invitationError) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Invitation Error</AlertTitle>
          <AlertDescription>{invitationError}</AlertDescription>
        </Alert>
      </div>
    );
  }
  if (user && !authLoading) return null;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-150px)] items-center justify-center py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
            <Building className="h-6 w-6" />{' '}
            {invitationId ? 'Join Your Team' : 'Register Your Company'}
          </CardTitle>
          <CardDescription>
            {invitationId
              ? `You've been invited to join ${companyName} on JobBoardly. Set your password to get started.`
              : 'Join JobBoardly to find the best talent for your team.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyNameActual">Company Name</Label>
              <Input
                id="companyNameActual"
                type="text"
                placeholder="Your Company Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={!!invitationId}
                className={invitationId ? 'bg-muted/50' : ''}
                aria-label="Company name for registration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recruiterName">Your Full Name</Label>
              <Input
                id="recruiterName"
                type="text"
                placeholder="Your Full Name"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                required
                disabled={!!invitationId}
                className={invitationId ? 'bg-muted/50' : ''}
                aria-label="Recruiter's full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Your Email Address (for login)</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!invitationId}
                className={invitationId ? 'bg-muted/50' : ''}
                aria-label="Your email address for registration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={handlePasswordChange}
                required
                aria-label="Password for registration"
              />
              <ul className="mt-2 space-y-1 text-xs">
                {passwordStrength.criteria.map((criterion, index) => (
                  <li
                    key={index}
                    className={`flex items-center ${criterion.met ? 'text-green-600' : 'text-destructive'}`}
                  >
                    {criterion.met ? (
                      <CheckCircle className="mr-2 h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="mr-2 h-3.5 w-3.5" />
                    )}
                    {criterion.text}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || invitationLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {invitationId
                ? 'Create Your Account'
                : 'Register Company & Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm flex flex-col items-center space-y-2">
          <p className="w-full text-center">
            Already have an employer account?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link
                href={`/employer/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}
              >
                Sign in
              </Link>
            </Button>
          </p>
          <p className="w-full text-center">
            Are you a job seeker?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link
                href={`/auth/register${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}
              >
                Register here
              </Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
