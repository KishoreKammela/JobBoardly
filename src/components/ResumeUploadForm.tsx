
'use client';
import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, FileText, Loader2, Trash2, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  parseResumeFlow,
  type ParseResumeOutput,
} from '@/ai/flows/parse-resume-flow';
import type { UserProfile } from '@/types';

export function ResumeUploadForm() {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pastedResume, setPastedResume] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPastedResume('');
    }
  };

  const handlePastedResumeChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPastedResume(e.target.value);
    setFile(null);
  };

  const processResumeData = async (dataUri: string, sourceName: string) => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const parsedData: ParseResumeOutput = await parseResumeFlow({
        resumeDataUri: dataUri,
      });

      const profileUpdates: Partial<UserProfile> = {};

      if (
        parsedData.experience &&
        parsedData.experience.startsWith('Parsing Error:')
      ) {
        toast({
          title: 'Resume Parsing Issue',
          description: parsedData.experience,
          variant: 'destructive',
          duration: 9000,
        });
        if (file) {
          profileUpdates.resumeFileName = file.name;
        }
      } else {
        if (parsedData.name && !user.name)
          profileUpdates.name = parsedData.name;
        if (parsedData.headline) profileUpdates.headline = parsedData.headline;
        if (parsedData.skills && parsedData.skills.length > 0)
          profileUpdates.skills = parsedData.skills;

        let summaryText = '';
        if (parsedData.experience)
          summaryText += `Experience Summary:\n${parsedData.experience}\n\n`;
        if (parsedData.education)
          summaryText += `Education Summary:\n${parsedData.education}\n\n`;
        if (summaryText) profileUpdates.parsedResumeText = summaryText.trim();

        if (parsedData.portfolioUrl)
          profileUpdates.portfolioUrl = parsedData.portfolioUrl;
        if (parsedData.linkedinUrl)
          profileUpdates.linkedinUrl = parsedData.linkedinUrl;
        if (parsedData.mobileNumber && !user.mobileNumber)
          profileUpdates.mobileNumber = parsedData.mobileNumber;

        if (
          parsedData.totalYearsExperience !== undefined &&
          (user.totalYearsExperience === undefined ||
            user.totalYearsExperience === 0)
        ) {
          profileUpdates.totalYearsExperience = parsedData.totalYearsExperience;
          if (
            user.totalMonthsExperience === undefined ||
            user.totalMonthsExperience === 0
          ) {
            profileUpdates.totalMonthsExperience = 0;
          }
        }

        if (file) {
          profileUpdates.resumeFileName = file.name;
        } else if (pastedResume) {
          profileUpdates.resumeFileName = 'Pasted Resume Text';
          profileUpdates.resumeUrl = undefined;
        }

        toast({
          title: 'Resume Processed',
          description: `${sourceName} has been parsed. Review and complete your profile details.`,
        });
      }

      if (Object.keys(profileUpdates).length > 0) {
        await updateUserProfile(profileUpdates);
      }
      setFile(null);
      setPastedResume('');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during parsing.';
      console.error('Error processing resume:', error);
      toast({
        title: 'Resume Processing Error',
        description: `Failed to parse resume and update profile. ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () =>
        processResumeData(reader.result as string, file.name);
      reader.onerror = (errorReading: ProgressEvent<FileReader>) => {
        console.error('File reading error:', errorReading);
        toast({
          title: 'File Reading Error',
          description: 'Could not read the selected file.',
          variant: 'destructive',
        });
        setIsProcessing(false);
      };
    } else if (pastedResume.trim()) {
      const plainTextDataUri = `data:text/plain;base64,${btoa(unescape(encodeURIComponent(pastedResume.trim())))}`;
      processResumeData(plainTextDataUri, 'Pasted Resume');
    } else {
      toast({
        title: 'No Resume Provided',
        description: 'Please upload a file or paste your resume text.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveResume = async () => {
    if (!user) return;
    await updateUserProfile({
      resumeUrl: undefined,
      resumeFileName: undefined,
      parsedResumeText: undefined,
    });
    toast({
      title: 'Resume Removed',
      description:
        'Your resume file and parsed summary have been removed from your profile.',
    });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">
          Manage Your Resume
        </CardTitle>
        <CardDescription>
          Upload your resume (PDF, DOCX, TXT) or paste its content. Our AI will
          attempt to parse it and pre-fill parts of your profile. Plain text
          (.txt or pasted) yields the best results for AI parsing. Review
          auto-filled information carefully.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {user?.resumeFileName && !file && !pastedResume ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{user.resumeFileName}</p>
                  <p className="text-xs text-muted-foreground">
                    Current resume on profile.{' '}
                    {user.resumeUrl && (
                      <a
                        href={user.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        View
                      </a>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveResume}
                aria-label="Remove resume"
              >
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </div>
            <Button
              type="button"
              onClick={() => {
                setFile(null);
                setPastedResume('');
                // Optionally reset other fields in UserProfileForm if they were AI-filled
              }}
              disabled={isProcessing}
              variant="outline"
              className="w-full sm:w-auto"
              aria-label="Replace current resume"
            >
              <UploadCloud className="mr-2 h-4 w-4" /> Replace Current Resume
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="resumeFile"
                className="text-base font-medium block mb-2"
              >
                Upload Resume File
              </Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="resumeFile"
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer  hover:bg-muted/40 transition-colors ${file ? 'bg-primary/10 border-primary' : 'bg-muted/20'}`}
                  aria-label="Resume file upload area"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-primary" />
                    <p className="mb-2 text-sm text-foreground/80">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX, TXT (MAX. 5MB)
                    </p>
                  </div>
                  <Input
                    id="resumeFile"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </label>
              </div>
              {file && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected file: {file.name}
                </p>
              )}
            </div>

            <div className="text-center my-4 text-sm text-muted-foreground font-semibold">
              OR
            </div>

            <div>
              <Label
                htmlFor="pastedResume"
                className="text-base font-medium block mb-2"
              >
                Paste Resume Text
              </Label>
              <Textarea
                id="pastedResume"
                value={pastedResume}
                onChange={handlePastedResumeChange}
                placeholder="Paste your resume content here..."
                rows={10}
                className={pastedResume ? 'border-primary' : ''}
                aria-label="Paste resume text area"
              />
            </div>

            <Button
              type="submit"
              disabled={(!file && !pastedResume.trim()) || isProcessing}
              className="w-full sm:w-auto"
              aria-label={
                file ? 'Upload and Parse File' : 'Parse Pasted Text'
              }
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {file ? 'Upload & Parse File' : 'Parse Pasted Text'}
            </Button>
          </form>
        )}
        {user?.parsedResumeText && (
          <div className="mt-6">
            <Label className="font-semibold text-md">
              AI Parsed Summary (Review carefully):
            </Label>
            <Textarea
              value={user.parsedResumeText}
              readOnly
              rows={8}
              className="mt-1 bg-muted/20 text-sm whitespace-pre-wrap"
              aria-label="Parsed resume content preview"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This summary was extracted by AI. Use it as a reference to fill
              out the detailed sections of your profile (experience, education,
              etc.) for best results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
