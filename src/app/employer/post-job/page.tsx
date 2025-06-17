
import { PostJobForm } from '@/components/employer/PostJobForm';
import { Separator } from '@/components/ui/separator';

export default function PostJobPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">Post a New Job</h1>
        <p className="text-muted-foreground">Fill in the details for your job opening or upload a job description document.</p>
      </div>
      <Separator />
      <PostJobForm />
    </div>
  );
}
