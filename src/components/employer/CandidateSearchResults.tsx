
"use client";
import { useState, useEffect } from 'react';
import { mockJobSeekerProfiles } from '@/lib/mockData';
import type { UserProfile } from '@/types';
import { CandidateCard } from './CandidateCard';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CandidateFilters } from './CandidateFilterSidebar';

interface CandidateSearchResultsProps {
  viewMode: 'grid' | 'list';
  filters: CandidateFilters;
}

export function CandidateSearchResults({ viewMode, filters }: CandidateSearchResultsProps) {
  const [filteredCandidates, setFilteredCandidates] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call or filtering based on `filters`
    setTimeout(() => {
      const applyFilters = (candidates: UserProfile[], currentFilters: CandidateFilters) => {
        return candidates.filter(candidate => {
          const searchTermMatch = !currentFilters.searchTerm || 
            candidate.name?.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
            candidate.headline?.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
            candidate.skills?.some(skill => skill.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()));
          
          const locationMatch = !currentFilters.location ||
            candidate.preferredLocations?.some(loc => loc.toLowerCase().includes(currentFilters.location.toLowerCase())) ||
            (currentFilters.location.toLowerCase() === 'remote' && candidate.preferredLocations?.some(loc => loc.toLowerCase() === 'remote'));

          const availabilityMatch = currentFilters.availability === 'all' || 
            candidate.availability?.toLowerCase() === currentFilters.availability.toLowerCase();

          return searchTermMatch && locationMatch && availabilityMatch;
        });
      };
      setFilteredCandidates(applyFilters(mockJobSeekerProfiles, filters));
      setIsLoading(false);
    }, 500);
  }, [filters]);

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

  if (isLoading) {
    return (
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
      </div>
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
        <CandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </div>
  );
}
