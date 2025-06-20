import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { JobSeekerActionsProvider } from '@/contexts/JobSeekerActionsContext';
import { EmployerActionsProvider } from '@/contexts/EmployerActionsContext';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'
  ),
  title: {
    default: 'JobBoardly - Find Your Next Opportunity | AI-Powered Job Portal',
    template: '%s | JobBoardly',
  },
  description:
    'JobBoardly is an AI-enhanced job board connecting job seekers with employers. Discover AI-driven job matching, resume parsing, and a seamless application process.',
  keywords: [
    'AI job board',
    'job search',
    'find jobs',
    'hire talent',
    'career opportunities',
    'JobBoardly',
    'resume parsing',
    'AI job matching',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'JobBoardly - AI-Powered Job Portal',
    description:
      'Discover your next career move or find top talent with JobBoardly, an intelligent job board platform.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002',
    siteName: 'JobBoardly',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'JobBoardly Logo and Tagline',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobBoardly - AI-Powered Job Portal',
    description:
      'AI-driven job matching and talent acquisition. Find jobs or post openings on JobBoardly.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#1A202C' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>{/* Google Fonts <link> tags for Inter have been removed */}</head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground">
        <AuthProvider>
          <JobSeekerActionsProvider>
            <EmployerActionsProvider>
              <Navbar />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
              <Toaster />
            </EmployerActionsProvider>
          </JobSeekerActionsProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
