import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-primary mb-3"
            >
              <Briefcase className="h-6 w-6" />
              <h3 className="text-lg font-bold font-headline text-foreground">
                JobBoardly
              </h3>
            </Link>
            <p>
              &copy; {new Date().getFullYear()} JobBoardly. All rights reserved.
            </p>
            <p className="mt-1">AI-Powered Job Matching.</p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">
              For Job Seekers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/jobs" className="hover:text-primary">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-primary">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-primary">
                  Job Seeker Login
                </Link>
              </li>
              <li>
                <Link href="/ai-match" className="hover:text-primary">
                  AI Job Matcher
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">
              For Employers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/employer" className="hover:text-primary">
                  Employer Home
                </Link>
              </li>
              <li>
                <Link href="/employer/post-job" className="hover:text-primary">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/employer/register" className="hover:text-primary">
                  Company Registration
                </Link>
              </li>
              <li>
                <Link href="/employer/login" className="hover:text-primary">
                  Employer Login
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/ai-candidate-match"
                  className="hover:text-primary"
                >
                  AI Candidate Matcher
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/companies" className="hover:text-primary">
                  Browse Companies
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="hover:text-primary">
                  Sitemap
                </Link>
              </li>
              <li>
                <Link href="/auth/admin/login" className="hover:text-primary">
                  Admin Login
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
