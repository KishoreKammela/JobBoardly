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
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/og-image.png`, // Replace with your actual OG image URL
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
    // images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/twitter-image.png`], // Replace with your actual Twitter image URL
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
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' }, // Corresponds to --background HSL(210 17% 98%)
    { media: '(prefers-color-scheme: dark)', color: '#1A202C' }, // Corresponds to --background HSL(220 14% 10%) for dark mode
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // userScalable: false, // Consider if you want to disable pinch-to-zoom
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
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
