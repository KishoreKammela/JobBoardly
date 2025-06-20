import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Job } from '@/types';
import JobDetailClientPage from '@/components/job/JobDetailClientPage'; // New import

type Props = {
  params: { jobId: string };
};

async function fetchJobForMetadata(jobId: string): Promise<Job | null> {
  if (!jobId) return null;
  try {
    const jobDocRef = doc(db, 'jobs', jobId);
    const jobDocSnap = await getDoc(jobDocRef);
    if (jobDocSnap.exists()) {
      const data = jobDocSnap.data();
      // Basic transformation for metadata, more complex date handling might be needed if directly used
      return {
        id: jobDocSnap.id,
        ...data,
        postedDate:
          data.postedDate instanceof Timestamp
            ? data.postedDate.toDate().toISOString()
            : data.postedDate,
        // Ensure other Timestamp fields are handled if used in metadata context
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
      } as Job;
    }
    return null;
  } catch (error) {
    console.error('Error fetching job for metadata:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const jobId = params.jobId;
  const job = await fetchJobForMetadata(jobId);
  const previousImages = (await parent).openGraph?.images || [];

  if (!job || job.status !== 'approved') {
    return {
      title: 'Job Not Found or Unavailable',
      description:
        'This job posting is currently not available or does not exist.',
      alternates: {
        canonical: `/jobs/${jobId}`,
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${job.title} at ${job.company} - ${job.location} | JobBoardly`;
  const description = `Apply for the ${job.title} position at ${job.company} in ${job.location}. ${(job.description || '').substring(0, 150)}... View full job details and apply on JobBoardly.`;
  const keywords = [
    job.title,
    job.company,
    job.location,
    'jobs',
    'careers',
    ...(job.skills || []),
    'JobBoardly',
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `/jobs/${jobId}`,
    },
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/jobs/${jobId}`,
      type: 'article',
      images: job.companyLogoUrl
        ? [
            { url: job.companyLogoUrl, alt: `${job.company} logo` },
            ...previousImages,
          ]
        : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: job.companyLogoUrl ? [job.companyLogoUrl] : undefined,
    },
  };
}

// This is now a Server Component
export default function JobDetailPage({ params }: Props) {
  return <JobDetailClientPage params={params} />;
}
