
"use client"; // Made client component to use hooks like useParams easily
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
  MessageSquare
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function CandidateDetailPage() {
  const params = useParams();
  const candidateId = params.candidateId as string;
  const [candidate, setCandidate] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: employerUser } = useAuth(); // Logged in employer

  useEffect(() => {
    if (candidateId) {
      const fetchCandidate = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const candidateDocRef = doc(db, 'users', candidateId);
          const candidateDocSnap = await getDoc(candidateDocRef);
          if (candidateDocSnap.exists()) {
            const data = candidateDocSnap.data();
            if (data.role === 'jobSeeker') {
              setCandidate({ uid: candidateDocSnap.id, ...data } as UserProfile);
            } else {
              setError('This profile does not belong to a job seeker.');
            }
          } else {
            setError('Candidate not found.');
          }
        } catch (e) {
          console.error('Error fetching candidate details:', e);
          setError('Failed to load candidate details. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCandidate();
    }
  }, [candidateId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading candidate profile...</p>
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
        <p className="text-xl text-muted-foreground">Candidate profile not found.</p>
      </div>
    );
  }

  const getAvatarFallback = () => candidate.name?.[0]?.toUpperCase() || 'C';

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="shadow-xl">
        <CardHeader className="bg-muted/30 p-6 rounded-t-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-28 w-28 border-4 border-primary/30">
              <AvatarImage src={candidate.avatarUrl || `https://placehold.co/128x128.png`} alt={candidate.name} data-ai-hint="candidate photo"/>
              <AvatarFallback className="text-4xl">{getAvatarFallback()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold font-headline text-primary mb-1">{candidate.name}</h1>
              <p className="text-lg text-foreground mb-2">{candidate.headline}</p>
              {candidate.email && (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground mb-1">
                  <Mail className="h-4 w-4" /> <a href={`mailto:${candidate.email}`} className="hover:underline">{candidate.email}</a>
                </div>
              )}
              {candidate.preferredLocations && candidate.preferredLocations.length > 0 && (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {candidate.preferredLocations.join(', ')}
                </div>
              )}
            </div>
            {employerUser && employerUser.role === 'employer' && (
                 <Button className="w-full sm:w-auto mt-4 sm:mt-0">
                    <MessageSquare className="mr-2 h-5 w-5" /> Contact Candidate
                </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {candidate.experience && (
              <section>
                <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2"><Briefcase className="text-primary" /> Experience</h2>
                <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap p-4 border rounded-md bg-background">
                  {candidate.experience}
                </div>
              </section>
            )}
            {candidate.education && (
              <section>
                 <Separator className="my-6 md:hidden"/>
                <h2 className="text-xl font-semibold mb-3 font-headline flex items-center gap-2"><GraduationCap className="text-primary" /> Education</h2>
                <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap p-4 border rounded-md bg-background">
                  {candidate.education}
                </div>
              </section>
            )}
          </div>
          <aside className="space-y-6 md:border-l md:pl-6">
            {candidate.skills && candidate.skills.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3 font-headline">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map(skill => (
                    <Badge key={skill} variant="default" className="text-sm px-3 py-1">{skill}</Badge>
                  ))}
                </div>
              </section>
            )}
            <Separator />
            <section className="space-y-3 text-sm">
                <h3 className="text-lg font-semibold font-headline mb-2">Details</h3>
                {candidate.jobSearchStatus && (
                    <p className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-primary"/> Status: <span className="font-medium">{candidate.jobSearchStatus.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span></p>
                )}
                {candidate.availability && (
                    <p className="flex items-center gap-2"><CalendarCheck2 className="h-4 w-4 text-primary"/> Availability: <span className="font-medium">{candidate.availability}</span></p>
                )}
                {candidate.desiredSalary && (
                    <p className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary"/> Desired Salary: <span className="font-medium">${candidate.desiredSalary.toLocaleString()}/year</span></p>
                )}
            </section>
            <Separator />
            <section className="space-y-3">
                <h3 className="text-lg font-semibold font-headline mb-2">Links & Resume</h3>
                {candidate.linkedinUrl && (
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-2 h-4 w-4" /> LinkedIn Profile
                    </a>
                  </Button>
                )}
                {candidate.portfolioUrl && (
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-4 w-4" /> Portfolio/Website
                    </a>
                  </Button>
                )}
                {candidate.resumeUrl && candidate.resumeFileName && (
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" download={candidate.resumeFileName}>
                      <FileText className="mr-2 h-4 w-4" /> Download Resume ({candidate.resumeFileName})
                    </a>
                  </Button>
                )}
                {!candidate.linkedinUrl && !candidate.portfolioUrl && !candidate.resumeUrl && (
                    <p className="text-sm text-muted-foreground">No external links or resume provided.</p>
                )}
            </section>
          </aside>
        </CardContent>
         <CardFooter className="p-6 border-t bg-muted/20 rounded-b-lg">
           <p className="text-xs text-muted-foreground">Candidate ID: {candidate.uid}. Member since: {candidate.createdAt ? new Date((candidate.createdAt as Timestamp).seconds * 1000).toLocaleDateString() : 'N/A'}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
