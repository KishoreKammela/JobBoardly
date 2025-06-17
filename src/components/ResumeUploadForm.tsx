"use client";
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, FileText, Loader2, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export function ResumeUploadForm() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsUploading(true);

    // Simulate file upload and parsing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock parsing result
    const parsedText = `Successfully parsed ${file.name}.\nContent: This is a mock parsed resume for ${user.name}. It includes skills like ${user.skills?.join(', ') || 'various technologies'} and experience in relevant fields.`;
    
    updateUser({ 
      resumeUrl: URL.createObjectURL(file), // Temporary URL for display
      resumeFileName: file.name,
      parsedResumeText: parsedText 
    });

    setIsUploading(false);
    setFile(null); // Reset file input
    toast({
      title: 'Resume Uploaded',
      description: `${file.name} has been uploaded and parsed.`,
    });
  };

  const handleRemoveResume = () => {
    if (!user) return;
    updateUser({
      resumeUrl: undefined,
      resumeFileName: undefined,
      parsedResumeText: undefined,
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
        <CardDescription>Upload your resume to easily apply for jobs. We'll try to parse it for you.</CardDescription>
      </CardHeader>
      <CardContent>
        {user?.resumeFileName ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{user.resumeFileName}</p>
                  <p className="text-xs text-muted-foreground">Uploaded successfully</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemoveResume} aria-label="Remove resume">
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </div>
            {user.parsedResumeText && (
              <div>
                <Label className="font-semibold">Parsed Resume Content (Preview):</Label>
                <Textarea 
                  value={user.parsedResumeText} 
                  readOnly 
                  rows={5} 
                  className="mt-1 bg-muted/20 text-sm"
                  aria-label="Parsed resume content preview"
                />
              </div>
            )}
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
            <Button type="submit" disabled={!file || isUploading} className="w-full sm:w-auto">
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-4 w-4" />
              )}
              Upload Resume
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
