
"use client";
import { useState } from 'react';
import { CandidateSearchResults } from '@/components/employer/CandidateSearchResults';
import { CandidateFilterSidebar, type CandidateFilters } from '@/components/employer/CandidateFilterSidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

export default function FindCandidatesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentFilters, setCurrentFilters] = useState<CandidateFilters>({
    searchTerm: '',
    location: '',
    availability: 'all',
  });
  const [activeFilters, setActiveFilters] = useState<CandidateFilters>(currentFilters);


  const handleFilterChange = (filters: CandidateFilters) => {
    // This function might be used if filtering is done client-side or to trigger a new search
    console.log("Filters changed in parent page:", filters);
    setActiveFilters(filters);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <CandidateFilterSidebar onFilterChange={handleFilterChange} initialFilters={currentFilters}/>
      </aside>
      <main className="w-full md:w-3/4 lg:w-4/5 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1 font-headline">Find Candidates</h1>
            <p className="text-muted-foreground">Browse through profiles of talented job seekers.</p>
          </div>
          <div className="flex gap-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
              <LayoutGrid className="h-5 w-5"/>
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
              <List className="h-5 w-5"/>
            </Button>
          </div>
        </div>
        <Separator />
        <CandidateSearchResults viewMode={viewMode} filters={activeFilters} />
      </main>
    </div>
  );
}
