
"use client";
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Building, Github, Shell, Chrome } from 'lucide-react';
import type { UserRole } from '@/types';
import type { FirebaseError } from 'firebase/app';
import { googleProvider, githubProvider, microsoftProvider } from '@/lib/firebase';
import { Separator } from '@/components/ui/separator';


export function EmployerRegisterForm() {
  const [recruiterName, setRecruiterName] = useState(''); // Changed from companyName to recruiterName
  const [companyName, setCompanyName] = useState(''); // New state for actual company name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const { registerUser, signInWithSocial } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleRegisterSuccess = () => {
    toast({ title: 'Registration Successful', description: `Welcome, ${recruiterName} from ${companyName}! Please complete your company profile.` });
    const redirectPath = searchParams.get('redirect');
    if (redirectPath) {
      router.push(redirectPath);
    } else {
      router.push('/profile'); // To complete company profile
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
        toast({ title: 'Company Name Required', description: 'Please enter the name of your company.', variant: 'destructive' });
        return;
    }
    setIsLoading(true);
    try {
      // Pass recruiterName as 'name' and companyName for company creation
      await registerUser(email, password, recruiterName, 'employer' as UserRole, companyName);
      setTimeout(handleRegisterSuccess, 100);
    } catch (error) {
       const firebaseError = error as FirebaseError;
      console.error("Registration error:", firebaseError.message);
      let friendlyMessage = "Registration failed. Please try again.";
      if (firebaseError.code === "auth/email-already-in-use") {
        friendlyMessage = "This email address is already in use.";
      } else if (firebaseError.code === "auth/weak-password") {
        friendlyMessage = "Password is too weak. Please use at least 6 characters.";
      }
      toast({ title: 'Registration Failed', description: friendlyMessage, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleSocialSignUp = async (providerName: 'google' | 'github' | 'microsoft') => {
    // For social sign-up, we might need a way to capture company name if it's a new company
    // This could be a separate step or a prompt. For now, let's assume if they use social
    // and a new company needs to be made, we'll prompt or use a default.
    // The AuthContext's signInWithSocial now accepts an optional companyName.
    // We'd ideally get this from a field if the intent is to create a *new* company via social.
    // For this form, if companyName state is filled, we can pass it.
     if (!companyName.trim() && providerName) { // Simple check, might need better UX
        toast({ title: 'Company Name Required', description: 'Please enter the company name before signing up with a social provider for a new company.', variant: 'destructive' });
        return;
    }
    setIsSocialLoading(providerName);
    try {
      let authProvider;
      if (providerName === 'google') authProvider = googleProvider;
      else if (providerName === 'github') authProvider = githubProvider;
      else if (providerName === 'microsoft') authProvider = microsoftProvider;
      else return;

      await signInWithSocial(authProvider, 'employer', companyName);
      // Toast message might need to access the display name from the social provider
      // For now, using a generic message. AuthContext handles creating user and company.
      toast({ title: 'Sign Up Successful', description: `Welcome! Please complete your company profile.` });
      setTimeout(handleRegisterSuccess, 100);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error(`${providerName} sign up error:`, firebaseError);
      toast({ title: 'Social Sign Up Failed', description: `Could not sign up with ${providerName}. ${firebaseError.message}`, variant: 'destructive' });
    }
    setIsSocialLoading(null);
  };


  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
            <Building className="h-6 w-6"/> Register Your Company
        </CardTitle>
        <CardDescription>Join JobBoardly to find the best talent for your team.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyNameActual">Company Name</Label>
            <Input
              id="companyNameActual" // Different ID from recruiterName
              type="text"
              placeholder="Your Company Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              aria-label="Company name for registration"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recruiterName">Your Full Name (Recruiter)</Label>
            <Input
              id="recruiterName"
              type="text"
              placeholder="Your Full Name"
              value={recruiterName}
              onChange={(e) => setRecruiterName(e.target.value)}
              required
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
              aria-label="Your email address for registration"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              aria-label="Password for registration"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !!isSocialLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Register Company & Account
          </Button>
        </form>
        <Separator className="my-6" />
         <p className="text-sm text-center text-muted-foreground mb-3">Or sign up with your company account (ensure Company Name above is filled if new):</p>
         <div className="space-y-3">
             <Button variant="outline" className="w-full" onClick={() => handleSocialSignUp('google')} disabled={isLoading || !!isSocialLoading}>
              {isSocialLoading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />} Sign up with Google
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleSocialSignUp('github')} disabled={isLoading || !!isSocialLoading}>
              {isSocialLoading === 'github' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />} Sign up with GitHub
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleSocialSignUp('microsoft')} disabled={isLoading || !!isSocialLoading}>
             {isSocialLoading === 'microsoft' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shell className="mr-2 h-4 w-4" />} Sign up with Microsoft
            </Button>
          </div>
      </CardContent>
      <CardFooter className="text-sm flex flex-col items-center space-y-2">
        <p className="w-full text-center">
          Already have an employer account?{' '}
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/employer/login">Sign in</Link>
          </Button>
        </p>
         <p className="w-full text-center">
          Are you a job seeker?{' '}
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/auth/register">Register here</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
