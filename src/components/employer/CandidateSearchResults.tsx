'use client';
import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { CandidateCard } from './CandidateCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CandidateFilters } from './CandidateFilterSidebar';
import { db } from '@/lib/firebase';
import {
  collection,
  query as firestoreQuery,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card'; // Added Card imports

interface CandidateSearchResultsProps {
  viewMode: 'grid' | 'list';
  filters: CandidateFilters;
}

export function CandidateSearchResults({
  viewMode,
  filters,
}: CandidateSearchResultsProps) {
  const [allCandidates, setAllCandidates] = useState<UserProfile[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<UserProfile[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersCollectionRef = collection(db, 'users');
        const q = firestoreQuery(
          usersCollectionRef,
          where('role', '==', 'jobSeeker')
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
        setFilteredCandidates(candidatesData); // Initially show all, will be filtered by next effect
      } catch (e: any) {
        console.error('Error fetching candidates:', e);
        setError(
          'Failed to load candidates. ' +
            (e.message || 'Please try again later.')
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (allCandidates.length > 0 || !isLoading) {
      // Run filter if candidates loaded or initial load done
      setIsLoading(true); // Indicate filtering is in progress if new filters applied
      const applyFilters = (
        candidates: UserProfile[],
        currentFilters: CandidateFilters
      ) => {
        return candidates.filter((candidate) => {
          const searchTermMatch =
            !currentFilters.searchTerm ||
            candidate.name
              ?.toLowerCase()
              .includes(currentFilters.searchTerm.toLowerCase()) ||
            candidate.headline
              ?.toLowerCase()
              .includes(currentFilters.searchTerm.toLowerCase()) ||
            candidate.skills?.some((skill) =>
              skill
                .toLowerCase()
                .includes(currentFilters.searchTerm.toLowerCase())
            ) ||
            candidate.experience
              ?.toLowerCase()
              .includes(currentFilters.searchTerm.toLowerCase());

          const locationMatch =
            !currentFilters.location ||
            candidate.preferredLocations?.some((loc) =>
              loc.toLowerCase().includes(currentFilters.location.toLowerCase())
            ) ||
            (currentFilters.location.toLowerCase() === 'remote' &&
              candidate.preferredLocations?.some(
                (loc) => loc.toLowerCase() === 'remote'
              ));

          const availabilityMatch =
            currentFilters.availability === 'all' ||
            candidate.availability?.toLowerCase() ===
              currentFilters.availability.toLowerCase();

          return searchTermMatch && locationMatch && availabilityMatch;
        });
      };
      setFilteredCandidates(applyFilters(allCandidates, filters));
      setIsLoading(false);
    }
  }, [filters, allCandidates, isLoading]); // isLoading in deps to ensure it runs after initial load too

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

  if (
    isLoading &&
    filteredCandidates.length === 0 &&
    allCandidates.length === 0
  ) {
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

  if (filteredCandidates.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Candidates Found</AlertTitle>
        <AlertDescription>
          No candidates match your current filter criteria. Try adjusting your
          filters or checking back later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
    >
      {filteredCandidates.map((candidate) => (
        <CandidateCard key={candidate.uid} candidate={candidate} />
      ))}
    </div>
  );
}
