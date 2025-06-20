import CompanyDetailClientPage from '@/components/company/CompanyDetailClientPage';
import type { Metadata } from 'next';

// Static metadata to simplify
export const metadata: Metadata = {
  title: 'Company Profile | JobBoardly',
  description: 'View company details and open positions on JobBoardly.',
  robots: {
    index: false, // Keep as false until dynamic data loading is reliable
    follow: false,
  },
};

// Define a more specific type for params
type PageProps = {
  params: { companyId: string };
};

export default function CompanyDetailPageServer({ params }: PageProps) {
  // Pass only the companyId string directly to the client component
  return <CompanyDetailClientPage companyId={params.companyId} />;
}
