'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type {
  UserProfile,
  ExperienceEntry,
  EducationEntry,
  LanguageEntry,
} from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Linkedin,
  Globe,
  CalendarCheck2,
  DollarSign,
  UserCheck,
  Loader2,
  AlertCircle,
  FileText,
  Phone,
  Edit,
  Languages as LanguagesIcon,
  Cake,
  Home,
  Users,
  BookOpen,
  Award,
  Sparkles,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { formatCurrencyINR } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { PrintableProfileComponent } from '@/components/PrintableProfile';
import React from 'react';

export default function ProfilePreviewPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [candidate, setCandidate] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printableProfileRef = React.useRef<HTMLDivElement>(null);

  const handlePrintProfile = useReactToPrint({
    content: () => printableProfileRef.current,
    documentTitle: `${currentUser?.name || 'UserProfile'}_JobBoardly_Preview`,
    onPrintError: () =>
      alert('There was an error printing the profile. Please try again.'),
  });

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.replace('/auth/login?redirect=/profile/preview');
      return;
    }
    if (currentUser.role !== 'jobSeeker') {
      setError('Profile preview is only available for job seekers.');
      setIsLoading(false);
      setCandidate(null);
      return;
    }
    setCandidate(currentUser);
    setIsLoading(false);
  }, [currentUser, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading profile preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button variant="link" asChild className="mt-4">
            <Link href="/profile">Go to My Profile</Link>
          </Button>
        </Alert>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-xl text-muted-foreground">
          Could not load profile information.
        </p>
        <Button variant="link" asChild className="mt-4">
          <Link href="/profile">Go to My Profile</Link>
        </Button>
      </div>
    );
  }

  const getAvatarFallback = () => candidate.name?.[0]?.toUpperCase() || 'C';
  const hasProfessionalInfo =
    candidate.experiences?.length ||
    candidate.educations?.length ||
    candidate.parsedResumeText;

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-6 p-4 border border-primary/30 bg-primary/5 rounded-lg text-center flex flex-col sm:flex-row justify-between items-center gap-3">
        <div>
          <p className="text-lg font-semibold text-primary">
            This is a preview of your public profile.
          </p>
          <p className="text-sm text-muted-foreground">
            This is how employers and admins might see your profile if it&apos;s
            searchable.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrintProfile} variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Button asChild variant="default" size="sm">
            <Link href="/profile">
              <Edit className="mr-2 h-4 w-4" /> Edit My Profile
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/20 p-6 rounded-t-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-28 w-28 border-4 border-background shadow-md">
              <AvatarImage
                src={candidate.avatarUrl || `https://placehold.co/128x128.png`}
                alt={candidate.name || 'Candidate'}
                data-ai-hint="candidate photo"
              />
              <AvatarFallback className="text-4xl">
                {getAvatarFallback()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold font-headline text-primary mb-1">
                {candidate.name}
              </h1>
              <p className="text-lg text-foreground mb-2">
                {candidate.headline || 'Job Seeker'}
              </p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {candidate.email && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="h-4 w-4" />{' '}
                    <a
                      href={`mailto:${candidate.email}`}
                      className="hover:underline"
                    >
                      {candidate.email}
                    </a>
                  </div>
                )}
                {candidate.mobileNumber && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Phone className="h-4 w-4" />{' '}
                    <a
                      href={`tel:${candidate.mobileNumber}`}
                      className="hover:underline"
                    >
                      {candidate.mobileNumber}
                    </a>
                  </div>
                )}
                {candidate.homeCity && candidate.homeState && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Home className="h-4 w-4" /> {candidate.homeCity},{' '}
                    {candidate.homeState}
                  </div>
                )}
                {candidate.dateOfBirth && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Cake className="h-4 w-4" /> Born:{' '}
                    {new Date(candidate.dateOfBirth).toLocaleDateString(
                      'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {candidate.parsedResumeText && (
            <section>
              <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2">
                <Sparkles className="text-accent" /> Professional Summary
              </h2>
              <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap p-4 border rounded-md bg-background shadow-inner">
                {candidate.parsedResumeText}
              </div>
            </section>
          )}

          {candidate.experiences && candidate.experiences.length > 0 && (
            <section>
              {candidate.parsedResumeText && <Separator className="my-6" />}
              <h2 className="text-xl font-semibold mb-4 font-headline flex items-center gap-2">
                <Briefcase className="text-primary" /> Work Experience
              </h2>
              <div className="space-y-6">
                {candidate.experiences.map((exp: ExperienceEntry) => (
                  <div
                    key={exp.id}
                    className="pl-4 border-l-2 border-primary/30"
                  >
                    <h3 className="text-lg font-semibold text-foreground">
                      {exp.jobRole}
                    </h3>
                    <p className="text-md font-medium text-primary">
                      {exp.companyName}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      {exp.startDate
                        ? new Date(exp.startDate + '-02').toLocaleDateString(
                            'en-US',
                            { month: 'short', year: 'numeric' }
                          )
                        : 'N/A'}{' '}
                      -
                      {exp.currentlyWorking
                        ? 'Present'
                        : exp.endDate
                          ? new Date(exp.endDate + '-02').toLocaleDateString(
                              'en-US',
                              { month: 'short', year: 'numeric' }
                            )
                          : 'N/A'}
                      {exp.annualCTC &&
                        ` | CTC: ${formatCurrencyINR(exp.annualCTC)}`}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {candidate.educations && candidate.educations.length > 0 && (
            <section>
              {(candidate.parsedResumeText ||
                (candidate.experiences &&
                  candidate.experiences.length > 0)) && (
                <Separator className="my-6" />
              )}
              <h2 className="text-xl font-semibold mb-4 font-headline flex items-center gap-2">
                <GraduationCap className="text-primary" /> Education
              </h2>
              <div className="space-y-6">
                {candidate.educations.map((edu: EducationEntry) => (
                  <div
                    key={edu.id}
                    className={`pl-4 border-l-2 ${edu.isMostRelevant ? 'border-accent' : 'border-primary/30'}`}
                  >
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      {edu.degreeName}
                      {edu.isMostRelevant && (
                        <Badge
                          variant="default"
                          className="bg-accent text-accent-foreground text-xs"
                        >
                          Most Relevant
                        </Badge>
                      )}
                    </h3>
                    <p className="text-md font-medium text-primary">
                      {edu.instituteName}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      {edu.level}{' '}
                      {edu.specialization && ` - ${edu.specialization}`}
                      {edu.startYear &&
                        edu.endYear &&
                        ` | ${edu.startYear} - ${edu.endYear}`}
                      {edu.courseType && ` (${edu.courseType})`}
                    </p>
                    {edu.description && (
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {!hasProfessionalInfo && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Profile Incomplete</AlertTitle>
              <AlertDescription>
                Your summary, experience, and education sections are currently
                empty.
                <Link href="/profile" className="text-primary underline ml-1">
                  Add them now
                </Link>{' '}
                to improve your profile.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2">
                <Award className="text-primary" /> Skills
              </h2>
              {candidate.skills && candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-sm px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 border-primary/30"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skills listed.
                </p>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2">
                <LanguagesIcon className="text-primary" /> Languages
              </h2>
              {candidate.languages && candidate.languages.length > 0 ? (
                <ul className="space-y-1">
                  {candidate.languages.map((lang: LanguageEntry) => (
                    <li key={lang.id} className="text-sm text-foreground/90">
                      <span className="font-medium">{lang.languageName}</span>:{' '}
                      {lang.proficiency}
                      <span className="text-xs text-muted-foreground ml-2">
                        (Read: {lang.canRead ? 'Yes' : 'No'}, Write:{' '}
                        {lang.canWrite ? 'Yes' : 'No'}, Speak:{' '}
                        {lang.canSpeak ? 'Yes' : 'No'})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No languages listed.
                </p>
              )}
            </section>
          </div>

          <Separator className="my-6" />
          <section>
            <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2">
              <UserCheck className="text-primary" /> Preferences & Other Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {candidate.preferredLocations &&
                candidate.preferredLocations.length > 0 && (
                  <p>
                    <strong className="text-foreground/80">
                      Preferred Locations:
                    </strong>{' '}
                    {candidate.preferredLocations.join(', ')}
                  </p>
                )}
              {candidate.jobSearchStatus && (
                <p>
                  <strong className="text-foreground/80">
                    Job Search Status:
                  </strong>{' '}
                  {candidate.jobSearchStatus
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                </p>
              )}
              {candidate.availability && (
                <p>
                  <strong className="text-foreground/80">Availability:</strong>{' '}
                  {candidate.availability}
                </p>
              )}
              {candidate.currentCTCValue !== undefined && (
                <p>
                  <strong className="text-foreground/80">Current CTC:</strong>{' '}
                  {formatCurrencyINR(candidate.currentCTCValue)}/year{' '}
                  {candidate.currentCTCConfidential && '(Confidential)'}
                </p>
              )}
              {candidate.expectedCTCValue !== undefined && (
                <p>
                  <strong className="text-foreground/80">Expected CTC:</strong>{' '}
                  {formatCurrencyINR(candidate.expectedCTCValue)}/year{' '}
                  {candidate.expectedCTCNegotiable && '(Negotiable)'}
                </p>
              )}
            </div>
          </section>

          <Separator className="my-6" />
          <section>
            <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2">
              <BookOpen className="text-primary" /> Links & Resume
            </h2>
            <div className="flex flex-wrap gap-3">
              {candidate.linkedinUrl && (
                <Button variant="outline" asChild>
                  <a
                    href={candidate.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                  </a>
                </Button>
              )}
              {candidate.portfolioUrl && (
                <Button variant="outline" asChild>
                  <a
                    href={candidate.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="mr-2 h-4 w-4" /> Portfolio
                  </a>
                </Button>
              )}
              {candidate.resumeUrl && candidate.resumeFileName && (
                <Button variant="outline" asChild>
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={candidate.resumeFileName}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Download Resume (
                    {candidate.resumeFileName})
                  </a>
                </Button>
              )}
              {!candidate.linkedinUrl &&
                !candidate.portfolioUrl &&
                !candidate.resumeUrl && (
                  <p className="text-sm text-muted-foreground">
                    No external links or resume provided.
                  </p>
                )}
            </div>
          </section>
        </CardContent>

        <CardFooter className="p-6 border-t bg-muted/20 rounded-b-lg">
          <p className="text-xs text-muted-foreground">
            Profile visibility:{' '}
            {candidate.isProfileSearchable === false
              ? 'Not searchable by employers.'
              : 'Searchable by employers.'}
          </p>
        </CardFooter>
      </Card>
      <div style={{ display: 'none' }}>
        <PrintableProfileComponent ref={printableProfileRef} user={candidate} />
      </div>
    </div>
  );
}
