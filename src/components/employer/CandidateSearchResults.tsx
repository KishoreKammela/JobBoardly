
"use client";
import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { CandidateCard } from './CandidateCard';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CandidateFilters } from './CandidateFilterSidebar';
import { db } from '@/lib/firebase';
import { collection, query as firestoreQuery, where, getDocs, Timestamp } from 'firebase/firestore';

interface CandidateSearchResultsProps {
  viewMode: 'grid' | 'list';
  filters: CandidateFilters;
}

export function CandidateSearchResults({ viewMode, filters }: CandidateSearchResultsProps) {
  const [allCandidates, setAllCandidates] = useState<UserProfile[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersCollectionRef = collection(db, "users");
        // Base query for job seekers
        let q = firestoreQuery(usersCollectionRef, where("role", "==", "jobSeeker"));

        // Note: Firestore does not support case-insensitive queries or partial string matches ('contains') directly
        // on multiple fields easily. Complex text search usually requires a dedicated search service (e.g., Algolia, Elasticsearch)
        // or client-side filtering for smaller datasets.

        // For "availability", if it's an exact match from a select, we can add a where clause.
        // if (filters.availability && filters.availability !== 'all') {
        //   q = firestoreQuery(q, where("availability", "==", filters.availability));
        // }
        // For simplicity with current filters, we will fetch all job seekers and filter client-side.
        // This is not scalable for very large numbers of users.

        const querySnapshot = await getDocs(q);
        const candidatesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            uid: doc.id,
            ...data,
            // Ensure Timestamps are handled if necessary, though UserProfile doesn't have many top-level dates directly from user input
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          } as UserProfile;
        });
        setAllCandidates(candidatesData);
      } catch (e: any) {
        console.error("Error fetching candidates:", e);
        setError("Failed to load candidates. " + (e.message || "Please try again later."));
      } finally {
        setIsLoading(false); // Set loading to false once initial fetch is done
      }
    };
    fetchCandidates();
  }, []); // Fetch all candidates once on mount

  useEffect(() => {
    // Apply client-side filtering whenever 'filters' or 'allCandidates' change
    if (allCandidates.length > 0) {
      setIsLoading(true); // Indicate filtering is in progress
      const applyFilters = (candidates: UserProfile[], currentFilters: CandidateFilters) => {
        return candidates.filter(candidate => {
          const searchTermMatch = !currentFilters.searchTerm ||
            candidate.name?.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
            candidate.headline?.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
            candidate.skills?.some(skill => skill.toLowerCase().includes(currentFilters.searchTerm.toLowerCase())) ||
            candidate.experience?.toLowerCase().includes(currentFilters.searchTerm.toLowerCase());
          
          const locationMatch = !currentFilters.location ||
            candidate.preferredLocations?.some(loc => loc.toLowerCase().includes(currentFilters.location.toLowerCase())) ||
            (currentFilters.location.toLowerCase() === 'remote' && candidate.preferredLocations?.some(loc => loc.toLowerCase() === 'remote'));

          const availabilityMatch = currentFilters.availability === 'all' || 
            candidate.availability?.toLowerCase() === currentFilters.availability.toLowerCase();

          return searchTermMatch && locationMatch && availabilityMatch;
        });
      };
      setFilteredCandidates(applyFilters(allCandidates, filters));
      setIsLoading(false);
    } else if (!isLoading) { // If allCandidates is empty and not initially loading
        setFilteredCandidates([]); // Ensure filtered is also empty
    }
  }, [filters, allCandidates, isLoading]);


  const SkeletonCard = () => (
    <div className={`p-4 border rounded-lg shadow-sm bg-card space-y-3 ${viewMode === 'list' ? 'flex flex-col' : ''}`}>
        <div className="flex items-center space-x-3">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
            <div className="space-y-2">
                <div className="h-5 w-40 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
            </div>
        </div>
        <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
        <div className="flex flex-wrap gap-2 pt-2">
            <div className="h-6 w-16 bg-muted animate-pulse rounded-full"></div>
            <div className="h-6 w-20 bg-muted animate-pulse rounded-full"></div>
            <div className="h-6 w-12 bg-muted animate-pulse rounded-full"></div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t mt-3">
            <div className="flex gap-2">
                <div className="h-8 w-24 bg-muted animate-pulse rounded-md"></div>
                <div className="h-8 w-24 bg-muted animate-pulse rounded-md"></div>
            </div>
            <div className="h-8 w-20 bg-muted animate-pulse rounded-md"></div>
        </div>
    </div>
  );

  if (isLoading && filteredCandidates.length === 0) { // Show skeletons only if truly loading and no data yet
    return (
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
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
          No candidates match your current filter criteria. Try adjusting your filters or checking back later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
      {filteredCandidates.map(candidate => (
        <CandidateCard key={candidate.uid} candidate={candidate} />
      ))}
    </div>
  );
}
