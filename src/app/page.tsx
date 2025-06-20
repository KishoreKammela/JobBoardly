import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Search,
  Zap,
  Users,
  Briefcase,
  FileText,
  User,
  FilePlus,
  Brain,
} from 'lucide-react';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title:
    'JobBoardly: AI-Powered Job Search & Hiring Platform - Find Your Future',
  description:
    'Discover your dream job or hire top talent with JobBoardly. Our advanced AI-driven platform offers intelligent job matching, resume parsing, and a seamless experience for job seekers and employers alike.',
  keywords: [
    'AI job board',
    'job search',
    'find jobs',
    'hire talent',
    'career opportunities',
    'JobBoardly',
    'resume parsing',
    'AI job matching',
    'tech jobs',
    'marketing jobs',
    'remote jobs',
    'post jobs online',
    'find employees',
  ],
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_650px]">
            <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Discover Your Next Opportunity with JobBoardly
              </h1>
              <p className="max-w-[650px] text-muted-foreground md:text-xl lg:mx-0 mx-auto">
                Leverage the power of AI to find jobs that truly match your
                skills and aspirations, or connect with the perfect candidates
                to build your dream team.
              </p>
              <div className="flex flex-col gap-3 min-[400px]:flex-row lg:justify-start justify-center">
                <Button
                  asChild
                  size="lg"
                  className="shadow-lg hover:shadow-primary/50 transition-shadow text-lg py-6 px-8"
                >
                  <Link href="/jobs">
                    <Search className="mr-2.5 h-5 w-5" /> Explore Jobs
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg py-6 px-8"
                >
                  <Link href="/employer">
                    <Users className="mr-2.5 h-5 w-5" /> For Employers
                  </Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://placehold.co/650x450.png"
              alt="Diverse group of professionals working collaboratively in a modern office, representing career opportunities and teamwork facilitated by JobBoardly."
              width={650}
              height={450}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last shadow-xl"
              data-ai-hint="professionals collaboration team"
              priority
            />
          </div>
        </div>
      </section>

      {/* Why JobBoardly Section */}
      <section className="w-full py-12 md:py-20 lg:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground shadow-sm">
              Why Choose Us?
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">
              The Smarter Way to Connect Careers
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
              JobBoardly isn&apos;t just another job board. We utilize advanced
              AI to provide a personalized and efficient experience for
              everyone.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none">
            <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-md hover:shadow-lg transition-shadow">
              <Zap className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-xl font-bold">AI-Powered Matching</h3>
              <p className="text-sm text-muted-foreground">
                Our intelligent algorithms go beyond keywords to connect job
                seekers with roles that truly fit their skills and employers
                with high-potential candidates.
              </p>
            </div>
            <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-md hover:shadow-lg transition-shadow">
              <Briefcase className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-xl font-bold">Comprehensive Tools</h3>
              <p className="text-sm text-muted-foreground">
                From AI resume parsing and summary generation to advanced search
                filters and application tracking, we provide the tools you need.
              </p>
            </div>
            <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-md hover:shadow-lg transition-shadow">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-xl font-bold">Streamlined Experience</h3>
              <p className="text-sm text-muted-foreground">
                Enjoy a user-friendly interface designed for efficiency, whether
                you&apos;re applying for jobs or managing candidates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* For Job Seekers */}
            <div className="space-y-4">
              <Badge
                variant="outline"
                className="text-primary border-primary py-1 px-3 text-sm"
              >
                For Job Seekers
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight font-headline">
                Land Your Dream Job Faster
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Take control of your career path with JobBoardly’s intelligent
                features designed to help you succeed.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-accent mt-1 shrink-0" />
                  <span>
                    <strong>AI Job Matcher:</strong> Get personalized job
                    recommendations based on your unique profile and
                    preferences.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <User className="h-5 w-5 text-accent mt-1 shrink-0" />
                  <span>
                    <strong>AI Profile Summary:</strong> Let our AI help you
                    craft a compelling professional summary to stand out.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 text-accent mt-1 shrink-0" />
                  <span>
                    <strong>Easy Application Process:</strong> Apply to jobs
                    quickly with your saved profile and resume.
                  </span>
                </li>
              </ul>
              <Button asChild size="lg" className="mt-4">
                <Link href="/auth/register">
                  Create Your Profile <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <Image
              src="https://placehold.co/550x400.png"
              alt="Happy job seeker using a laptop to browse JobBoardly, with an abstract representation of AI connections in the background."
              width={550}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover shadow-xl"
              data-ai-hint="job seeker laptop"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mt-16 md:mt-24">
            <Image
              src="https://placehold.co/550x400.png"
              alt="Hiring manager reviewing candidate profiles on a tablet, with a diverse team working in the background, showcasing JobBoardly's employer tools."
              width={550}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover md:order-last shadow-xl"
              data-ai-hint="hiring manager tablet"
            />
            {/* For Employers */}
            <div className="space-y-4 md:order-first">
              <Badge
                variant="outline"
                className="text-primary border-primary py-1 px-3 text-sm"
              >
                For Employers
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight font-headline">
                Build Your Ideal Team
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Access a pool of qualified candidates and streamline your hiring
                process with our powerful employer tools.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <FilePlus className="h-5 w-5 text-accent mt-1 shrink-0" />
                  <span>
                    <strong>Efficient Job Posting:</strong> Easily create and
                    manage job listings. Parse job descriptions from documents
                    and add screening questions.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-accent mt-1 shrink-0" />
                  <span>
                    <strong>AI Candidate Sourcing:</strong> Let our AI find the
                    most relevant candidates for your roles based on skills and
                    experience.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-accent mt-1 shrink-0" />
                  <span>
                    <strong>Applicant Management:</strong> Track applications,
                    review candidate profiles, and manage their status
                    effectively.
                  </span>
                </li>
              </ul>
              <Button asChild size="lg" className="mt-4">
                <Link href="/employer/register">
                  Post a Job <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-12 md:py-20 lg:py-28 bg-primary/5">
        <div className="container text-center px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-6">
            Ready to Get Started?
          </h2>
          <p className="max-w-xl mx-auto text-muted-foreground md:text-lg mb-8">
            Join JobBoardly today and experience the future of job searching and
            hiring. Your next great opportunity or ideal candidate is just a few
            clicks away.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="text-lg py-6 px-8">
              <Link href="/auth/register">Job Seeker Sign Up</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg py-6 px-8"
            >
              <Link href="/employer/register">Employer Registration</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
