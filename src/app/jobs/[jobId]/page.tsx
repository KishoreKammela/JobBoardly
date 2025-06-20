import JobDetailClientPage from '@/components/job/JobDetailClientPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Details | JobBoardly',
  description: 'View detailed information about a job posting on JobBoardly.',
};

type PageProps = {
  params: { jobId: string };
};

export default function JobDetailPageServer({ params }: PageProps) {
  return <JobDetailClientPage jobId={params.jobId} />;
}
