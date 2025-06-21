'use client';
import { useState, useEffect } from 'react';
import { CandidateSearchResults } from '@/components/employer/CandidateSearchResults';
import {
  CandidateFilterSidebar,
  type CandidateFilters,
} from '@/components/employer/CandidateFilterSidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  List,
  Loader2,
  Search as SearchIcon,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';
import type { NoticePeriod } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function FindCandidatesPage() {
  const { user, company, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [globalSearchTerm, setGlobalSearchTerm] = useState(
    searchParams.get('q') || ''
  );
  const debouncedGlobalSearchTerm = useDebounce(globalSearchTerm, 500);

  const [sidebarFilters, setSidebarFilters] = useState<
    Omit<CandidateFilters, 'searchTerm'>
  >({
    location: searchParams.get('loc') || '',
    noticePeriod: (searchParams.get('notice') as NoticePeriod) || 'all',
    jobSearchStatus:
      (searchParams.get('status') as CandidateFilters['jobSearchStatus']) ||
      'all',
    desiredSalaryMin: searchParams.has('minSal')
      ? parseFloat(searchParams.get('minSal')!)
      : undefined,
    desiredSalaryMax: searchParams.has('maxSal')
      ? parseFloat(searchParams.get('maxSal')!)
      : undefined,
    recentActivity:
      (searchParams.get('activity') as CandidateFilters['recentActivity']) ||
      'any',
    minExperienceYears: searchParams.has('minExp')
      ? parseInt(searchParams.get('minExp')!, 10)
      : undefined,
  });

  const [activeCombinedFilters, setActiveCombinedFilters] =
    useState<CandidateFilters>({
      searchTerm: debouncedGlobalSearchTerm,
      ...sidebarFilters,
    });

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
    if (loading) return;
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in as an employer to find candidates.',
        variant: 'destructive',
      });
      router.replace(
        `/employer/login?redirect=${encodeURIComponent(pathname)}`
      );
    } else if (user.role !== 'employer') {
      toast({
        title: 'Access Denied',
        description: 'This page is for employers only.',
        variant: 'destructive',
      });
      router.replace('/');
    }
  }, [user, loading, router, pathname, toast]);

  useEffect(() => {
    setActiveCombinedFilters({
      searchTerm: debouncedGlobalSearchTerm,
      ...sidebarFilters,
    });
  }, [debouncedGlobalSearchTerm, sidebarFilters]);

  useEffect(() => {
    setGlobalSearchTerm(searchParams.get('q') || '');
    setSidebarFilters({
      location: searchParams.get('loc') || '',
      noticePeriod: (searchParams.get('notice') as NoticePeriod) || 'all',
      jobSearchStatus:
        (searchParams.get('status') as CandidateFilters['jobSearchStatus']) ||
        'all',
      desiredSalaryMin: searchParams.has('minSal')
        ? parseFloat(searchParams.get('minSal')!)
        : undefined,
      desiredSalaryMax: searchParams.has('maxSal')
        ? parseFloat(searchParams.get('maxSal')!)
        : undefined,
      recentActivity:
        (searchParams.get('activity') as CandidateFilters['recentActivity']) ||
        'any',
      minExperienceYears: searchParams.has('minExp')
        ? parseInt(searchParams.get('minExp')!, 10)
        : undefined,
    });
  }, [searchParams]);

  if (loading || !user || user.role !== 'employer') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (
    company &&
    (company.status === 'suspended' || company.status === 'deleted')
  ) {
    return (
      <div className="container mx-auto py-10 max-w-2xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>
            {company.status === 'suspended'
              ? 'Company Account Suspended'
              : 'Company Account Deactivated'}
          </AlertTitle>
          <AlertDescription>
            Your company&apos;s account is currently {company.status}. Candidate
            search features are unavailable. Please contact JobBoardly support
            for assistance.
            <Button variant="link" asChild className="mt-2 block px-0">
              <Link href="/employer/posted-jobs">Go to My Postings</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleGlobalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalSearchTerm(e.target.value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <CandidateFilterSidebar
          filters={sidebarFilters}
          onFilterChange={setSidebarFilters}
          currentGlobalSearchTerm={globalSearchTerm}
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
              onChange={handleGlobalSearchChange}
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
