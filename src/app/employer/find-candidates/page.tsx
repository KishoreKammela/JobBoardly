'use client';
import { useState, useEffect } from 'react';
import { CandidateSearchResults } from '@/components/employer/CandidateSearchResults';
import {
  CandidateFilterSidebar,
  type CandidateFilters,
} from '@/components/employer/CandidateFilterSidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Loader2, Search as SearchIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

export default function FindCandidatesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const debouncedGlobalSearchTerm = useDebounce(globalSearchTerm, 500);

  const [sidebarFilters, setSidebarFilters] = useState<
    Omit<CandidateFilters, 'searchTerm'>
  >({
    location: '',
    availability: 'all',
    jobSearchStatus: 'all',
    desiredSalaryMin: undefined,
    desiredSalaryMax: undefined,
    recentActivity: 'any',
  });

  const [activeCombinedFilters, setActiveCombinedFilters] =
    useState<CandidateFilters>({
      searchTerm: debouncedGlobalSearchTerm,
      ...sidebarFilters,
    });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (user.role !== 'employer') {
      router.replace('/');
    }
  }, [user, loading, router, pathname]);

  useEffect(() => {
    setActiveCombinedFilters({
      searchTerm: debouncedGlobalSearchTerm,
      ...sidebarFilters,
    });
  }, [debouncedGlobalSearchTerm, sidebarFilters]);

  if (loading || !user || user.role !== 'employer') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const handleSidebarFilterChange = (
    filters: Omit<CandidateFilters, 'searchTerm'>
  ) => {
    setSidebarFilters(filters);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <CandidateFilterSidebar
          onFilterChange={handleSidebarFilterChange}
          initialFilters={sidebarFilters}
        />
      </aside>
      <main className="w-full md:w-3/4 lg:w-4/5 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 font-headline">
              Find Candidates
            </h1>
            <p className="text-muted-foreground">
              Browse through profiles of talented job seekers.
            </p>
          </div>
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
        <div className="space-y-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder='Search candidates (e.g., React AND Bangalore, "Data Scientist")'
              className="w-full h-12 pl-10 text-base rounded-lg shadow-sm"
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              aria-label="Search candidates with boolean operators"
            />
          </div>
          <p className="text-xs text-muted-foreground px-1">
            Use AND/OR/NOT for complex queries, quotes for exact phrases (e.g.,
            &quot;Senior Developer&quot; AND (React OR Angular) NOT Java).
            Multiple terms are ANDed by default.
          </p>
        </div>
        <Separator />
        <CandidateSearchResults
          viewMode={viewMode}
          filters={activeCombinedFilters}
        />
      </main>
    </div>
  );
}
