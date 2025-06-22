import { Timestamp } from 'firebase/firestore';
import type { Job, Company } from '@/types';
import { BASE_URL } from './constants';

export function generateSiteMap(
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
