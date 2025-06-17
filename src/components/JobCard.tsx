
"use client";
import type { Job } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, DollarSign, Bookmark, ExternalLink, Building, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface JobCardProps {
  job: Job;
  showApplyButton?: boolean; // To hide apply button in "Applied Jobs" list
}

export function JobCard({ job, showApplyButton = true }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const { user, applyForJob, hasAppliedForJob } = useAuth();
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (user && user.role === 'jobSeeker') {
      setApplied(hasAppliedForJob(job.id));
    }
  }, [user, job.id, hasAppliedForJob]);

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Job Unsaved" : "Job Saved!",
      description: `${job.title} at ${job.company} has been ${isSaved ? "removed from" : "added to"} your saved jobs.`,
    });
  };

  const handleApply = () => {
    if (user && user.role === 'jobSeeker') {
      applyForJob(job.id);
      setApplied(true); // Optimistically update UI
      toast({
        title: "Applied!",
        description: `You've applied for ${job.title} at ${job.company}.`,
      });
    } else if (!user) {
        toast({
            title: "Login Required",
            description: "Please log in as a job seeker to apply.",
            variant: "destructive"
        });
    } else if (user.role === 'employer') {
        toast({
            title: "Action Not Allowed",
            description: "Employers cannot apply for jobs.",
            variant: "destructive"
        });
    }
  };
  
  const companyLogo = job.companyLogoUrl || `https://placehold.co/64x64.png?text=${job.company.substring(0,2).toUpperCase()}`;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Image 
            src={companyLogo} 
            alt={`${job.company} logo`} 
            width={48} 
            height={48} 
            className="rounded-md border" 
            data-ai-hint="company logo"
          />
          <div>
            <CardTitle className="text-lg font-headline leading-tight hover:text-primary transition-colors">
              <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer">{job.title}</a>
            </CardTitle>
            <CardDescription className="text-sm flex items-center gap-1.5 mt-1">
              <Building className="h-3.5 w-3.5" /> {job.company}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4 flex-grow">
        <div className="text-sm text-muted-foreground space-y-1.5">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary/80" /> {job.location} {job.isRemote && <Badge variant="outline">Remote</Badge>}
          </p>
          <p className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-primary/80" /> {job.type}
          </p>
          {job.salaryMin && job.salaryMax && (
            <p className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-primary/80" /> ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
            </p>
          )}
        </div>
        <p className="text-sm text-foreground/90 line-clamp-3">{job.description}</p>
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {job.skills.slice(0, 4).map(skill => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
            {job.skills.length > 4 && <Badge variant="secondary">+{job.skills.length - 4} more</Badge>}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <p className="text-xs text-muted-foreground">Posted: {new Date(job.postedDate).toLocaleDateString()}</p>
        {showApplyButton && (
            <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveToggle} aria-pressed={isSaved} aria-label={isSaved ? "Unsave job" : "Save job"}>
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : ''}`} />
            </Button>
            {applied ? (
                <Button size="sm" disabled variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="mr-1.5 h-4 w-4" /> Applied
                </Button>
            ) : (
                <Button size="sm" onClick={handleApply} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!user || user.role !== 'jobSeeker'}>
                    Apply Now <ExternalLink className="ml-1.5 h-4 w-4" />
                </Button>
            )}
            </div>
        )}
      </CardFooter>
    </Card>
  );
}
