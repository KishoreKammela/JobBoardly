// src/app/jobs/page.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobCard } from '@/components/JobCard';
import { FilterSidebar } from '@/components/filter-sidebar';
import type { Job, Filters } from '@/types';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  List,
  AlertCircle,
  Search as SearchIcon,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { JOBS_PER_PAGE } from './_lib/constants';
import { filterJobs } from './_lib/utils';
import { JobSkeletonCard } from './_components/JobSkeletonCard';
import { fetchJobs } from './_lib/actions';

export default function JobsPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [globalSearchTerm, setGlobalSearchTerm] = useState(
    searchParams.get('q') || ''
  );
  const debouncedGlobalSearchTerm = useDebounce(globalSearchTerm, 500);

  const [sidebarFilters, setSidebarFilters] = useState<
    Omit<Filters, 'searchTerm'>
  >({
    location: searchParams.get('loc') || '',
    roleType: searchParams.get('type') || 'all',
    isRemote: searchParams.get('remote') === 'true',
    recentActivity:
      (searchParams.get('activity') as Filters['recentActivity']) || 'any',
    industry: searchParams.get('industry') || '',
    experienceLevel:
      (searchParams.get('expLevel') as Filters['experienceLevel']) || 'all',
    salaryMin: searchParams.has('minSal')
      ? Number(searchParams.get('minSal'))
      : undefined,
    salaryMax: searchParams.has('maxSal')
      ? Number(searchParams.get('maxSal'))
      : undefined,
    minExperienceYears: searchParams.has('minExp')
      ? Number(searchParams.get('minExp'))
      : undefined,
  });
  const debouncedSidebarFilters = useDebounce(sidebarFilters, 500);

  useEffect(() => {
    document.title = 'Find Jobs - Search & Apply | JobBoardly';
  }, []);

  useEffect(() => {
    const userPreference = user?.jobBoardDisplay;
    if (userPreference) {
      setViewMode(userPreference);
    } else {
      if (isMobile !== undefined) {
        setViewMode(isMobile ? 'list' : 'grid');
      }
    }
  }, [user?.jobBoardDisplay, isMobile]);

  useEffect(() => {
    fetchJobs(setAllJobs, setFilteredJobs, setError, setIsLoading);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    setIsFiltering(true);
    const activeFilters = {
      searchTerm: debouncedGlobalSearchTerm,
      ...debouncedSidebarFilters,
    };
    const newFilteredJobs = filterJobs(allJobs, activeFilters);
    setFilteredJobs(newFilteredJobs);
    setCurrentPage(1);
    setIsFiltering(false);
  }, [debouncedGlobalSearchTerm, debouncedSidebarFilters, allJobs, isLoading]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    return filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <FilterSidebar
          filters={sidebarFilters}
          onFilterChange={setSidebarFilters}
          currentGlobalSearchTerm={globalSearchTerm}
        />
      </aside>
      <main className="w-full md:w-3/4 lg:w-4/5">
        <div className="mb-6 space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search job title, company, skills, industry, description..."
              className="w-full h-12 pl-10 text-base rounded-lg shadow-sm"
              value={globalSearchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGlobalSearchTerm(e.target.value)
              }
              aria-label="Search jobs"
            />
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-headline">
              {isLoading && allJobs.length === 0
                ? 'Loading Jobs...'
                : isFiltering
                  ? 'Filtering Jobs...'
                  : `Found ${filteredJobs.length} Jobs`}
            </h1>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(isLoading && allJobs.length === 0) || isFiltering ? (
          <div
            className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
          >
            {Array.from({
              length: viewMode === 'grid' ? JOBS_PER_PAGE : 4,
            }).map((_, index) => (
              <JobSkeletonCard key={index} viewMode={viewMode} />
            ))}
          </div>
        ) : !error && paginatedJobs.length > 0 ? (
          <>
            <div
              className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
            >
              {paginatedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  variant="outline"
                  aria-label="Previous page of jobs"
                >
                  Previous
                </Button>
                <span
                  className="text-sm text-muted-foreground"
                  aria-live="polite"
                >
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  variant="outline"
                  aria-label="Next page of jobs"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          !error && (
            <div className="text-center py-12">
              <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                No jobs found matching your criteria.
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
