import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building, LogIn, UserPlus, FilePlus, Brain } from 'lucide-react';
import Image from 'next/image';

export default function EmployerLandingPage() {
  return (
    <div className="flex flex-col items-center text-center py-12">
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4 text-left">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  <Building className="h-4 w-4" /> For Employers
                </span>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Find Top Talent with JobBoardly
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Post your job openings and connect with qualified candidates.
                  Our platform makes hiring efficient and effective.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="shadow-lg hover:shadow-primary/50 transition-shadow"
                >
                  <Link href="/employer/post-job">
                    <FilePlus className="mr-2 h-5 w-5" /> Post a Job
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/employer/login">
                    <LogIn className="mr-2 h-5 w-5" /> Employer Login
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                New to JobBoardly?{' '}
                <Link
                  href="/employer/register"
                  className="font-medium text-primary hover:underline"
                >
                  Register your company
                </Link>
              </p>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              alt="Hiring manager reviewing candidates"
              width={600}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-xl"
              data-ai-hint="hiring manager"
            />
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                Why JobBoardly for Employers?
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                Streamline Your Hiring Process
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Access a diverse talent pool, utilize AI-powered tools, and
                manage applications seamlessly.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
            <div className="grid gap-1 p-6 rounded-lg border bg-card shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UserPlus className="text-primary" />
                Reach Qualified Candidates
              </h3>
              <p className="text-sm text-muted-foreground">
                Tap into our growing network of skilled professionals actively
                seeking new opportunities.
              </p>
            </div>
            <div className="grid gap-1 p-6 rounded-lg border bg-card shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FilePlus className="text-primary" />
                Easy Job Posting
              </h3>
              <p className="text-sm text-muted-foreground">
                Quickly create and publish job listings. Use our AI tools to
                parse job descriptions from documents.
              </p>
            </div>
            <div className="grid gap-1 p-6 rounded-lg border bg-card shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Brain className="text-primary" />
                AI-Powered Assistance
              </h3>
              <p className="text-sm text-muted-foreground">
                Leverage AI to screen candidates and match them to your job
                requirements efficiently. (Coming soon!)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
