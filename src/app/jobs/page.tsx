
"use client";
import { useState, useEffect } from 'react';
import { JobCard } from '@/components/JobCard';
import { FilterSidebar, type Filters } from '@/components/FilterSidebar';
import type { Job } from '@/types';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, getDocs, query as firestoreQuery, where, Timestamp, orderBy } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const JOBS_PER_PAGE = 9;

export default function JobsPage() {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const jobsCollectionRef = collection(db, "jobs");
        const q = firestoreQuery(jobsCollectionRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            postedDate: data.postedDate instanceof Timestamp ? data.postedDate.toDate().toISOString().split('T')[0] : data.postedDate,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          } as Job;
        });
        setAllJobs(jobsData);
        setFilteredJobs(jobsData); 
      } catch (e) {
        console.error("Error fetching jobs:", e);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleFilterChange = (filters: Filters) => {
    setIsLoading(true); 
    setCurrentPage(1); 
    
    const newFilteredJobs = allJobs.filter(job => {
      const searchTermMatch = filters.searchTerm.toLowerCase() === '' ||
        job.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(filters.searchTerm.toLowerCase())));
      
      const locationMatch = filters.location.toLowerCase() === '' ||
        job.location.toLowerCase().includes(filters.location.toLowerCase());
      
      const roleTypeMatch = filters.roleType === 'all' ||
        job.type.toLowerCase() === filters.roleType.toLowerCase();
      
      const remoteMatch = !filters.isRemote || job.isRemote; // Use boolean directly

      return searchTermMatch && locationMatch && roleTypeMatch && remoteMatch;
    });
    setFilteredJobs(newFilteredJobs);
    setIsLoading(false);
  };

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  const JobSkeleton = () => (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3 ${viewMode === 'list' ? 'flex flex-col' : ''}`}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-8 w-[80px]" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <FilterSidebar onFilterChange={handleFilterChange} />
      </aside>
      <main className="w-full md:w-3/4 lg:w-4/5">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold font-headline">
            {isLoading ? 'Loading Jobs...' : `Found ${filteredJobs.length} Jobs`}
          </h2>
          <div className="flex gap-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
              <LayoutGrid className="h-5 w-5"/>
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
              <List className="h-5 w-5"/>
            </Button>
          </div>
        </div>
        
        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {isLoading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {Array.from({ length: JOBS_PER_PAGE }).map((_, index) => <JobSkeleton key={index} />)}
          </div>
        ) : !error && paginatedJobs.length > 0 ? (
          <>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {paginatedJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <Button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          !error && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No jobs found matching your criteria.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
