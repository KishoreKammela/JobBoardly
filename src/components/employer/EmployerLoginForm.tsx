
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
import { mockEmployerProfile } from '@/lib/mockData'; // For demo
import { Loader2, LogIn } from 'lucide-react';

export function EmployerLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo, "employer@example.com" is an employer
    if (email === "employer@example.com" && password === "password") {
      login({...mockEmployerProfile, email: email }); 
      toast({ title: 'Login Successful', description: `Welcome back, ${mockEmployerProfile.name}!` });
      router.push('/employer/post-job'); // Redirect to dashboard or post job page
    } else {
       toast({ title: 'Login Failed', description: 'Invalid email or password.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Employer Login</CardTitle>
        <CardDescription>Sign in to manage your job postings.</CardDescription>
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" /> }
            Sign In as Employer
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm flex flex-col items-center space-y-2">
        <p className="w-full text-center">
          Don't have an employer account?{' '}
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/employer/register">Register your company</Link>
          </Button>
        </p>
        <p className="w-full text-center">
          Are you a job seeker?{' '}
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/auth/login">Login here</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
