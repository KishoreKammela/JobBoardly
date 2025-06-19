'use client';
import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { CandidateCard } from './CandidateCard';
import { AlertCircle, Loader2, UserSearch } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CandidateFilters } from '@/types'; // Updated import to global types
import { db } from '@/lib/firebase';
import {
  collection,
  query as firestoreQuery,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';

interface CandidateSearchResultsProps {
  viewMode: 'grid' | 'list';
  filters: CandidateFilters;
}

const CANDIDATES_PER_PAGE = 9;

export function CandidateSearchResults({
  viewMode,
  filters,
}: CandidateSearchResultsProps) {
  const [allCandidates, setAllCandidates] = useState<UserProfile[]>([]);
  const [filteredAndSortedCandidates, setFilteredAndSortedCandidates] =
    useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedFilters = useDebounce(filters, 500);

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersCollectionRef = collection(db, 'users');
        // Base query for job seekers whose profiles are searchable
        const q = firestoreQuery(
          usersCollectionRef,
          where('role', '==', 'jobSeeker'),
          where('isProfileSearchable', '==', true), // Only fetch searchable profiles
          orderBy('updatedAt', 'desc') // Default sort, can be changed by filters
        );

        const querySnapshot = await getDocs(q);
        const candidatesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            ...data,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt,
          } as UserProfile;
        });
        setAllCandidates(candidatesData);
      } catch (e: any) {
        console.error('Error fetching candidates:', e);
        setError(
          'Failed to load candidates. ' +
            (e.message || 'Please try again later.')
        );
      } finally {
        setIsLoading(false); // Initial fetch done
      }
    };
    fetchCandidates();
  }, []); // Fetch all (searchable) candidates once on mount

  useEffect(() => {
    if (isLoading && allCandidates.length === 0) return; // Don't filter if initial load isn't done

    setIsLoading(true); // Indicate filtering is in progress

    const applyFilters = (
      candidates: UserProfile[],
      currentFilters: CandidateFilters
    ) => {
      let tempFiltered = [...candidates];

      // Keyword search (name, skills, headline, experience)
      if (currentFilters.searchTerm) {
        const lowerSearchTerm = currentFilters.searchTerm.toLowerCase();
        const searchTerms = lowerSearchTerm.includes('"')
          ? [lowerSearchTerm.replace(/"/g, '')] // Treat as exact phrase if quotes present
          : lowerSearchTerm.split(/\s+/).filter(Boolean); // Split by space for AND logic

        tempFiltered = tempFiltered.filter((candidate) => {
          const profileText = `
            ${candidate.name?.toLowerCase() || ''} 
            ${candidate.headline?.toLowerCase() || ''} 
            ${(candidate.skills || []).join(' ').toLowerCase()} 
            ${candidate.experience?.toLowerCase() || ''}
          `.trim();

          return searchTerms.every((term) => profileText.includes(term));
        });
      }

      // Location filter
      if (currentFilters.location) {
        const lowerLocation = currentFilters.location.toLowerCase();
        tempFiltered = tempFiltered.filter(
          (candidate) =>
            candidate.preferredLocations?.some((loc) =>
              loc.toLowerCase().includes(lowerLocation)
            ) ||
            (lowerLocation === 'remote' &&
              candidate.preferredLocations?.some(
                (loc) => loc.toLowerCase() === 'remote'
              ))
        );
      }

      // Availability filter
      if (
        currentFilters.availability &&
        currentFilters.availability !== 'all'
      ) {
        tempFiltered = tempFiltered.filter(
          (candidate) =>
            candidate.availability?.toLowerCase() ===
            currentFilters.availability.toLowerCase()
        );
      }

      // Job Search Status filter
      if (
        currentFilters.jobSearchStatus &&
        currentFilters.jobSearchStatus !== 'all'
      ) {
        tempFiltered = tempFiltered.filter(
          (candidate) =>
            candidate.jobSearchStatus?.toLowerCase() ===
            currentFilters.jobSearchStatus?.toLowerCase()
        );
      }

      // Desired Salary filter
      if (currentFilters.desiredSalaryMin !== undefined) {
        tempFiltered = tempFiltered.filter(
          (c) =>
            c.desiredSalary !== undefined &&
            c.desiredSalary >= currentFilters.desiredSalaryMin!
        );
      }
      if (currentFilters.desiredSalaryMax !== undefined) {
        tempFiltered = tempFiltered.filter(
          (c) =>
            c.desiredSalary !== undefined &&
            c.desiredSalary <= currentFilters.desiredSalaryMax!
        );
      }

      // Recent Activity filter
      if (
        currentFilters.recentActivity &&
        currentFilters.recentActivity !== 'any'
      ) {
        const now = new Date();
        const cutoffDate = new Date();
        if (currentFilters.recentActivity === '24h')
          cutoffDate.setDate(now.getDate() - 1);
        else if (currentFilters.recentActivity === '7d')
          cutoffDate.setDate(now.getDate() - 7);
        else if (currentFilters.recentActivity === '30d')
          cutoffDate.setDate(now.getDate() - 30);

        tempFiltered = tempFiltered.filter((c) => {
          const updatedAt = c.updatedAt
            ? new Date(c.updatedAt as string)
            : new Date(0);
          return updatedAt >= cutoffDate;
        });
      }

      return tempFiltered;
    };

    setFilteredAndSortedCandidates(
      applyFilters(allCandidates, debouncedFilters)
    );
    setCurrentPage(1); // Reset to first page on filter change
    setIsLoading(false);
  }, [debouncedFilters, allCandidates, isLoading]);

  const totalPages = Math.ceil(
    filteredAndSortedCandidates.length / CANDIDATES_PER_PAGE
  );
  const paginatedCandidates = filteredAndSortedCandidates.slice(
    (currentPage - 1) * CANDIDATES_PER_PAGE,
    currentPage * CANDIDATES_PER_PAGE
  );

  const CandidateSkeletonCard = () => (
    <Card
      className={`shadow-sm flex flex-col ${viewMode === 'list' ? '' : 'h-full'}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-md" />
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
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );

  if (isLoading && paginatedCandidates.length === 0) {
    return (
      <div
        className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
      >
        {Array.from({ length: viewMode === 'grid' ? 6 : 3 }).map((_, index) => (
          <CandidateSkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Candidates</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (paginatedCandidates.length === 0 && !isLoading) {
    return (
      <Alert>
        <UserSearch className="h-5 w-5" />
        <AlertTitle>No Candidates Found</AlertTitle>
        <AlertDescription>
          No candidates match your current filter criteria. Try adjusting your
          filters.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div
        className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
      >
        {paginatedCandidates.map((candidate) => (
          <CandidateCard key={candidate.uid} candidate={candidate} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center items-center gap-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
