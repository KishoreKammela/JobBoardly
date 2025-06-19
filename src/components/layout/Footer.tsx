import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div>
            <h3 className="font-semibold text-foreground mb-2">JobBoardly</h3>
            <p>
              &copy; {new Date().getFullYear()} JobBoardly. All rights reserved.
            </p>
            <p className="mt-1">
              Powered by AI to help you find your dream job.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/jobs" className="hover:text-primary">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-primary">
                  Companies
                </Link>
              </li>
              <li>
                <Link href="/employer" className="hover:text-primary">
                  For Employers
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-primary">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-primary">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Legal</h3>
            <ul className="space-y-1">
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
