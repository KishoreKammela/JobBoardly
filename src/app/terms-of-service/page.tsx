// src/app/terms-of-service/page.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-12 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">
            Terms of Service
          </CardTitle>
          <CardDescription>
            Last Updated: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm sm:prose-base max-w-none">
          <p>
            Please read these Terms of Service (&quot;Terms&quot;, &quot;Terms
            of Service&quot;) carefully before using the JobBoardly website (the
            &quot;Service&quot;) operated by JobBoardly (&quot;us&quot;,
            &quot;we&quot;, or &quot;our&quot;).
          </p>

          <Separator />
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Service, you agree to be bound by these
            Terms. If you disagree with any part of the terms, then you may not
            access the Service.
          </p>

          <Separator />
          <h2 className="text-xl font-semibold">2. Accounts</h2>
          <p>
            When you create an account with us, you must provide information
            that is accurate, complete, and current at all times. Failure to do
            so constitutes a breach of the Terms, which may result in immediate
            termination of your account on our Service.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to
            access the Service and for any activities or actions under your
            password.
          </p>

          <Separator />
          <h2 className="text-xl font-semibold">3. User Content</h2>
          <p>
            Our Service allows you to post, link, store, share and otherwise
            make available certain information, text, graphics, videos, or other
            material ("Content"). You are responsible for the Content that you
            post on or through the Service, including its legality, reliability,
            and appropriateness.
          </p>

          <Separator />
          <h2 className="text-xl font-semibold">4. Prohibited Uses</h2>
          <p>You agree not to use the Service:</p>
          <ul className="list-disc pl-6">
            <li>
              In any way that violates any applicable national or international
              law or regulation.&quot;
            </li>
            <li>
              &quot; For the purpose of exploiting, harming, or attempting to
              exploit or harm minors in any way.
            </li>
            <li>
              To transmit, or procure the sending of, any advertising or
              promotional material, including any "junk mail", "chain letter,"
              "spam," or any other similar solicitation.
            </li>
            &quot;
            <li>
              To impersonate or attempt to impersonate JobBoardly, a JobBoardly
              employee, another user, or any other person or entity.
            </li>
          </ul>

          <Separator />
          <h2 className="text-xl font-semibold">5. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by
            users), features, and functionality are and will remain the
            exclusive property of JobBoardly and its licensors.
          </p>

          <Separator />
          <h2 className="text-xl font-semibold">6. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the
            Service immediately, without prior notice or liability, under our
            sole discretion, for any reason whatsoever and without limitation,
            including but not limited to a breach of the Terms.
          </p>

          <Separator />
          <h2 className="text-xl font-semibold">7. Disclaimer</h2>
          <p>
            Your use of the Service is at your sole risk.&quot; The Service is
            provided on an "AS IS" and "AS AVAILABLE" basis. The Service is
            provided without warranties of any kind, whether express or implied.
          </p>

          <Separator />
          <h2 className="text-xl font-semibold">8. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the
            laws of [Your Jurisdiction], without regard to its conflict of law
            provisions.
          </p>

          <Separator />
          <h2 className="text-xl font-semibold">9. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. We will try to provide at least 30 days'
            notice prior to any new terms taking effect.
          </p>

          <Separator />
          <h2 className="text-xl font-semibold">10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            legal@jobboardly.example.com (replace with actual contact).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
