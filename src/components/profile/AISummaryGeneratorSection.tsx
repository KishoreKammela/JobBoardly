'use client';
import React, { useState } from 'react';
import type { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
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
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  generateProfileSummary,
  type GenerateProfileSummaryOutput,
} from '@/ai/flows/generate-profile-summary-flow';

interface AISummaryGeneratorSectionProps {
  userFormData: Partial<UserProfile>;
  onSummaryGenerated: (summary: string) => void;
  isDisabled: boolean;
}

export function AISummaryGeneratorSection({
  userFormData,
  onSummaryGenerated,
  isDisabled,
}: AISummaryGeneratorSectionProps) {
  const { toast } = useToast();
  const [aiTargetRoleCompany, setAiTargetRoleCompany] = useState('');
  const [aiGeneratedSummary, setAiGeneratedSummary] = useState<string | null>(
    null
  );
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleGenerateAISummary = async () => {
    setIsGeneratingSummary(true);
    setAiGeneratedSummary(null);
    try {
      const profileContext = `
        Name: ${userFormData.name || 'N/A'}
        Headline: ${userFormData.headline || 'N/A'}
        Skills: ${(userFormData.skills || []).join(', ') || 'N/A'}
        Experiences: ${
          (userFormData.experiences || [])
            .map(
              (exp) =>
                `${exp.jobRole} at ${exp.companyName} (${exp.startDate} - ${exp.currentlyWorking ? 'Present' : exp.endDate}): ${exp.description}`
            )
            .join('; ') || 'N/A'
        }
        Education: ${
          (userFormData.educations || [])
            .map(
              (edu) =>
                `${edu.degreeName} in ${edu.specialization} from ${edu.instituteName}`
            )
            .join('; ') || 'N/A'
        }
        Total Experience: ${userFormData.totalYearsExperience || 0} years, ${userFormData.totalMonthsExperience || 0} months
      `;

      const result: GenerateProfileSummaryOutput = await generateProfileSummary(
        {
          jobSeekerProfileData: profileContext,
          targetRoleOrCompany: aiTargetRoleCompany,
        }
      );
      const summary =
        result.generatedSummary ||
        'AI could not generate a summary. Please try again or ensure your profile has enough details.';
      setAiGeneratedSummary(summary);
      if (result.generatedSummary) {
        toast({
          title: 'AI Summary Generated!',
          description: 'Review the summary below and choose to use it.',
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Please try again.';
      toast({
        title: 'AI Summary Error',
        description: `Failed to generate summary. ${errorMessage}`,
        variant: 'destructive',
      });
      setAiGeneratedSummary(
        'Error generating summary. Please try again later.'
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleUseAISummary = () => {
    if (
      aiGeneratedSummary &&
      !aiGeneratedSummary.startsWith('Error') &&
      !aiGeneratedSummary.startsWith('Could not')
    ) {
      onSummaryGenerated(aiGeneratedSummary);
      toast({
        title: 'Summary Applied',
        description:
          'AI-generated summary has been copied to your Professional Summary field. Remember to save all profile changes.',
      });
    } else {
      toast({
        title: 'No Summary to Apply',
        description:
          'Generate a summary first or the generated summary had an issue.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <Lightbulb className="text-yellow-400" /> AI Summary Generator
        </CardTitle>
        <CardDescription>
          Let AI help you craft a professional summary tailored to a specific
          role or company. The generated summary will appear below, and you can
          choose to use it in your &quot;Professional Summary&quot; field.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="aiTargetRoleCompany">
            Target Role or Company (Optional)
          </Label>
          <Input
            id="aiTargetRoleCompany"
            value={aiTargetRoleCompany}
            onChange={(e) => setAiTargetRoleCompany(e.target.value)}
            placeholder="e.g., Product Manager at Google, Fintech roles"
            disabled={isGeneratingSummary || isDisabled}
          />
        </div>
        <Button
          type="button"
          onClick={handleGenerateAISummary}
          disabled={isGeneratingSummary || isDisabled}
          className="w-full sm:w-auto"
        >
          {isGeneratingSummary ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Summary with AI
        </Button>
        {aiGeneratedSummary && (
          <div className="space-y-2">
            <Label htmlFor="aiGeneratedSummaryText">
              AI Generated Summary:
            </Label>
            <Textarea
              id="aiGeneratedSummaryText"
              value={aiGeneratedSummary}
              readOnly
              rows={5}
              className="bg-muted/30 whitespace-pre-wrap"
            />
            <Button
              type="button"
              onClick={handleUseAISummary}
              variant="outline"
              size="sm"
              disabled={
                isGeneratingSummary ||
                isDisabled ||
                aiGeneratedSummary.startsWith('Error') ||
                aiGeneratedSummary.startsWith('Could not')
              }
            >
              Use This Summary
            </Button>
            <p className="text-xs text-muted-foreground">
              Clicking &quot;Use This Summary&quot; will copy it to your
              Professional Summary field above. Remember to save all profile
              changes using the main save button at the bottom.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
