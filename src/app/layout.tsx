import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/Auth/AuthContext';
import { UserProfileProvider } from '@/contexts/UserProfile/UserProfileContext';
import { CompanyProvider } from '@/contexts/Company/CompanyContext';
import { NotificationProvider } from '@/contexts/Notification/NotificationContext';
import { JobSeekerActionsProvider } from '@/contexts/JobSeekerActionsContext/JobSeekerActionsContext';
import { EmployerActionsProvider } from '@/contexts/EmployerActionsContext/EmployerActionsContext';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';
import GlobalLoadingIndicatorWrapper from '@/components/layout/GlobalLoadingIndicatorWrapper';

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
    default:
      'JobBoardly: AI-Powered Job Search & Hiring Platform - Find Your Future',
    template: '%s | JobBoardly',
  },
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#007bff' },
    { media: '(prefers-color-scheme: dark)', color: '#0056b3' },
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
      <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground">
        <AuthProvider>
          <UserProfileProvider>
            <CompanyProvider>
              <NotificationProvider>
                <JobSeekerActionsProvider>
                  <EmployerActionsProvider>
                    <Navbar />
                    <main className="flex flex-col flex-grow container mx-auto px-4 py-8">
                      <GlobalLoadingIndicatorWrapper>
                        {children}
                      </GlobalLoadingIndicatorWrapper>
                    </main>
                    <Footer />
                    <Toaster />
                  </EmployerActionsProvider>
                </JobSeekerActionsProvider>
              </NotificationProvider>
            </CompanyProvider>
          </UserProfileProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
