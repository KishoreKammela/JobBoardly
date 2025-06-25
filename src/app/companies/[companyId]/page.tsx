import CompanyDetailClientPage from '@/components/company/company-detail-client-page';
import {
  getCompanyProfile,
  getCompanyRecruiters,
} from '@/services/company.services';
import { getJobsByCompany } from '@/services/job.services';
import type { Metadata, ResolvingMetadata } from 'next';

type PageProps = {
  params: { companyId: string };
};

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const companyId = params.companyId;
  const company = await getCompanyProfile(companyId);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  if (!company || company.status !== 'approved') {
    return {
      title: 'Company Not Found | JobBoardly',
      description: 'The company you are looking for could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    company.description?.substring(0, 160) ||
    `Explore career opportunities at ${company.name}. View their company profile, culture, and active job listings on JobBoardly.`;

  return {
    title: `${company.name} | Company Profile & Jobs`,
    description,
    keywords: [
      company.name,
      'company profile',
      'careers',
      'jobs at ' + company.name,
      'hiring',
    ],
    openGraph: {
      title: `${company.name} | JobBoardly`,
      description,
      images: company.logoUrl
        ? [company.logoUrl, ...previousImages]
        : previousImages,
    },
    alternates: {
      canonical: `/companies/${companyId}`,
    },
  };
}

export default async function CompanyDetailPageServer({ params }: PageProps) {
  const company = await getCompanyProfile(params.companyId);
  const recruiters =
    company?.recruiterUids && company.recruiterUids.length > 0
      ? await getCompanyRecruiters(company.recruiterUids)
      : [];
  const jobs = company ? await getJobsByCompany(company.id) : [];

  return (
    <CompanyDetailClientPage
      initialCompanyData={company}
      initialRecruitersData={recruiters}
      initialJobsData={jobs}
    />
  );
}
