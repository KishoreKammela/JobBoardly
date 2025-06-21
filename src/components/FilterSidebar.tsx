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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, RotateCcw, Save } from 'lucide-react';
import { useState } from 'react';
import type { Filters, JobExperienceLevel } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useJobSeekerActions } from '@/contexts/JobSeekerActionsContext';
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

interface FilterSidebarProps {
  filters: Omit<Filters, 'searchTerm'>;
  onFilterChange: (filters: Omit<Filters, 'searchTerm'>) => void;
  currentGlobalSearchTerm?: string;
}

const experienceLevelOptions: (JobExperienceLevel | 'all')[] = [
  'all',
  'Entry-Level',
  'Mid-Level',
  'Senior-Level',
  'Lead',
  'Manager',
  'Executive',
];

export function FilterSidebar({
  filters,
  onFilterChange,
  currentGlobalSearchTerm = '',
}: FilterSidebarProps) {
  const [searchName, setSearchName] = useState('');
  const [isSaveSearchAlertOpen, setIsSaveSearchAlertOpen] = useState(false);
  const { user } = useAuth();
  const { saveSearch } = useJobSeekerActions();
  const { toast } = useToast();

  const handleCheckboxChange = (
    name: keyof Omit<Filters, 'searchTerm'>,
    checked: boolean | 'indeterminate'
  ) => {
    onFilterChange({
      ...filters,
      [name]: checked === true,
    });
  };

  const handleSelectChange = (
    name: keyof Omit<Filters, 'searchTerm'>,
    value: string
  ) => {
    onFilterChange({
      ...filters,
      [name]: value,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]:
        name === 'salaryMin' ||
        name === 'salaryMax' ||
        name === 'minExperienceYears'
          ? value === ''
            ? undefined
            : parseFloat(value)
          : value,
    });
  };

  const handleReset = () => {
    onFilterChange({
      location: '',
      roleType: 'all',
      isRemote: false,
      recentActivity: 'any',
      industry: '',
      experienceLevel: 'all',
      salaryMin: undefined,
      salaryMax: undefined,
      minExperienceYears: undefined,
    });
  };

  const handleOpenSaveSearchDialog = () => {
    if (!user || user.role !== 'jobSeeker') {
      toast({
        title: 'Login Required',
        description: 'Please log in as a job seeker to save searches.',
        variant: 'destructive',
      });
      return;
    }
    if (user.status === 'suspended') {
      toast({
        title: 'Account Suspended',
        description:
          'You cannot save searches while your account is suspended.',
        variant: 'destructive',
      });
      return;
    }
    setSearchName(currentGlobalSearchTerm || 'My Job Search');
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
    if (user && user.role === 'jobSeeker') {
      try {
        const fullFiltersToSave: Filters = {
          ...filters,
          searchTerm: currentGlobalSearchTerm,
        };
        await saveSearch(searchName, fullFiltersToSave);
        toast({
          title: 'Search Saved!',
          description: `"${searchName}" has been added to your saved searches.`,
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
          <Filter className="h-5 w-5 text-primary" /> Filter Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              name="industry"
              placeholder="e.g., Technology, Healthcare"
              value={filters.industry || ''}
              onChange={handleInputChange}
              aria-label="Industry filter for jobs"
            />
          </div>
          <div>
            <Label htmlFor="experienceLevel">Experience Level</Label>
            <Select
              name="experienceLevel"
              value={filters.experienceLevel || 'all'}
              onValueChange={(value) =>
                handleSelectChange(
                  'experienceLevel',
                  value as JobExperienceLevel | 'all'
                )
              }
            >
              <SelectTrigger
                id="experienceLevel"
                aria-label="Filter by experience level"
              >
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevelOptions.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="City, state, or zip code"
              value={filters.location || ''}
              onChange={handleInputChange}
              aria-label="Location filter for jobs"
            />
          </div>
          <div>
            <Label htmlFor="minExperienceYears">Min. Experience (Years)</Label>
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
              onChange={handleInputChange}
              min="0"
              aria-label="Minimum years of experience filter"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="salaryMin">Min. Salary (INR)</Label>
              <Input
                id="salaryMin"
                name="salaryMin"
                type="number"
                placeholder="e.g., 500000"
                value={filters.salaryMin === undefined ? '' : filters.salaryMin}
                onChange={handleInputChange}
                aria-label="Minimum salary filter"
              />
            </div>
            <div>
              <Label htmlFor="salaryMax">Max. Salary (INR)</Label>
              <Input
                id="salaryMax"
                name="salaryMax"
                type="number"
                placeholder="e.g., 1500000"
                value={filters.salaryMax === undefined ? '' : filters.salaryMax}
                onChange={handleInputChange}
                aria-label="Maximum salary filter"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="roleType">Role Type</Label>
            <Select
              name="roleType"
              value={filters.roleType || 'all'}
              onValueChange={(value) => handleSelectChange('roleType', value)}
            >
              <SelectTrigger id="roleType" aria-label="Filter by role type">
                <SelectValue placeholder="Select role type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="recentActivity">Recent Activity</Label>
            <Select
              name="recentActivity"
              value={filters.recentActivity || 'any'}
              onValueChange={(value) =>
                handleSelectChange('recentActivity', value)
              }
            >
              <SelectTrigger
                id="recentActivity"
                aria-label="Filter by job posting date"
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
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isRemote"
              name="isRemote"
              checked={filters.isRemote}
              onCheckedChange={(checked) =>
                handleCheckboxChange('isRemote', checked)
              }
              aria-labelledby="isRemoteLabel"
            />
            <Label
              htmlFor="isRemote"
              className="font-medium"
              id="isRemoteLabel"
            >
              Remote Only
            </Label>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="w-full"
              aria-label="Reset job filters"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
            {user && user.role === 'jobSeeker' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenSaveSearchDialog}
                className="w-full"
                aria-label="Save current search criteria"
                disabled={user.status === 'suspended'}
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
            <AlertDialogTitle>Save Job Search</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a name for this search. It will include your current keyword
              &quot;{currentGlobalSearchTerm || 'none'}&quot; and the selected
              filters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="searchNameInput">Search Name</Label>
            <Input
              id="searchNameInput"
              value={searchName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchName(e.target.value)
              }
              placeholder="e.g., Remote React Jobs"
              className="mt-1"
              aria-label="Name for saved search"
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
