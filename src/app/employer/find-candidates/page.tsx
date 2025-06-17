
"use client"; // Add this directive
import { CandidateSearchResults } from '@/components/employer/CandidateSearchResults';
import { CandidateFilterSidebar } from '@/components/employer/CandidateFilterSidebar';
import { Separator } from '@/components/ui/separator';

export default function FindCandidatesPage() {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-1/4 lg:w-1/5">
        {/* Placeholder for now, will be implemented with CandidateFilterSidebar */}
        <CandidateFilterSidebar onFilterChange={() => { /* Implement filter logic */ }} />
      </aside>
      <main className="w-full md:w-3/4 lg:w-4/5 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1 font-headline">Find Candidates</h1>
          <p className="text-muted-foreground">Browse through profiles of talented job seekers.</p>
        </div>
        <Separator />
        <CandidateSearchResults />
      </main>
    </div>
  );
}
