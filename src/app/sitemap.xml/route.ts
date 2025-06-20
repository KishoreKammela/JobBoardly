import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust path as needed
import type { Job, Company } from '@/types'; // Adjust path as needed

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
const MAX_ITEMS_PER_TYPE = 1000; // Limit to avoid overly large sitemaps

function generateSiteMap(
  staticPages: {
    url: string;
    lastModified?: string;
    changeFrequency?: string;
    priority?: string;
  }[],
  jobs: Job[],
  companies: Company[]
) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      ({ url, lastModified, changeFrequency, priority }) => `
    <url>
      <loc>${BASE_URL}${url}</loc>
      ${lastModified ? `<lastmod>${lastModified}</lastmod>` : `<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`}
      <changefreq>${changeFrequency || 'monthly'}</changefreq>
      <priority>${priority || '0.7'}</priority>
    </url>
  `
    )
    .join('')}
  ${jobs
    .map(({ id, updatedAt, createdAt }) => {
      const lastMod = updatedAt || createdAt;
      const lastModDate =
        lastMod instanceof Timestamp
          ? lastMod.toDate().toISOString()
          : typeof lastMod === 'string'
            ? lastMod
            : new Date().toISOString();
      return `
    <url>
      <loc>${`${BASE_URL}/jobs/${id}`}</loc>
      <lastmod>${lastModDate.split('T')[0]}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>
  `;
    })
    .join('')}
  ${companies
    .map(({ id, updatedAt, createdAt }) => {
      const lastMod = updatedAt || createdAt;
      const lastModDate =
        lastMod instanceof Timestamp
          ? lastMod.toDate().toISOString()
          : typeof lastMod === 'string'
            ? lastMod
            : new Date().toISOString();
      return `
    <url>
      <loc>${`${BASE_URL}/companies/${id}`}</loc>
      <lastmod>${lastModDate.split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `;
    })
    .join('')}
</urlset>
`;
}

export async function GET() {
  const staticPages = [
    { url: '/', priority: '1.0', changeFrequency: 'weekly' },
    { url: '/jobs', priority: '0.9', changeFrequency: 'daily' },
    { url: '/companies', priority: '0.8', changeFrequency: 'weekly' },
    { url: '/employer', priority: '0.7', changeFrequency: 'monthly' },
    { url: '/privacy-policy', priority: '0.3', changeFrequency: 'yearly' },
    { url: '/terms-of-service', priority: '0.3', changeFrequency: 'yearly' },
    { url: '/sitemap', priority: '0.4', changeFrequency: 'monthly' },
    { url: '/auth/login', priority: '0.5', changeFrequency: 'monthly' },
    { url: '/auth/register', priority: '0.5', changeFrequency: 'monthly' },
    { url: '/employer/login', priority: '0.5', changeFrequency: 'monthly' },
    { url: '/employer/register', priority: '0.5', changeFrequency: 'monthly' },
    { url: '/auth/admin/login', priority: '0.1', changeFrequency: 'yearly' }, // Low priority for admin login
  ];

  let approvedJobs: Job[] = [];
  let approvedCompanies: Company[] = [];

  try {
    // Fetch approved jobs
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('status', '==', 'approved'),
      orderBy('updatedAt', 'desc'), // Order by most recently updated
      limit(MAX_ITEMS_PER_TYPE)
    );
    const jobsSnapshot = await getDocs(jobsQuery);
    approvedJobs = jobsSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Job
    );

    // Fetch approved companies
    const companiesQuery = query(
      collection(db, 'companies'),
      where('status', '==', 'approved'),
      orderBy('updatedAt', 'desc'), // Order by most recently updated
      limit(MAX_ITEMS_PER_TYPE)
    );
    const companiesSnapshot = await getDocs(companiesQuery);
    approvedCompanies = companiesSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Company
    );
  } catch (error) {
    console.error('Error fetching data for sitemap:', error);
    // Fallback to sitemap with only static pages in case of DB error
  }

  const sitemap = generateSiteMap(staticPages, approvedJobs, approvedCompanies);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
