'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, RotateCcw, Briefcase, Save } from 'lucide-react';
import type React from 'react';
import { useState, useEffect } from 'react';
import type { CandidateFilters } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployerActions } from '@/contexts/EmployerActionsContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CandidateFilterSidebarProps {
  onFilterChange: (filters: Omit<CandidateFilters, 'searchTerm'>) => void;
  initialFilters?: Partial<Omit<CandidateFilters, 'searchTerm'>>;
  currentGlobalSearchTerm?: string;
}

export function CandidateFilterSidebar({
  onFilterChange,
  initialFilters,
  currentGlobalSearchTerm = '',
}: CandidateFilterSidebarProps) {
  const defaultSidebarFilters: Omit<CandidateFilters, 'searchTerm'> = {
    location: '',
    availability: 'all',
    jobSearchStatus: 'all',
    desiredSalaryMin: undefined,
    desiredSalaryMax: undefined,
    recentActivity: 'any',
    minExperienceYears: undefined,
    ...initialFilters,
  };

  const [filters, setFilters] = useState<Omit<CandidateFilters, 'searchTerm'>>(
    defaultSidebarFilters
  );
  const [searchName, setSearchName] = useState('');
  const [isSaveSearchAlertOpen, setIsSaveSearchAlertOpen] = useState(false);
  const { user, company } = useAuth();
  const { saveCandidateSearch } = useEmployerActions();
  const { toast } = useToast();

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]:
        name === 'desiredSalaryMin' ||
        name === 'desiredSalaryMax' ||
        name === 'minExperienceYears'
          ? value
            ? parseFloat(value)
            : undefined
          : value,
    }));
  };

  const handleSelectChange = (
    name: keyof Omit<CandidateFilters, 'searchTerm'>,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFilters(defaultSidebarFilters);
  };

  const isSaveDisabled = () => {
    if (!user || user.role !== 'employer') return true;
    return company?.status === 'suspended' || company?.status === 'deleted';
  };

  const handleOpenSaveSearchDialog = () => {
    if (!user || user.role !== 'employer') {
      toast({
        title: 'Action Denied',
        description: 'Only employers can save candidate searches.',
        variant: 'destructive',
      });
      return;
    }
    if (isSaveDisabled()) {
      toast({
        title: 'Company Account Restricted',
        description:
          'Cannot save searches as your company account is currently restricted.',
        variant: 'destructive',
      });
      return;
    }
    setSearchName(currentGlobalSearchTerm || 'My Candidate Search');
    setIsSaveSearchAlertOpen(true);
  };

  const handleConfirmSaveSearch = async () => {
    if (!searchName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for your search.',
        variant: 'destructive',
      });
      return;
    }
    if (user && user.role === 'employer') {
      try {
        const fullFiltersToSave: CandidateFilters = {
          ...filters,
          searchTerm: currentGlobalSearchTerm,
        };
        await saveCandidateSearch(searchName, fullFiltersToSave);
        toast({
          title: 'Candidate Search Saved!',
          description: `"${searchName}" has been added to your saved candidate searches.`,
        });
        setIsSaveSearchAlertOpen(false);
        setSearchName('');
      } catch (error: unknown) {
        toast({
          title: 'Error Saving Search',
          description: `Could not save your search. Error: ${(error as Error).message}`,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Card className="sticky top-24 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Refine Candidates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div>
            <Label htmlFor="location">Preferred Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., Remote, Bangalore"
              value={filters.location}
              onChange={handleChange}
              aria-label="Filter by candidate preferred location"
            />
          </div>
          <div>
            <Label
              htmlFor="minExperienceYears"
              className="flex items-center gap-1.5"
            >
              <Briefcase className="h-4 w-4 text-primary/80" /> Min Experience
              (Years)
            </Label>
            <Input
              id="minExperienceYears"
              name="minExperienceYears"
              type="number"
              placeholder="e.g., 2"
              value={
                filters.minExperienceYears === undefined
                  ? ''
                  : filters.minExperienceYears
              }
              onChange={handleChange}
              min="0"
              aria-label="Minimum years of experience"
            />
          </div>
          <div>
            <Label htmlFor="availability">Availability</Label>
            <Select
              name="availability"
              value={filters.availability}
              onValueChange={(value) =>
                handleSelectChange('availability', value)
              }
            >
              <SelectTrigger
                id="availability"
                aria-label="Filter by candidate availability"
              >
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availabilities</SelectItem>
                <SelectItem value="Immediate">Immediate</SelectItem>
                <SelectItem value="2 Weeks Notice">2 Weeks Notice</SelectItem>
                <SelectItem value="1 Month Notice">1 Month Notice</SelectItem>
                <SelectItem value="Flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="jobSearchStatus">Job Search Status</Label>
            <Select
              name="jobSearchStatus"
              value={filters.jobSearchStatus || 'all'}
              onValueChange={(value) =>
                handleSelectChange('jobSearchStatus', value)
              }
            >
              <SelectTrigger
                id="jobSearchStatus"
                aria-label="Filter by job search status"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="activelyLooking">
                  Actively Looking
                </SelectItem>
                <SelectItem value="openToOpportunities">
                  Open to Opportunities
                </SelectItem>
                <SelectItem value="notLooking">Not Looking</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="desiredSalaryMin">
                Min Expected CTC (Annual INR)
              </Label>
              <Input
                id="desiredSalaryMin"
                name="desiredSalaryMin"
                type="number"
                placeholder="e.g., 500000"
                value={
                  filters.desiredSalaryMin === undefined
                    ? ''
                    : filters.desiredSalaryMin
                }
                onChange={handleChange}
                aria-label="Minimum expected salary"
              />
            </div>
            <div>
              <Label htmlFor="desiredSalaryMax">
                Max Expected CTC (Annual INR)
              </Label>
              <Input
                id="desiredSalaryMax"
                name="desiredSalaryMax"
                type="number"
                placeholder="e.g., 1500000"
                value={
                  filters.desiredSalaryMax === undefined
                    ? ''
                    : filters.desiredSalaryMax
                }
                onChange={handleChange}
                aria-label="Maximum expected salary"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="candidateRecentActivity">
              Profile Last Updated
            </Label>
            <Select
              name="recentActivity"
              value={filters.recentActivity || 'any'}
              onValueChange={(value) =>
                handleSelectChange('recentActivity', value)
              }
            >
              <SelectTrigger
                id="candidateRecentActivity"
                aria-label="Filter by profile last updated date"
              >
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Time</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="w-full"
              aria-label="Reset search filters"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
            {user && user.role === 'employer' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenSaveSearchDialog}
                className="w-full"
                aria-label="Save current candidate search criteria"
                disabled={isSaveDisabled()}
              >
                <Save className="mr-2 h-4 w-4" /> Save Current Search
              </Button>
            )}
          </div>
        </form>
      </CardContent>
      <AlertDialog
        open={isSaveSearchAlertOpen}
        onOpenChange={setIsSaveSearchAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Candidate Search</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a name for this search. It will include your current keyword
              &quot;{currentGlobalSearchTerm || 'none'}&quot; and the selected
              filters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="candidateSearchNameInput">Search Name</Label>
            <Input
              id="candidateSearchNameInput"
              value={searchName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchName(e.target.value)
              }
              placeholder="e.g., Senior Frontend Leads"
              className="mt-1"
              aria-label="Name for saved candidate search"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSaveSearch}>
              Save Search
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
