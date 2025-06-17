
"use client";
import { useState, useEffect } from 'react';
import { mockJobSeekerProfiles } from '@/lib/mockData';
import type { UserProfile } from '@/types';
import { CandidateCard } from './CandidateCard';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CandidateFilters } from './CandidateFilterSidebar'; // Assuming you'll create this

export function CandidateSearchResults() {
  const [filteredCandidates, setFilteredCandidates] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Add filters state if CandidateFilterSidebar passes them down
  // const [currentFilters, setCurrentFilters] = useState<CandidateFilters>({});

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call or filtering based on `currentFilters`
    // For now, just load all mock job seekers
    setTimeout(() => {
      // Example basic filtering (you'd make this more robust with actual filters)
      // const applyFilters = (candidates: UserProfile[], filters: CandidateFilters) => {
      //   return candidates.filter(candidate => {
      //     const searchTermMatch = !filters.searchTerm || 
      //       candidate.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      //       candidate.headline?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      //       candidate.skills?.some(skill => skill.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      //     // Add more filter conditions here
      //     return searchTermMatch;
      //   });
      // };
      // setFilteredCandidates(applyFilters(mockJobSeekerProfiles, currentFilters));
      setFilteredCandidates(mockJobSeekerProfiles);
      setIsLoading(false);
    }, 500);
  }, [/* currentFilters */]); // Re-run when filters change

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="p-4 border rounded-lg shadow-sm bg-card space-y-3">
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
          </div>
        ))}
      </div>
    );
  }

  if (filteredCandidates.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Candidates Found</AlertTitle>
        <AlertDescription>
          No candidates match your current filter criteria. Try adjusting your filters.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredCandidates.map(candidate => (
        <CandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </div>
  );
}
