import { db } from '@/lib/firebase';
import type { Job, Company } from '@/types';
import { staticPages } from './_lib/constants';
import { generateSiteMap } from './_lib/utils';
import { getApprovedJobs } from '@/services/job.services';
import { getApprovedCompanies } from '@/services/company.services';

export async function GET() {
  let approvedJobs: Job[] = [];
  let approvedCompanies: Company[] = [];

  try {
    if (!db) {
      console.warn(
        "Sitemap Generation: Firestore 'db' instance is not available. Skipping dynamic content."
      );
    } else {
      approvedJobs = await getApprovedJobs();
      approvedCompanies = await getApprovedCompanies();
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
