
"use client";
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, FileText, Loader2, Trash2, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { parseResumeFlow, type ParseResumeOutput } from '@/ai/flows/parse-resume-flow';

export function ResumeUploadForm() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Combined state for upload/parse

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        
        // Call the Genkit flow to parse the resume
        const parsedData: ParseResumeOutput = await parseResumeFlow({ resumeDataUri: dataUri });

        // Update user profile with parsed data
        const profileUpdates: Partial<typeof user> = {
          resumeUrl: URL.createObjectURL(file), // Temporary URL for display if needed, or store actual URL post-upload
          resumeFileName: file.name,
          parsedResumeText: parsedData.experience || `Parsed content for ${file.name}. Raw AI output might go here.`, // Fallback
        };

        if (parsedData.name && !user.name) profileUpdates.name = parsedData.name; // Only update if not already set or prefer AI
        if (parsedData.headline) profileUpdates.headline = parsedData.headline;
        if (parsedData.skills && parsedData.skills.length > 0) profileUpdates.skills = parsedData.skills;
        if (parsedData.experience) profileUpdates.experience = parsedData.experience; // Overwrite or append based on preference
        if (parsedData.portfolioUrl) profileUpdates.portfolioUrl = parsedData.portfolioUrl;
        if (parsedData.linkedinUrl) profileUpdates.linkedinUrl = parsedData.linkedinUrl;
        // Could also update email if desired, but user.email is usually fixed post-registration.

        updateUser(profileUpdates);

        toast({
          title: 'Resume Processed',
          description: `${file.name} has been uploaded and profile details updated based on its content.`,
        });
        setFile(null); // Reset file input
      };
      reader.onerror = (error) => {
        console.error("File reading error:", error);
        toast({ title: 'File Reading Error', description: 'Could not read the selected file.', variant: 'destructive' });
      };
    } catch (error) {
      console.error("Error processing resume:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during parsing."
      toast({
        title: 'Resume Processing Error',
        description: `Failed to parse resume and update profile. ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveResume = () => {
    if (!user) return;
    updateUser({
      resumeUrl: undefined,
      resumeFileName: undefined,
      parsedResumeText: undefined,
      // Optionally clear AI-derived fields too, or leave them for manual editing
      // skills: [], experience: '', headline: '' 
    });
    toast({
      title: 'Resume Removed',
      description: 'Your resume has been removed from your profile.',
    });
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Manage Resume</CardTitle>
        <CardDescription>
            Upload your resume (PDF, DOCX). Our AI will attempt to parse it and pre-fill your profile details to save you time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user?.resumeFileName ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{user.resumeFileName}</p>
                  <p className="text-xs text-muted-foreground">Uploaded. Review profile for auto-filled details.</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemoveResume} aria-label="Remove resume">
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </div>
            {user.parsedResumeText && ( // Displaying the main experience/summary from parsed text for brevity
              <div>
                <Label className="font-semibold">Parsed Resume Summary (Preview):</Label>
                <Textarea 
                  value={user.parsedResumeText} 
                  readOnly 
                  rows={5} 
                  className="mt-1 bg-muted/20 text-sm"
                  aria-label="Parsed resume content preview"
                />
              </div>
            )}
             <Button type="button" onClick={() => setFile(null)} disabled={isProcessing} variant="outline" className="w-full sm:w-auto">
                <UploadCloud className="mr-2 h-4 w-4" /> Upload New Resume
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="resumeFile" className="sr-only">Resume File</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="resumeFile"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-primary" />
                    <p className="mb-2 text-sm text-foreground/80">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (MAX. 5MB)</p>
                  </div>
                  <Input id="resumeFile" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                </label>
              </div>
            </div>
            {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
            <Button type="submit" disabled={!file || isProcessing} className="w-full sm:w-auto">
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Upload & Parse Resume
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
