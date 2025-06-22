import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { sitemapLinks } from './_lib/data';

export const metadata: Metadata = {
  title: 'Sitemap - Navigate JobBoardly',
  description:
    'Explore all sections of JobBoardly. Find links to job searches, company profiles, employer resources, legal information, and more to easily navigate our site.',
  keywords: [
    'sitemap',
    'JobBoardly navigation',
    'site structure',
    'all pages',
    'navigate JobBoardly',
  ],
  alternates: {
    canonical: '/sitemap',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SitemapPage() {
  return (
    <div className="container mx-auto py-12 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold font-headline">
            JobBoardly Sitemap
          </h1>
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
