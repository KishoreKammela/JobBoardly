import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Job, Company } from '@/types';
import { MAX_ITEMS_PER_TYPE, staticPages } from './_lib/constants';
import { generateSiteMap } from './_lib/utils';

export async function GET() {
  let approvedJobs: Job[] = [];
  let approvedCompanies: Company[] = [];

  try {
    if (!db) {
      console.warn(
        "Sitemap Generation: Firestore 'db' instance is not available. Skipping dynamic content."
      );
    } else {
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('status', '==', 'approved'),
        orderBy('updatedAt', 'desc'),
        limit(MAX_ITEMS_PER_TYPE)
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      approvedJobs = jobsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Job
      );

      const companiesQuery = query(
        collection(db, 'companies'),
        where('status', '==', 'approved'),
        orderBy('updatedAt', 'desc'),
        limit(MAX_ITEMS_PER_TYPE)
      );
      const companiesSnapshot = await getDocs(companiesQuery);
      approvedCompanies = companiesSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Company
      );
    }
  } catch (error) {
    console.error('Error fetching data for sitemap:', error);
  }

  const sitemap = generateSiteMap(staticPages, approvedJobs, approvedCompanies);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
