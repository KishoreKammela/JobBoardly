import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Building,
  UserPlus,
  FilePlus,
  Brain,
  Users,
  Search,
  CheckSquare,
} from 'lucide-react';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employers - Post Jobs & Find Talent | JobBoardly',
  description:
    'JobBoardly for Employers: Post job openings, manage applications, and find qualified candidates using our AI-powered tools. Streamline your hiring process today.',
  keywords: [
    'employer job portal',
    'post jobs',
    'hire candidates',
    'recruitment platform',
    'find talent',
    'JobBoardly employers',
    'applicant tracking',
    'AI recruitment',
    'candidate sourcing',
  ],
  alternates: {
    canonical: '/employer',
  },
};

export default function EmployerLandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_650px]">
            <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-2">
                  <Building className="h-4 w-4" /> JobBoardly for Employers
                </span>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Build Your Dream Team with JobBoardly
                </h1>
                <p className="max-w-[650px] text-muted-foreground md:text-xl lg:mx-0 mx-auto">
                  Access a diverse pool of qualified candidates, streamline your
                  hiring workflow, and leverage AI to find the perfect fit for
                  your company.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row lg:justify-start justify-center">
                <Button
                  asChild
                  size="lg"
                  className="shadow-lg hover:shadow-primary/50 transition-shadow text-lg py-6 px-8"
                >
                  <Link href="/employer/post-job">
                    <FilePlus className="mr-2.5 h-5 w-5" /> Post a Job
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg py-6 px-8"
                >
                  <Link href="/employer/register">
                    <UserPlus className="mr-2.5 h-5 w-5" /> Register Company
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground lg:text-left text-center">
                Already have an account?{' '}
                <Link
                  href="/employer/login"
                  className="font-medium text-primary hover:underline"
                >
                  Employer Login
                </Link>
              </p>
            </div>
            <Image
              src="https://placehold.co/650x450.png"
              alt="Team of diverse professionals in a meeting, discussing hiring strategy using JobBoardly on a large screen, symbolizing efficient recruitment."
              width={650}
              height={450}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last shadow-xl"
              data-ai-hint="hiring team meeting"
              priority
            />
          </div>
        </div>
      </section>

      {/* Why JobBoardly for Employers Section */}
      <section className="w-full py-12 md:py-20 lg:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground shadow-sm">
              Our Advantages
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">
              Streamline Your Hiring, Find Quality Talent
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
              JobBoardly empowers you with intelligent tools to attract, screen,
              and manage candidates effectively.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none">
            <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-md hover:shadow-lg transition-shadow">
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-xl font-bold">Reach Qualified Candidates</h3>
              <p className="text-sm text-muted-foreground">
                Tap into our growing network of skilled professionals actively
                seeking new opportunities and connect with passive talent.
              </p>
            </div>
            <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-md hover:shadow-lg transition-shadow">
              <Brain className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-xl font-bold">AI-Powered Sourcing</h3>
              <p className="text-sm text-muted-foreground">
                Leverage AI to parse job descriptions, match candidates to your
                roles, and identify top prospects with greater accuracy.
              </p>
            </div>
            <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-md hover:shadow-lg transition-shadow">
              <CheckSquare className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-xl font-bold">
                Efficient Applicant Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Easily post jobs, add screening questions, view applicant
                responses, and track candidate progress through your hiring
                pipeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">
              Hiring Made Simple
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-lg/relaxed mt-3">
              Follow these easy steps to find your next great hire with
              JobBoardly.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl items-stretch gap-8 md:grid-cols-3 md:gap-12">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card shadow-sm">
              <div className="bg-primary/10 text-primary p-3 rounded-full mb-4">
                <FilePlus className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Post Your Job</h3>
              <p className="text-sm text-muted-foreground">
                Create a compelling job listing in minutes. Upload a JD for AI
                parsing or fill details manually. Add screening questions to
                filter applicants.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card shadow-sm">
              <div className="bg-primary/10 text-primary p-3 rounded-full mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                2. Find & Review Candidates
              </h3>
              <p className="text-sm text-muted-foreground">
                Search our talent pool with advanced filters, use our AI Matcher
                to find top candidates, and review applications along with
                screening answers.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card shadow-sm">
              <div className="bg-primary/10 text-primary p-3 rounded-full mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Manage & Hire</h3>
              <p className="text-sm text-muted-foreground">
                Track applicant statuses, add internal notes, and move
                candidates through your hiring pipeline efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-12 md:py-20 lg:py-28 bg-primary/5">
        <div className="container text-center px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-6">
            Ready to Find Your Next Star Employee?
          </h2>
          <p className="max-w-xl mx-auto text-muted-foreground md:text-lg mb-8">
            Join JobBoardly today and start connecting with the talent that will
            drive your company forward.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="text-lg py-6 px-8">
              <Link href="/employer/post-job">Post a Job Opening</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg py-6 px-8"
            >
              <Link href="/employer/register">Register Your Company</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
