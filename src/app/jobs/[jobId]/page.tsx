import JobDetailClientPage from '@/components/job/job-detail-client-page';
import type { Metadata } from 'next';

// Using static metadata for now to ensure page loads correctly.
// Dynamic metadata can be re-introduced or handled client-side if needed.
export const metadata: Metadata = {
  title: 'Job Details | JobBoardly',
  description:
    'View detailed information about this job opportunity, including description, skills required, and company details on JobBoardly.',
  keywords: [
    'job details',
    'job posting',
    'career opportunity',
    'apply for job',
    'job description',
    'skills required',
  ],
  robots: {
    index: true,
    follow: true,
  },
};

type PageProps = {
  params: { jobId: string };
};

export default function JobDetailPageServer({ params }: PageProps) {
  return <JobDetailClientPage jobId={params.jobId} />;
}
