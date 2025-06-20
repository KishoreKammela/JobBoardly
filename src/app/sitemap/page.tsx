import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Briefcase,
  Building,
  Users,
  FileText,
  KeyRound,
  ShieldCheck,
  Lock,
  FileSignature,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sitemap - Navigate JobBoardly',
  description:
    'Explore all sections of JobBoardly. Find links to job searches, company profiles, employer resources, legal information, and more.',
  keywords: ['sitemap', 'JobBoardly navigation', 'site structure', 'all pages'],
  alternates: {
    canonical: '/sitemap',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const sitemapLinks = [
  {
    category: 'Main Navigation',
    icon: <Home className="h-5 w-5 text-primary" />,
    links: [
      { href: '/', label: 'Home Page' },
      { href: '/jobs', label: 'Find Jobs' },
      { href: '/companies', label: 'Browse Companies' },
      { href: '/employer', label: 'For Employers' },
    ],
  },
  {
    category: 'Job Seeker',
    icon: <Briefcase className="h-5 w-5 text-primary" />,
    links: [
      { href: '/auth/login', label: 'Job Seeker Login' },
      { href: '/auth/register', label: 'Job Seeker Registration' },
      { href: '/profile', label: 'My Profile (requires login)' },
      { href: '/my-jobs', label: 'My Jobs (Saved/Applied - requires login)' },
      { href: '/ai-match', label: 'AI Job Matcher (requires login)' },
    ],
  },
  {
    category: 'Employer',
    icon: <Building className="h-5 w-5 text-primary" />,
    links: [
      { href: '/employer/login', label: 'Employer Login' },
      { href: '/employer/register', label: 'Employer Registration' },
      { href: '/employer/post-job', label: 'Post a Job (requires login)' },
      {
        href: '/employer/posted-jobs',
        label: 'My Posted Jobs (requires login)',
      },
      {
        href: '/employer/find-candidates',
        label: 'Find Candidates (requires login)',
      },
      {
        href: '/employer/ai-candidate-match',
        label: 'AI Candidate Matcher (requires login)',
      },
    ],
  },
  {
    category: 'Platform Staff',
    icon: <ShieldCheck className="h-5 w-5 text-primary" />,
    links: [
      { href: '/auth/admin/login', label: 'Admin Login' },
      // Add '/admin' if you want it listed, though it requires login
    ],
  },
  {
    category: 'User Account',
    icon: <Users className="h-5 w-5 text-primary" />,
    links: [
      {
        href: '/auth/change-password',
        label: 'Change Password (requires login)',
      },
      { href: '/settings', label: 'Account Settings (requires login)' },
    ],
  },
  {
    category: 'Legal & Information',
    icon: <FileText className="h-5 w-5 text-primary" />,
    links: [
      { href: '/privacy-policy', label: 'Privacy Policy' },
      { href: '/terms-of-service', label: 'Terms of Service' },
      {
        href: '/sitemap.xml',
        label: 'XML Sitemap (for search engines)',
        isExternal: true,
      },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="container mx-auto py-12 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline">
            JobBoardly Sitemap
          </CardTitle>
          <CardDescription>
            Navigate through all sections of our platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {sitemapLinks.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="flex items-center gap-3 mb-4">
                {section.icon}
                <h2 className="text-2xl font-semibold font-headline">
                  {section.category}
                </h2>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 list-inside">
                {section.links.map((link, linkIndex) => (
                  <li
                    key={linkIndex}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    <Link
                      href={link.href}
                      target={link.isExternal ? '_blank' : '_self'}
                      rel={link.isExternal ? 'noopener noreferrer' : ''}
                    >
                      - {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {sectionIndex < sitemapLinks.length - 1 && (
                <Separator className="mt-8" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
