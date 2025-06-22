export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
export const MAX_ITEMS_PER_TYPE = 1000;

export const staticPages = [
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
  { url: '/auth/admin/login', priority: '0.1', changeFrequency: 'yearly' },
];
