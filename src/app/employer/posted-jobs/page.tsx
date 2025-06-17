
import { PostedJobsDisplay } from '@/components/employer/PostedJobsDisplay';
import { Separator } from '@/components/ui/separator';

export default function PostedJobsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">My Posted Jobs</h1>
        <p className="text-muted-foreground">Manage your current job openings and view applicants.</p>
      </div>
      <Separator />
      <PostedJobsDisplay />
    </div>
  );
}
