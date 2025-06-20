import CompanyDetailClientPage from '@/components/company/CompanyDetailClientPage';
import type { Metadata } from 'next';

// Using static metadata for now to ensure page loads correctly.
// Dynamic metadata can be re-introduced or handled client-side if needed.
export const metadata: Metadata = {
  title: 'Company Profile | JobBoardly',
  description:
    "Explore company profiles on JobBoardly. Learn about a company's culture, view their open positions, and discover your next employer.",
  keywords: [
    'company profile',
    'employer details',
    'jobs at company',
    'company culture',
    'company information',
  ],
  robots: {
    index: true,
    follow: true,
  },
};

type PageProps = {
  params: { companyId: string };
};

export default function CompanyDetailPageServer({ params }: PageProps) {
  return <CompanyDetailClientPage companyId={params.companyId} />;
}
