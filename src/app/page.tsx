import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Zap } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center">
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4 text-left">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Find Your Dream Job with JobBoardly
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Discover thousands of opportunities tailored to your skills and experience. Let our AI-powered platform guide you to your next career move.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="shadow-lg hover:shadow-primary/50 transition-shadow">
                  <Link href="/jobs">
                    <Search className="mr-2 h-5 w-5" /> Explore Jobs
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/ai-match">
                    <Zap className="mr-2 h-5 w-5" /> AI Job Matcher
                  </Link>
                </Button>
              </div>
            </div>
             <Image
              src="https://placehold.co/600x400.png"
              alt="Hero image showing diverse professionals working"
              width={600}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-xl"
              data-ai-hint="professionals collaboration"
            />
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why Choose JobBoardly?</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We leverage cutting-edge technology to make your job search smarter, faster, and more effective.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
            <div className="grid gap-1 p-6 rounded-lg border bg-card shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold flex items-center gap-2"><Zap className="text-primary"/>AI-Powered Matching</h3>
              <p className="text-sm text-muted-foreground">
                Our intelligent algorithms connect you with jobs that truly fit your profile, saving you time and effort.
              </p>
            </div>
            <div className="grid gap-1 p-6 rounded-lg border bg-card shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold flex items-center gap-2"><Search className="text-primary"/>Advanced Search & Filters</h3>
              <p className="text-sm text-muted-foreground">
                Easily narrow down your options with comprehensive filters for location, role type, remote work, and more.
              </p>
            </div>
            <div className="grid gap-1 p-6 rounded-lg border bg-card shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold flex items-center gap-2"><ArrowRight className="text-primary"/>One-Click Apply</h3>
              <p className="text-sm text-muted-foreground">
                Streamline your application process. Upload your resume once and apply to multiple jobs with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
