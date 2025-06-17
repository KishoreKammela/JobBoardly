
"use client";
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Building } from 'lucide-react';
import type { UserRole } from '@/types';
import type { FirebaseError } from 'firebase/app';

export function EmployerRegisterForm() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState(''); // Kept for now, could be part of profile update
  const [isLoading, setIsLoading] = useState(false);
  const { registerUser } = useAuth(); // Changed from login
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await registerUser(email, password, companyName, 'employer' as UserRole);
      // The registerUser function in AuthContext will also create the Firestore profile
      // with companyName as 'name' and role as 'employer'.
      // Additional fields like companyWebsite can be added in the profile editing section.
      toast({ title: 'Registration Successful', description: `Welcome, ${companyName}! Start posting jobs.` });
      router.push('/employer/post-job'); 
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
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Your Company Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              aria-label="Company name for registration"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Company Email Address (for login)</Label>
            <Input
              id="email"
              type="email"
              placeholder="hr@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Company email address for registration"
            />
          </div>
           {/* Company website can be added to profile later */}
          {/* <div className="space-y-2">
            <Label htmlFor="companyWebsite">Company Website (Optional)</Label>
            <Input
              id="companyWebsite"
              type="url"
              placeholder="https://yourcompany.com"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              aria-label="Company website for registration"
            />
          </div> */}
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Register Company
          </Button>
        </form>
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
