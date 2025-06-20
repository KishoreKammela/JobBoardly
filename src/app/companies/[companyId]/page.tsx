import type { Metadata } from 'next'; // Removed ResolvingMetadata
// import { doc, getDoc, Timestamp } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
// import type { Company } from '@/types';
import CompanyDetailClientPage from '@/components/company/CompanyDetailClientPage';

type PageProps = {
  params: { companyId: string };
};

// Temporarily commenting out dynamic metadata
/*
async function fetchCompanyForMetadata(
  companyId: string
): Promise<Company | null> {
  if (!db) {
    console.error(
      'Firestore instance (db) is not available in fetchCompanyForMetadata. Firebase might not be initialized correctly.'
    );
    return null;
  }
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
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  await Promise.resolve(); // Trivial await

  const companyId = params.companyId;

  if (!companyId) {
    return {
      title: 'Company Profile Not Found or Unavailable',
      description:
        'The company ID is missing or this company profile is currently not available or does not exist.',
      alternates: {
        canonical: `/companies/not-found`,
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }

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
*/

export const metadata: Metadata = {
  title: 'Company Profile | JobBoardly',
  description: 'View company details and open positions on JobBoardly.',
  robots: {
    index: false, // Keep as false for now if dynamic data isn't loading reliably
    follow: false,
  },
};

export default function CompanyDetailPageServer({ params }: PageProps) {
  // Pass the params directly to the client component with a distinct prop name
  return <CompanyDetailClientPage routeParams={params} />;
}
