import JobDetailClientPage from '@/components/job/JobDetailClientPage';
import type { Metadata } from 'next';

// Static metadata to simplify and rule out metadata generation as the cause of ID issues
export const metadata: Metadata = {
  title: 'Job Details | JobBoardly',
  description: 'View detailed information about a job posting on JobBoardly.',
  robots: {
    index: false, // Keep as false until dynamic data loading is reliable
    follow: false,
  },
};

// Define a more specific type for params
type PageProps = {
  params: { jobId: string };
};

export default function JobDetailPageServer({ params }: PageProps) {
  // Pass only the jobId string directly to the client component
  return <JobDetailClientPage jobId={params.jobId} />;
}
