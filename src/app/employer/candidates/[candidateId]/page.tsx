'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import type {
  UserProfile,
  ExperienceEntry,
  EducationEntry,
  LanguageEntry,
  UserRole,
} from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import {
  Briefcase,
  GraduationCap,
  Mail,
  Linkedin,
  Globe,
  Loader2,
  AlertCircle,
  FileText,
  Phone,
  Languages as LanguagesIcon,
  Cake,
  Home,
  Sparkles,
  BookOpen,
  Award,
  Download,
  Users,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { formatCurrencyINR } from '@/lib/utils';
import { useReactToPrint } from 'react-to-print';
import { PrintableProfile } from '@/components/printable-profile';
import { format, isValid, parse } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_LIKE_ROLES_CANDIDATE_PAGE } from './_lib/constants';
import { fetchCandidateProfile } from './_lib/actions';

export default function CandidateDetailPage() {
  const params = useParams();
  const candidateId = params.candidateId as string;
  const { user: currentUser, company, loading: authLoading } = useAuth();
  const router = useRouter();
  const currentPathname = usePathname();
  const { toast } = useToast();

  const [candidate, setCandidate] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printableProfileRef = useRef<HTMLDivElement>(null);

  const handlePrintProfile = useReactToPrint({
    content: () => printableProfileRef.current,
    documentTitle: `${candidate?.name || 'CandidateProfile'}_JobBoardly`,
    onPrintError: () =>
      alert('There was an error printing the profile. Please try again.'),
  });

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in as an employer or admin to view this page.',
        variant: 'destructive',
      });
      router.replace(
        `/employer/login?redirect=${encodeURIComponent(currentPathname)}`
      );
      return;
    }
    if (
      currentUser.role !== 'employer' &&
      !ADMIN_LIKE_ROLES_CANDIDATE_PAGE.includes(currentUser.role as UserRole)
    ) {
      toast({
        title: 'Access Denied',
        description: 'This page is for employers and platform staff only.',
        variant: 'destructive',
      });
      if (currentUser.role === 'jobSeeker') {
        router.replace('/jobs');
      } else {
        router.replace('/');
      }
      return;
    }

    if (
      currentUser.role === 'employer' &&
      company &&
      (company.status === 'suspended' || company.status === 'deleted')
    ) {
      toast({
        title: 'Company Account Restricted',
        description: `Your company account is ${company.status}. Candidate profile viewing is restricted.`,
        variant: 'destructive',
      });
      router.replace('/employer/posted-jobs');
      return;
    }
  }, [currentUser, company, authLoading, router, currentPathname, toast]);

  useEffect(() => {
    if (
      !candidateId ||
      !currentUser ||
      (currentUser.role !== 'employer' &&
        !ADMIN_LIKE_ROLES_CANDIDATE_PAGE.includes(currentUser.role as UserRole))
    ) {
      if (!candidateId) {
        setError('No candidate ID specified.');
        setIsLoading(false);
      }
      return;
    }
    fetchCandidateProfile(candidateId, setCandidate, setError, setIsLoading);
  }, [candidateId, currentUser]);

  useEffect(() => {
    if (
      !isLoading &&
      candidate &&
      currentUser &&
      currentUser.role === 'employer'
    ) {
      if (candidate.role !== 'jobSeeker') {
        toast({
          title: 'Access Denied',
          description: 'Employers can only view job seeker profiles.',
          variant: 'destructive',
        });
        router.replace('/employer/find-candidates');
      }
    }
  }, [isLoading, candidate, currentUser, router, toast]);

  if (authLoading || isLoading || (!currentUser && !authLoading)) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading user profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Profile</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-xl text-muted-foreground">
          User profile not found or there was an issue loading the data.
        </p>
      </div>
    );
  }

  const getAvatarFallback = () => candidate.name?.[0]?.toUpperCase() || 'U';
  const isJobSeekerProfile = candidate.role === 'jobSeeker';
  const hasProfessionalInfo =
    isJobSeekerProfile &&
    (candidate.experiences?.length ||
      candidate.educations?.length ||
      candidate.parsedResumeText);

  const totalExperienceString = () => {
    const years = candidate.totalYearsExperience || 0;
    const months = candidate.totalMonthsExperience || 0;
    if (years === 0 && months === 0) return null;
    let str = '';
    if (years > 0) str += `${years} year${years > 1 ? 's' : ''}`;
    if (months > 0) {
      if (str) str += ', ';
      str += `${months} month${months > 1 ? 's' : ''}`;
    }
    return str;
  };
  const totalExperienceDisplay = isJobSeekerProfile
    ? totalExperienceString()
    : null;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/20 p-6 rounded-t-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-28 w-28 border-4 border-background shadow-md">
              <AvatarImage
                src={candidate.avatarUrl || `https://placehold.co/128x128.png`}
                alt={candidate.name || 'User'}
                data-ai-hint="user photo"
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
                {candidate.headline ||
                  candidate.role
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
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
                {candidate.mobileNumber && isJobSeekerProfile && (
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
                {(candidate.homeCity || candidate.homeState) &&
                  isJobSeekerProfile && (
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Home className="h-4 w-4" />{' '}
                      {candidate.homeCity && <span>{candidate.homeCity}</span>}
                      {candidate.homeCity && candidate.homeState && (
                        <span>, </span>
                      )}
                      {candidate.homeState && (
                        <span>{candidate.homeState}</span>
                      )}
                    </div>
                  )}
                {candidate.dateOfBirth &&
                  isJobSeekerProfile &&
                  isValid(
                    parse(candidate.dateOfBirth, 'yyyy-MM-dd', new Date())
                  ) && (
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Cake className="h-4 w-4" /> Born:{' '}
                      {format(
                        parse(candidate.dateOfBirth, 'yyyy-MM-dd', new Date()),
                        'PPP'
                      )}
                    </div>
                  )}
                {candidate.gender &&
                  isJobSeekerProfile &&
                  candidate.gender !== 'Prefer not to say' && (
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Users className="h-4 w-4" /> Gender: {candidate.gender}
                    </div>
                  )}
              </div>
            </div>
            {currentUser?.role === 'employer' &&
              isJobSeekerProfile &&
              candidate.isProfileSearchable !== false && (
                <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                  <button
                    onClick={handlePrintProfile}
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      border: '1px solid #ccc',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                    }}
                    aria-label="Download candidate profile as PDF"
                  >
                    <Download
                      style={{
                        marginRight: '0.5rem',
                        height: '1rem',
                        width: '1rem',
                      }}
                    />{' '}
                    Download PDF
                  </button>
                </div>
              )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {totalExperienceDisplay && (
            <section>
              <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2">
                <Clock className="text-accent" /> Total Experience
              </h2>
              <p className="text-lg text-foreground/90">
                {totalExperienceDisplay}
              </p>
            </section>
          )}

          {candidate.parsedResumeText && isJobSeekerProfile && (
            <section>
              {(totalExperienceDisplay || hasProfessionalInfo) && (
                <Separator className="my-6" />
              )}
              <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2">
                <Sparkles className="text-accent" /> Professional Summary
              </h2>
              <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap p-4 border rounded-md bg-background shadow-inner">
                {candidate.parsedResumeText}
              </div>
            </section>
          )}

          {candidate.experiences &&
            candidate.experiences.length > 0 &&
            isJobSeekerProfile && (
              <section>
                {(totalExperienceDisplay ||
                  (candidate.parsedResumeText && isJobSeekerProfile)) && (
                  <Separator className="my-6" />
                )}
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
                        {exp.jobRole || 'N/A'}
                      </h3>
                      <p className="text-md font-medium text-primary">
                        {exp.companyName || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">
                        {exp.startDate &&
                        isValid(parse(exp.startDate, 'yyyy-MM-dd', new Date()))
                          ? format(
                              parse(exp.startDate, 'yyyy-MM-dd', new Date()),
                              'PPP'
                            )
                          : 'N/A'}{' '}
                        -{' '}
                        {exp.currentlyWorking
                          ? 'Present'
                          : exp.endDate &&
                              isValid(
                                parse(exp.endDate, 'yyyy-MM-dd', new Date())
                              )
                            ? format(
                                parse(exp.endDate, 'yyyy-MM-dd', new Date()),
                                'PPP'
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

          {candidate.educations &&
            candidate.educations.length > 0 &&
            isJobSeekerProfile && (
              <section>
                {(totalExperienceDisplay ||
                  (candidate.parsedResumeText && isJobSeekerProfile) ||
                  (candidate.experiences &&
                    candidate.experiences.length > 0 &&
                    isJobSeekerProfile)) && <Separator className="my-6" />}
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
                        {edu.degreeName || 'N/A'}
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
                        {edu.instituteName || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">
                        {edu.level || 'N/A'}{' '}
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
          {!hasProfessionalInfo &&
            !totalExperienceDisplay &&
            isJobSeekerProfile && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Profile Information Limited</AlertTitle>
                <AlertDescription>
                  This candidate has not yet provided detailed summary,
                  experience, or education.
                </AlertDescription>
              </Alert>
            )}
          {!isJobSeekerProfile &&
            currentUser &&
            ADMIN_LIKE_ROLES_CANDIDATE_PAGE.includes(
              currentUser.role as UserRole
            ) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Platform User Profile</AlertTitle>
                <AlertDescription>
                  Viewing basic profile information for a platform{' '}
                  {candidate.role
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                  . Job seeker specific sections (experience, education, skills
                  etc.) are not applicable.
                </AlertDescription>
              </Alert>
            )}

          {(candidate.skills &&
            candidate.skills.length > 0 &&
            isJobSeekerProfile) ||
          (currentUser &&
            ADMIN_LIKE_ROLES_CANDIDATE_PAGE.includes(
              currentUser.role as UserRole
            ) &&
            candidate.skills &&
            candidate.skills.length > 0) ? (
            <section>
              <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2">
                <Award className="text-primary" /> Skills
              </h2>
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
            </section>
          ) : isJobSeekerProfile ? (
            <section>
              <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2">
                <Award className="text-primary" /> Skills
              </h2>
              <p className="text-sm text-muted-foreground">No skills listed.</p>
            </section>
          ) : null}

          {(candidate.languages &&
            candidate.languages.length > 0 &&
            isJobSeekerProfile) ||
          (currentUser &&
            ADMIN_LIKE_ROLES_CANDIDATE_PAGE.includes(
              currentUser.role as UserRole
            ) &&
            candidate.languages &&
            candidate.languages.length > 0) ? (
            <section>
              <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2">
                <LanguagesIcon className="text-primary" /> Languages
              </h2>
              <ul className="space-y-1">
                {candidate.languages.map((lang: LanguageEntry) => (
                  <li
                    key={lang.id || lang.languageName}
                    className="text-sm text-foreground/90"
                  >
                    <span className="font-medium">
                      {lang.languageName || 'N/A'}
                    </span>
                    : {lang.proficiency || 'N/A'}
                    <span className="text-xs text-muted-foreground ml-2">
                      (Read: {lang.canRead ? 'Yes' : 'No'}, Write:{' '}
                      {lang.canWrite ? 'Yes' : 'No'}, Speak:{' '}
                      {lang.canSpeak ? 'Yes' : 'No'})
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : isJobSeekerProfile ? (
            <section>
              <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2">
                <LanguagesIcon className="text-primary" /> Languages
              </h2>
              <p className="text-sm text-muted-foreground">
                No languages listed.
              </p>
            </section>
          ) : null}

          {isJobSeekerProfile && (
            <>
              <Separator className="my-6" />
              <section>
                <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2">
                  <DollarSign className="text-primary" /> Compensation
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {candidate.currentCTCValue !== undefined && (
                    <p>
                      <strong className="text-foreground/80">
                        Current CTC:
                      </strong>{' '}
                      {candidate.currentCTCConfidential
                        ? 'Confidential'
                        : `${formatCurrencyINR(candidate.currentCTCValue)}/year`}
                    </p>
                  )}
                  {candidate.expectedCTCValue !== undefined && (
                    <p>
                      <strong className="text-foreground/80">
                        Expected CTC:
                      </strong>{' '}
                      {formatCurrencyINR(candidate.expectedCTCValue)}/year{' '}
                      {candidate.expectedCTCNegotiable && '(Negotiable)'}
                    </p>
                  )}
                  {candidate.currentCTCValue === undefined &&
                    candidate.expectedCTCValue === undefined && (
                      <p className="text-sm text-muted-foreground">
                        Compensation details not provided.
                      </p>
                    )}
                </div>
              </section>

              <Separator className="my-6" />
              <section>
                <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2">
                  <Briefcase className="text-primary" /> Job Preferences
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
                  {candidate.noticePeriod && (
                    <p>
                      <strong className="text-foreground/80">
                        Notice Period:
                      </strong>{' '}
                      {candidate.noticePeriod}
                    </p>
                  )}
                </div>
                {(!candidate.preferredLocations ||
                  candidate.preferredLocations.length === 0) &&
                  !candidate.jobSearchStatus &&
                  !candidate.noticePeriod && (
                    <p className="text-sm text-muted-foreground">
                      Job preferences not specified.
                    </p>
                  )}
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
                        <FileText className="mr-2 h-4 w-4" /> Download Stored
                        Resume ({candidate.resumeFileName})
                      </a>
                    </Button>
                  )}
                  {!candidate.linkedinUrl &&
                    !candidate.portfolioUrl &&
                    !candidate.resumeUrl && (
                      <p className="text-sm text-muted-foreground">
                        No external links or stored resume provided.
                      </p>
                    )}
                </div>
              </section>
            </>
          )}
        </CardContent>
        <CardFooter className="p-6 border-t bg-muted/20 rounded-b-lg">
          <p className="text-xs text-muted-foreground">
            Member since:{' '}
            {candidate.createdAt
              ? typeof candidate.createdAt === 'string'
                ? new Date(candidate.createdAt).toLocaleDateString()
                : new Date(
                    (candidate.createdAt as Timestamp)?.seconds * 1000
                  ).toLocaleDateString()
              : 'N/A'}
            {candidate.updatedAt &&
              ` | Last Updated: ${
                typeof candidate.updatedAt === 'string'
                  ? new Date(candidate.updatedAt).toLocaleDateString()
                  : new Date(
                      (candidate.updatedAt as Timestamp)?.seconds * 1000
                    ).toLocaleDateString()
              }`}
            {candidate.status && ` | Status: ${candidate.status.toUpperCase()}`}
          </p>
        </CardFooter>
      </Card>
      {isJobSeekerProfile && (
        <div style={{ display: 'none' }}>
          <PrintableProfile ref={printableProfileRef} user={candidate} />
        </div>
      )}
    </div>
  );
}
