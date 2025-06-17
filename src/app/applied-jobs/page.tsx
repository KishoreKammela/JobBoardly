
import { AppliedJobsDisplay } from '@/components/AppliedJobsDisplay';
import { Separator } from '@/components/ui/separator';

export default function AppliedJobsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">My Applied Jobs</h1>
        <p className="text-muted-foreground">Here's a list of jobs you have applied to.</p>
      </div>
      <Separator />
      <AppliedJobsDisplay />
    </div>
  );
}
