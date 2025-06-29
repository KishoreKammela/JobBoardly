import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gavel } from 'lucide-react';
import { getLegalDocument } from '@/services/legal.services';

export const metadata: Metadata = {
  title: 'Terms of Service - JobBoardly User Agreement',
  description:
    'Read the Terms of Service for using JobBoardly. Understand your rights and responsibilities when using our AI-powered job portal and related services.',
  keywords: [
    'terms of service',
    'JobBoardly terms',
    'user agreement',
    'legal terms',
    'conditions of use',
  ],
  alternates: {
    canonical: '/terms-of-service',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function TermsOfServicePage() {
  const legalDoc = await getLegalDocument('termsOfService');

  const lastUpdatedDate = legalDoc?.lastUpdated
    ? new Date(legalDoc.lastUpdated as string).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const contentToDisplay =
    legalDoc?.content ||
    `Terms of Service content is currently unavailable. Please check back later or contact support if you have immediate questions. Our team is working to update this information. You can reach us at support@jobboardly.app.`;

  return (
    <div className="container mx-auto py-12 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader>
          <h1 className="text-3xl font-bold font-headline text-center">
            Terms of Service
          </h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-center text-sm">
            Last updated: {lastUpdatedDate}
          </p>
          <Separator />

          {!legalDoc?.content && (
            <Alert variant="default" className="bg-yellow-50 border-yellow-300">
              <Gavel className="h-5 w-5 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                The content for this page is managed by our administrators. If
                it appears incomplete or outdated, please contact us or check
                back soon.
              </AlertDescription>
            </Alert>
          )}
          <div
            className="prose prose-sm sm:prose-base max-w-none whitespace-pre-wrap"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {contentToDisplay}
          </div>

          <Separator />
          <section className="text-sm text-muted-foreground">
            <p>
              If you have questions or comments about these Terms, you may email
              us at{' '}
              <Link
                href="mailto:support@jobboardly.app"
                className="text-primary hover:underline"
              >
                support@jobboardly.app
              </Link>
              .
            </p>
            <p className="mt-2">
              <strong>Disclaimer:</strong> This legal document content is
              managed by administrators and should be reviewed by legal
              professionals to ensure it accurately reflects platform operations
              and complies with all applicable laws and regulations.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
