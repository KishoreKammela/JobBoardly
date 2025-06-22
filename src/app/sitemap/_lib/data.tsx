import {
  Home,
  Briefcase,
  Building,
  Users,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export const sitemapLinks = [
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
    links: [{ href: '/auth/admin/login', label: 'Admin Login' }],
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
