'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobCard } from '@/components/JobCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import type { Job, Filters } from '@/types';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, AlertCircle, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query as firestoreQuery,
  Timestamp,
  orderBy,
  where,
} from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDebounce } from '@/hooks/use-debounce';

const JOBS_PER_PAGE = 9;

export default function JobsPage() {
  const searchParams = useSearchParams();

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true); // True initially for fetching all jobs
  const [isFiltering, setIsFiltering] = useState(false); // For subsequent filter operations
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [currentFilters, setCurrentFilters] = useState<Filters>({
    searchTerm: searchParams.get('q') || '',
    location: searchParams.get('loc') || '',
    roleType: searchParams.get('type') || 'all',
    isRemote: searchParams.get('remote') === 'true',
    recentActivity:
      (searchParams.get('activity') as Filters['recentActivity']) || 'any',
  });
  const debouncedFilters = useDebounce(currentFilters, 500);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true); // Initial full load
      setIsFiltering(false);
      setError(null);
      try {
        const jobsCollectionRef = collection(db, 'jobs');
        const q = firestoreQuery(
          jobsCollectionRef,
          where('status', '==', 'approved'),
          orderBy('postedDate', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map((doc) => {
        const jobsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            postedDate:
              data.postedDate instanceof Timestamp
                ? data.postedDate.toDate().toISOString().split('T')[0]
                : data.postedDate,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt,
          } as Job;
        });
        setAllJobs(jobsData);
        setFilteredJobs(jobsData); // Initially show all
      } catch (e) {
        console.error('Error fetching jobs:', e);
        setError('Failed to load jobs. Please try again later.');
        console.error('Error fetching jobs:', e);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (isLoading) return; // Don't filter if initial load isn't done

    setIsFiltering(true);

    const newFilteredJobs = allJobs.filter((job) => {
      const searchTermMatch =
        debouncedFilters.searchTerm.toLowerCase() === '' ||
        job.title
          .toLowerCase()
          .includes(debouncedFilters.searchTerm.toLowerCase()) ||
        job.company
          .toLowerCase()
          .includes(debouncedFilters.searchTerm.toLowerCase()) ||
        (job.skills &&
          job.skills.some((skill) =>
            skill
              .toLowerCase()
              .includes(debouncedFilters.searchTerm.toLowerCase())
          ));

      const locationMatch =
        debouncedFilters.location.toLowerCase() === '' ||
        job.location
          .toLowerCase()
          .includes(debouncedFilters.location.toLowerCase());

      const roleTypeMatch =
        debouncedFilters.roleType === 'all' ||
        job.type.toLowerCase() === debouncedFilters.roleType.toLowerCase();

      const remoteMatch = !debouncedFilters.isRemote || job.isRemote;

      let recentActivityMatch = true;
      if (
        debouncedFilters.recentActivity &&
        debouncedFilters.recentActivity !== 'any'
      ) {
        // Use updatedAt if available, otherwise createdAt, then postedDate as fallback
        const dateToCompareStr =
          job.updatedAt || job.createdAt || job.postedDate;
        const jobDate = new Date(dateToCompareStr as string);
        const now = new Date();
        const cutoffDate = new Date();
        if (debouncedFilters.recentActivity === '24h')
          cutoffDate.setDate(now.getDate() - 1);
        else if (debouncedFilters.recentActivity === '7d')
          cutoffDate.setDate(now.getDate() - 7);
        else if (debouncedFilters.recentActivity === '30d')
          cutoffDate.setDate(now.getDate() - 30);
        recentActivityMatch = jobDate >= cutoffDate;
      }

      return (
        searchTermMatch &&
        locationMatch &&
        roleTypeMatch &&
        remoteMatch &&
        recentActivityMatch
      );
    });
    setFilteredJobs(newFilteredJobs);
    setCurrentPage(1);
    setIsFiltering(false);
  }, [debouncedFilters, allJobs, isLoading]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    return filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);

  const JobSkeletonCard = () => (
    <Card
      className={`shadow-sm flex flex-col ${viewMode === 'list' ? '' : 'h-full'}`}
    >
    <Card
      className={`shadow-sm flex flex-col ${viewMode === 'list' ? '' : 'h-full'}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4 flex-grow">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <div className="flex justify-between items-center w-full">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <FilterSidebar
          onFilterChange={setCurrentFilters}
          initialFilters={currentFilters}
        />
      </aside>
      <main className="w-full md:w-3/4 lg:w-4/5">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold font-headline">
            {isLoading && allJobs.length === 0
              ? 'Loading Jobs...'
              : isFiltering
                ? 'Filtering Jobs...'
                : `Found ${filteredJobs.length} Approved Jobs`}
          </h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-5 w-5" />
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


        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
              <JobSkeletonCard key={index} />
            ))}
          </div>
        ) : !error && paginatedJobs.length > 0 ? (
          <>
            <div
              className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
            >
              {paginatedJobs.map((job) => (
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
              <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                No approved jobs found matching your criteria.
              </p>
              <p className="text-xl text-muted-foreground">
                No approved jobs found matching your criteria.
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
