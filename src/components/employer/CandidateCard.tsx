'use client';
import type { UserProfile } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Briefcase,
  Mail,
  Link as LinkIcon,
  CalendarDays,
  DollarSign,
  Phone,
} from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { formatCurrencyINR } from '@/lib/utils';

interface CandidateCardProps {
  candidate: UserProfile;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const getAvatarFallback = () => {
    return candidate.name?.[0]?.toUpperCase() || 'C';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage
              src={candidate.avatarUrl || `https://placehold.co/100x100.png`}
              alt={candidate.name || 'Candidate'}
              data-ai-hint="candidate avatar"
            />
            <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl font-headline leading-tight hover:text-primary transition-colors">
              <Link href={`/employer/candidates/${candidate.uid}`}>
                {candidate.name}
              </Link>
            </CardTitle>
            <CardDescription className="text-sm flex items-center gap-1.5 mt-1">
              <Briefcase className="h-3.5 w-3.5" />{' '}
              {candidate.headline || 'Job Seeker'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4 flex-grow">
        {candidate.preferredLocations &&
          candidate.preferredLocations.length > 0 && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary/80" />{' '}
              {candidate.preferredLocations.join(', ')}
            </p>
          )}
        {candidate.noticePeriod && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-primary/80" /> Notice Period:{' '}
            {candidate.noticePeriod}
          </p>
        )}
        {candidate.mobileNumber && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-primary/80" />{' '}
            {candidate.mobileNumber}
          </p>
        )}
        {candidate.expectedCTCValue !== undefined && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 text-primary/80" /> Expected CTC:{' '}
            {formatCurrencyINR(candidate.expectedCTCValue)}
            {candidate.expectedCTCNegotiable ? ' (Negotiable)' : ''}
          </p>
        )}
        {candidate.parsedResumeText && (
          <div className="mt-2">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
              Summary
            </h4>
            <p className="text-sm text-foreground/90 line-clamp-3">
              {candidate.parsedResumeText}
            </p>
          </div>
        )}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">
              Top Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 5 && (
                <Badge variant="secondary">
                  +{candidate.skills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t">
        <div className="flex flex-wrap gap-2">
          {candidate.portfolioUrl && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={
                  candidate.portfolioUrl.startsWith('http')
                    ? candidate.portfolioUrl
                    : `https://${candidate.portfolioUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkIcon className="mr-1.5 h-4 w-4" /> Portfolio
              </a>
            </Button>
          )}
          {candidate.linkedinUrl && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={
                  candidate.linkedinUrl.startsWith('http')
                    ? candidate.linkedinUrl
                    : `https://${candidate.linkedinUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="mr-1.5 h-4 w-4 fill-current"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>LinkedIn</title>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
                LinkedIn
              </a>
            </Button>
          )}
        </div>
        <Button size="sm" asChild className="w-full sm:w-auto flex-shrink-0">
          <Link href={`mailto:${candidate.email || ''}`}>
            <Mail className="mr-1.5 h-4 w-4" /> Contact
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
