import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline text-center">
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm sm:prose-base max-w-none">
          <p className="text-muted-foreground text-center">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p>
              Welcome to JobBoardly (&quot;we&quot;, &quot;our&quot;, or
              &quot;us&quot;). We are committed to protecting your personal
              information and your right to privacy. If you have any questions
              or concerns about this privacy notice, or our practices with
              regards to your personal information, please contact us.
            </p>
            <p>
              This privacy notice describes how we might use your information if
              you:
            </p>
            <ul>
              <li>Visit our website at [Your Website URL]</li>
              <li>
                Engage with us in other related ways ― including any sales,
                marketing, or events
              </li>
            </ul>
            <p>In this privacy notice, if we refer to:</p>
            <ul>
              <li>
                &quot;Website&quot;, we are referring to any website of ours
                that references or links to this policy
              </li>
              <li>
                &quot;Services&quot;, we are referring to our Website, and other
                related services, including any sales, marketing, or events
              </li>
            </ul>
            <p>
              The purpose of this privacy notice is to explain to you in the
              clearest way possible what information we collect, how we use it,
              and what rights you have in relation to it. If there are any terms
              in this privacy notice that you do not agree with, please
              discontinue use of our Services immediately.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">2. Information We Collect</h2>
            <p>
              <strong>Personal information you disclose to us:</strong> We
              collect personal information that you voluntarily provide to us
              when you register on the Services, express an interest in
              obtaining information about us or our products and Services, when
              you participate in activities on the Services or otherwise when
              you contact us.
            </p>
            <p>
              The personal information that we collect depends on the context of
              your interactions with us and the Services, the choices you make
              and the products and features you use. The personal information we
              collect may include the following: Name, Email Address, Phone
              Number, Resume Data, Employment History, Skills, etc.
            </p>
            <p>
              <strong>Information automatically collected:</strong> We
              automatically collect certain information when you visit, use or
              navigate the Services. This information does not reveal your
              specific identity (like your name or contact information) but may
              include device and usage information, such as your IP address,
              browser and device characteristics, operating system, language
              preferences, referring URLs, device name, country, location,
              information about how and when you use our Services and other
              technical information.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">
              3. How We Use Your Information
            </h2>
            <p>
              We use personal information collected via our Services for a
              variety of business purposes described below. We process your
              personal information for these purposes in reliance on our
              legitimate business interests, in order to enter into or perform a
              contract with you, with your consent, and/or for compliance with
              our legal obligations.
            </p>
            <ul>
              <li>To facilitate account creation and logon process.</li>
              <li>To post testimonials.</li>
              <li>To manage user accounts.</li>
              <li>To send administrative information to you.</li>
              <li>To protect our Services.</li>
              <li>
                To enable user-to-user communications (with user consent).
              </li>
              <li>To respond to user inquiries/offer support to users.</li>
              <li>
                For other Business Purposes, such as data analysis, identifying
                usage trends, determining the effectiveness of our promotional
                campaigns and to evaluate and improve our Services, products,
                marketing and your experience.
              </li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">
              4. Will Your Information Be Shared With Anyone?
            </h2>
            <p>
              We only share information with your consent, to comply with laws,
              to provide you with services, to protect your rights, or to
              fulfill business obligations.
            </p>
            <p>
              Specifically, we may need to process your data or share your
              personal information in the following situations:
            </p>
            <ul>
              <li>
                <strong>Business Transfers.</strong> We may share or transfer
                your information in connection with, or during negotiations of,
                any merger, sale of company assets, financing, or acquisition of
                all or a portion of our business to another company.
              </li>
              <li>
                <strong>Affiliates.</strong> We may share your information with
                our affiliates, in which case we will require those affiliates
                to honor this privacy notice. Affiliates include our parent
                company and any subsidiaries, joint venture partners or other
                companies that we control or that are under common control with
                us.
              </li>
              <li>
                <strong>Business Partners.</strong> We may share your
                information with our business partners to offer you certain
                products, services or promotions.
              </li>
              <li>
                <strong>
                  With other users (e.g., employers or job seekers).
                </strong>{' '}
                When you share personal information (for example, by posting a
                job or applying for one) or otherwise interact with public areas
                of the Services, such personal information may be viewed by all
                users and may be publicly distributed outside the Services in
                perpetuity.
              </li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">5. Your Privacy Rights</h2>
            <p>
              In some regions (like the European Economic Area and the United
              Kingdom), you have certain rights under applicable data protection
              laws. These may include the right (i) to request access and obtain
              a copy of your personal information, (ii) to request rectification
              or erasure; (iii) to restrict the processing of your personal
              information; and (iv) if applicable, to data portability. In
              certain circumstances, you may also have the right to object to
              the processing of your personal information. To make such a
              request, please use the contact details provided below. We will
              consider and act upon any request in accordance with applicable
              data protection laws.
            </p>
            <p>
              If we are relying on your consent to process your personal
              information, you have the right to withdraw your consent at any
              time. Please note however that this will not affect the lawfulness
              of the processing before its withdrawal, nor will it affect the
              processing of your personal information conducted in reliance on
              lawful processing grounds other than consent.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">6. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational
              security measures designed to protect the security of any personal
              information we process. However, despite our safeguards and
              efforts to secure your information, no electronic transmission
              over the Internet or information storage technology can be
              guaranteed to be 100% secure, so we cannot promise or guarantee
              that hackers, cybercriminals, or other unauthorized third parties
              will not be able to defeat our security, and improperly collect,
              access, steal, or modify your information.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">7. Updates to This Notice</h2>
            <p>
              We may update this privacy notice from time to time. The updated
              version will be indicated by an updated &quot;Revised&quot; date
              and the updated version will be effective as soon as it is
              accessible. We encourage you to review this privacy notice
              frequently to be informed of how we are protecting your
              information.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">8. Contact Us</h2>
            <p>
              If you have questions or comments about this notice, you may email
              us at [Your Contact Email Address] or by post to:
            </p>
            <p>
              [Your Company Name]
              <br />
              [Your Company Address Line 1]
              <br />
              [Your Company Address Line 2]
              <br />
              [City, State, Zip/Postal Code]
              <br />
              [Country]
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
