import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Company } from '@/types';
import CompanyDetailClientPage from '@/components/company/CompanyDetailClientPage';

// Props type is still useful for clarity, even if not directly destructured in signature
type Props = {
  params: { companyId: string };
};

async function fetchCompanyForMetadata(
  companyId: string
): Promise<Company | null> {
  if (!companyId) return null;
  try {
    const companyDocRef = doc(db, 'companies', companyId);
    const companyDocSnap = await getDoc(companyDocRef);
    if (companyDocSnap.exists()) {
      const data = companyDocSnap.data();
      return {
        id: companyDocSnap.id,
        ...data,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
      } as Company;
    }
    return null;
  } catch (error) {
    console.error('Error fetching company for metadata:', error);
    return null;
  }
}

export async function generateMetadata(
  props: Props, // Changed from { params } to props
  parent: ResolvingMetadata
): Promise<Metadata> {
  const companyId = props.params.companyId; // Access via props.params
  const company = await fetchCompanyForMetadata(companyId);
  const previousImages = (await parent).openGraph?.images || [];

  if (!company || company.status !== 'approved') {
    return {
      title: 'Company Profile Not Found or Unavailable',
      description:
        'This company profile is currently not available or does not exist.',
      alternates: {
        canonical: `/companies/${companyId}`,
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${company.name} - Company Profile & Jobs | JobBoardly`;
  const description = `Learn about ${company.name}, their culture, and open job positions on JobBoardly. ${(company.description || '').substring(0, 150)}... View their profile for more details.`;
  const keywords = [
    company.name,
    'company profile',
    'jobs',
    'careers',
    'JobBoardly',
    'employer',
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `/companies/${companyId}`,
    },
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/companies/${companyId}`,
      type: 'profile',
      profile: {
        username: company.name,
      },
      images: company.logoUrl
        ? [
            { url: company.logoUrl, alt: `${company.name} logo` },
            ...previousImages,
          ]
        : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: company.logoUrl ? [company.logoUrl] : undefined,
    },
  };
}

export default function CompanyDetailPage({ params }: Props) {
  return <CompanyDetailClientPage params={params} />;
}
