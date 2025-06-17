
import { JobApplicantsDisplay } from '@/components/employer/JobApplicantsDisplay';
import { Separator } from '@/components/ui/separator';

interface JobApplicantsPageProps {
  params: {
    jobId: string;
  };
}

export default function JobApplicantsPage({ params }: JobApplicantsPageProps) {
  const { jobId } = params;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">Job Applicants</h1>
        {/* We might fetch and display job title here */}
      </div>
      <Separator />
      <JobApplicantsDisplay jobId={jobId} />
    </div>
  );
}
