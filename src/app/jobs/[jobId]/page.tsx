import JobDetailClientPage from '@/components/job/job-detail-client-page';
import { getJobById } from '@/services/job.services';
import type { Metadata, ResolvingMetadata } from 'next';

type PageProps = {
  params: { jobId: string };
};

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const jobId = params.jobId;
  const job = await getJobById(jobId);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  if (!job) {
    return {
      title: 'Job Not Found | JobBoardly',
      description: 'The job you are looking for could not be found.',
    };
  }

  const description = `Apply for the ${job.title} position at ${job.company} on JobBoardly. Location: ${job.location}. Responsibilities: ${job.responsibilities?.substring(0, 100)}...`;

  return {
    title: `${job.title} at ${job.company}`,
    description,
    keywords: [
      job.title,
      job.company,
      ...job.skills,
      'job posting',
      'career opportunity',
    ],
    openGraph: {
      title: `${job.title} | ${job.company}`,
      description,
      images: [...previousImages],
    },
    alternates: {
      canonical: `/jobs/${jobId}`,
    },
  };
}

export default async function JobDetailPageServer({ params }: PageProps) {
  const job = await getJobById(params.jobId);

  return <JobDetailClientPage initialJobData={job} />;
}
