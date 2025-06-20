'use client';
import React from 'react';
import type { UserProfile } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Sparkles, Award, Clock } from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';

interface JobSeekerProfessionalSummarySectionProps {
  userFormData: Partial<UserProfile>;
  onUserChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSkillsChange: (skills: string[]) => void;
  isDisabled: boolean;
}

export function JobSeekerProfessionalSummarySection({
  userFormData,
  onUserChange,
  onSkillsChange,
  isDisabled,
}: JobSeekerProfessionalSummarySectionProps) {
  const handleSkillsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onSkillsChange(
      val
        .split(',')
        .map((skill) => skill.trim())
        .filter((skill) => skill)
    );
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <Sparkles /> Professional Details
        </CardTitle>
        <CardDescription>
          Highlight your professional summary, skills, total experience, and
          compensation expectations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="headline">
              Headline (Your Professional Tagline)
            </Label>
            <Input
              id="headline"
              name="headline"
              placeholder="e.g., Senior Software Engineer | AI Enthusiast"
              value={userFormData.headline || ''}
              onChange={onUserChange}
              disabled={isDisabled}
            />
          </div>
          <div>
            <Label htmlFor="parsedResumeText">
              Professional Summary (from Resume or Manually Entered)
            </Label>
            <Textarea
              id="parsedResumeText"
              name="parsedResumeText"
              value={userFormData.parsedResumeText || ''}
              onChange={onUserChange}
              rows={6}
              placeholder="A brief overview of your career, skills, and goals. Often extracted from your resume."
              disabled={isDisabled}
            />
          </div>
          <div>
            <Label htmlFor="skillsInput" className="flex items-center gap-1.5">
              <Award /> Key Skills (comma-separated)
            </Label>
            <Input
              id="skillsInput"
              name="skillsInput"
              value={(userFormData.skills || []).join(', ')}
              onChange={handleSkillsInputChange}
              placeholder="e.g., React, Node.js, Project Management, Agile"
              disabled={isDisabled}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <Label
                htmlFor="totalYearsExperience"
                className="flex items-center gap-1.5"
              >
                <Clock /> Total Years of Experience
              </Label>
              <Input
                id="totalYearsExperience"
                name="totalYearsExperience"
                type="number"
                placeholder="e.g., 5"
                value={
                  userFormData.totalYearsExperience === undefined
                    ? ''
                    : userFormData.totalYearsExperience
                }
                onChange={onUserChange}
                min="0"
                disabled={isDisabled}
              />
            </div>
            <div>
              <Label htmlFor="totalMonthsExperience">Total Months (0-11)</Label>
              <Input
                id="totalMonthsExperience"
                name="totalMonthsExperience"
                type="number"
                placeholder="e.g., 6"
                value={
                  userFormData.totalMonthsExperience === undefined
                    ? ''
                    : userFormData.totalMonthsExperience
                }
                onChange={onUserChange}
                min="0"
                max="11"
                disabled={isDisabled}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
