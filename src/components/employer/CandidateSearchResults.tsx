'use client';
import { useState, useEffect, useMemo } from 'react';
import type { UserProfile } from '@/types';
import { CandidateCard } from './CandidateCard';
import { AlertCircle, Loader2, UserSearch } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CandidateFilters } from '@/types';
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
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      setIsFiltering(false);
      setError(null);
      try {
        const usersCollectionRef = collection(db, 'users');
        const q = firestoreQuery(
          usersCollectionRef,
          where('role', '==', 'jobSeeker'),
          where('isProfileSearchable', '==', true),
          orderBy('updatedAt', 'desc')
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
            lastActive:
              data.lastActive instanceof Timestamp
                ? data.lastActive.toDate().toISOString()
                : data.lastActive,
          } as UserProfile;
        });
        setAllCandidates(candidatesData);
        setFilteredAndSortedCandidates(candidatesData);
      } catch (e: unknown) {
        console.error('Error fetching candidates:', e);
        setError(
          'Failed to load candidates. ' +
            ((e as Error).message || 'Please try again later.')
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    setIsFiltering(true);

    const applyFilters = (
      candidatesToFilter: UserProfile[],
      currentFilters: CandidateFilters
    ) => {
      let tempFiltered = [...candidatesToFilter];

      if (currentFilters.searchTerm) {
        const searchTermLower = currentFilters.searchTerm.toLowerCase();
        const orSegments = searchTermLower.split(/\s+or\s+/i);
        let orResults: UserProfile[] = [];

        for (const orSegment of orSegments) {
          const andSegments = orSegment.split(/\s+and\s+/i);
          let segmentResults = [...candidatesToFilter];

          for (const andSegment of andSegments) {
            let mustBePresent = true;
            let termToSearch = andSegment;
            if (andSegment.startsWith('not ')) {
              mustBePresent = false;
              termToSearch = andSegment.substring(4).trim();
            }

            const phrases = termToSearch.match(/"([^"]+)"/g) || [];
            let remainingTerm = termToSearch;
            phrases.forEach(
              (phrase) =>
                (remainingTerm = remainingTerm.replace(phrase, '').trim())
            );
            const individualTerms = remainingTerm.split(/\s+/).filter(Boolean);

            segmentResults = segmentResults.filter((candidate) => {
              const profileText = `
                ${candidate.name?.toLowerCase() || ''} 
                ${candidate.headline?.toLowerCase() || ''} 
                ${(candidate.skills || []).join(' ').toLowerCase()} 
                ${candidate.parsedResumeText?.toLowerCase() || ''}
                ${
                  candidate.experiences
                    ?.map(
                      (e) => `${e.jobRole} ${e.companyName} ${e.description}`
                    )
                    .join(' ')
                    .toLowerCase() || ''
                }
              `.trim();

              let matchesAll = true;
              for (const phrase of phrases) {
                if (!profileText.includes(phrase.replace(/"/g, ''))) {
                  matchesAll = false;
                  break;
                }
              }
              if (!matchesAll) return mustBePresent ? false : true;

              for (const term of individualTerms) {
                if (!profileText.includes(term)) {
                  matchesAll = false;
                  break;
                }
              }
              return mustBePresent ? matchesAll : !matchesAll;
            });
          }
          orResults = orResults.concat(segmentResults);
        }
        tempFiltered = Array.from(new Set(orResults.map((c) => c.uid))).map(
          (uid) => orResults.find((c) => c.uid === uid)!
        );
      }

      if (currentFilters.location) {
        const lowerLocation = currentFilters.location.toLowerCase();
        tempFiltered = tempFiltered.filter((candidate) =>
          candidate.preferredLocations?.some((loc) =>
            loc.toLowerCase().includes(lowerLocation)
          )
        );
      }

      if (
        currentFilters.noticePeriod &&
        currentFilters.noticePeriod !== 'all'
      ) {
        tempFiltered = tempFiltered.filter(
          (candidate) =>
            candidate.noticePeriod?.toLowerCase() ===
            currentFilters.noticePeriod?.toLowerCase()
        );
      }

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

      if (currentFilters.desiredSalaryMin !== undefined) {
        tempFiltered = tempFiltered.filter(
          (c) =>
            c.expectedCTCValue !== undefined &&
            c.expectedCTCValue >= currentFilters.desiredSalaryMin!
        );
      }
      if (currentFilters.desiredSalaryMax !== undefined) {
        tempFiltered = tempFiltered.filter(
          (c) =>
            c.expectedCTCValue !== undefined &&
            c.expectedCTCValue <= currentFilters.desiredSalaryMax!
        );
      }

      if (currentFilters.minExperienceYears !== undefined) {
        tempFiltered = tempFiltered.filter(
          (c) =>
            c.totalYearsExperience !== undefined &&
            c.totalYearsExperience >= currentFilters.minExperienceYears!
        );
      }

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

      return tempFiltered.sort((a, b) => {
        const dateA = a.updatedAt
          ? new Date(a.updatedAt as string).getTime()
          : 0;
        const dateB = b.updatedAt
          ? new Date(b.updatedAt as string).getTime()
          : 0;
        return dateB - dateA;
      });
    };

    setFilteredAndSortedCandidates(applyFilters(allCandidates, filters));
    setCurrentPage(1);
    setIsFiltering(false);
  }, [filters, allCandidates, isLoading]);

  const totalPages = Math.ceil(
    filteredAndSortedCandidates.length / CANDIDATES_PER_PAGE
  );
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * CANDIDATES_PER_PAGE;
    return filteredAndSortedCandidates.slice(
      startIndex,
      startIndex + CANDIDATES_PER_PAGE
    );
  }, [filteredAndSortedCandidates, currentPage]);

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

  if (isLoading && allCandidates.length === 0) {
    return (
      <div
        className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
      >
        {Array.from({
          length: viewMode === 'grid' ? CANDIDATES_PER_PAGE : 4,
        }).map((_, index) => (
          <CandidateSkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (isFiltering) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Filtering candidates...</p>
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

  if (paginatedCandidates.length === 0 && !isLoading && !isFiltering) {
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
            aria-label="Go to previous page of candidates"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            variant="outline"
            aria-label="Go to next page of candidates"
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
