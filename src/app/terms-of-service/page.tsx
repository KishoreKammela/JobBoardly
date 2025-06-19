import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-12 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline text-center">
            Terms of Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm sm:prose-base max-w-none">
          <p className="text-muted-foreground text-center">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">1. Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement made
              between you, whether personally or on behalf of an entity (“you”)
              and JobBoardly (“Company“, “we”, “us”, or “our”), concerning your
              access to and use of the JobBoardly website as well as any other
              media form, media channel, mobile website or mobile application
              related, linked, or otherwise connected thereto (collectively, the
              “Site”).
            </p>
            <p>
              You agree that by accessing the Site, you have read, understood,
              and agreed to be bound by all of these Terms of Service. If you do
              not agree with all of these Terms of Service, then you are
              expressly prohibited from using the Site and you must discontinue
              use immediately.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">
              2. Intellectual Property Rights
            </h2>
            <p>
              Unless otherwise indicated, the Site is our proprietary property
              and all source code, databases, functionality, software, website
              designs, audio, video, text, photographs, and graphics on the Site
              (collectively, the “Content”) and the trademarks, service marks,
              and logos contained therein (the “Marks”) are owned or controlled
              by us or licensed to us, and are protected by copyright and
              trademark laws and various other intellectual property rights.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">3. User Representations</h2>
            <p>
              By using the Site, you represent and warrant that: (1) all
              registration information you submit will be true, accurate,
              current, and complete; (2) you will maintain the accuracy of such
              information and promptly update such registration information as
              necessary; (3) you have the legal capacity and you agree to comply
              with these Terms of Service; (4) you are not a minor in the
              jurisdiction in which you reside; (5) you will not access the Site
              through automated or non-human means, whether through a bot,
              script or otherwise; (6) you will not use the Site for any illegal
              or unauthorized purpose; and (7) your use of the Site will not
              violate any applicable law or regulation.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">4. User Registration</h2>
            <p>
              You may be required to register with the Site. You agree to keep
              your password confidential and will be responsible for all use of
              your account and password. We reserve the right to remove,
              reclaim, or change a username you select if we determine, in our
              sole discretion, that such username is inappropriate, obscene, or
              otherwise objectionable.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">5. Prohibited Activities</h2>
            <p>
              You may not access or use the Site for any purpose other than that
              for which we make the Site available. The Site may not be used in
              connection with any commercial endeavors except those that are
              specifically endorsed or approved by us.
            </p>
            <p>As a user of the Site, you agree not to:</p>
            <ul>
              <li>
                Systematically retrieve data or other content from the Site to
                create or compile, directly or indirectly, a collection,
                compilation, database, or directory without written permission
                from us.
              </li>
              <li>
                Make any unauthorized use of the Site, including collecting
                usernames and/or email addresses of users by electronic or other
                means for the purpose of sending unsolicited email, or creating
                user accounts by automated means or under false pretenses.
              </li>
              <li>
                Use a buying agent or purchasing agent to make purchases on the
                Site.
              </li>
              <li>
                Use the Site to advertise or offer to sell goods and services.
              </li>
              <li>
                Circumvent, disable, or otherwise interfere with
                security-related features of the Site.
              </li>
              <li>Engage in unauthorized framing of or linking to the Site.</li>
              <li>
                Defraud, or mislead us and other users, especially in any
                attempt to learn sensitive account information such as user
                passwords.
              </li>
              <li>
                Make improper use of our support services or submit false
                reports of abuse or misconduct.
              </li>
              <li>
                Engage in any automated use of the system, such as using scripts
                to send comments or messages, or using any data mining, robots,
                or similar data gathering and extraction tools.
              </li>
              <li>
                Interfere with, disrupt, or create an undue burden on the Site
                or the networks or services connected to the Site.
              </li>
              <li>
                Attempt to impersonate another user or person or use the
                username of another user.
              </li>
              <li>Sell or otherwise transfer your profile.</li>
              <li>
                Use any information obtained from the Site in order to harass,
                abuse, or harm another person.
              </li>
              <li>
                Use the Site as part of any effort to compete with us or
                otherwise use the Site and/or the Content for any
                revenue-generating endeavor or commercial enterprise.
              </li>
              <li>
                Decipher, decompile, disassemble, or reverse engineer any of the
                software comprising or in any way making up a part of the Site.
              </li>
              <li>
                Attempt to bypass any measures of the Site designed to prevent
                or restrict access to the Site, or any portion of the Site.
              </li>
              <li>
                Harass, annoy, intimidate, or threaten any of our employees or
                agents engaged in providing any portion of the Site to you.
              </li>
              <li>
                Delete the copyright or other proprietary rights notice from any
                Content.
              </li>
              <li>
                Upload or transmit (or attempt to upload or to transmit)
                viruses, Trojan horses, or other material, including excessive
                use of capital letters and spamming (continuous posting of
                repetitive text), that interferes with any party’s uninterrupted
                use and enjoyment of the Site or modifies, impairs, disrupts,
                alters, or interferes with the use, features, functions,
                operation, or maintenance of the Site.
              </li>
              <li>
                Upload or transmit (or attempt to upload or to transmit) any
                material that acts as a passive or active information collection
                or transmission mechanism.
              </li>
              <li>
                Except as may be the result of standard search engine or
                Internet browser usage, use, launch, develop, or distribute any
                automated system, including without limitation, any spider,
                robot, cheat utility, scraper, or offline reader that accesses
                the Site, or using or launching any unauthorized script or other
                software.
              </li>
              <li>
                Disparage, tarnish, or otherwise harm, in our opinion, us and/or
                the Site.
              </li>
              <li>
                Use the Site in a manner inconsistent with any applicable laws
                or regulations.
              </li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">6. Term and Termination</h2>
            <p>
              These Terms of Service shall remain in full force and effect while
              you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE
              TERMS OF SERVICE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION
              AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE
              SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR
              ANY REASON OR FOR NO REASON.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">7. Governing Law</h2>
            <p>
              These Terms shall be governed by and defined following the laws of
              [Your Jurisdiction, e.g., State of California, USA]. JobBoardly
              and yourself irrevocably consent that the courts of [Your
              Jurisdiction] shall have exclusive jurisdiction to resolve any
              dispute which may arise in connection with these terms.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold">8. Contact Us</h2>
            <p>
              In order to resolve a complaint regarding the Site or to receive
              further information regarding use of the Site, please contact us
              at:
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
              <br />
              [Your Contact Email Address]
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
