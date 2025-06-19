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
import React, { useState, useEffect } from 'react';
import type { Filters } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
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
  onFilterChange: (filters: Omit<Filters, 'searchTerm'>) => void;
  initialFilters?: Partial<Omit<Filters, 'searchTerm'>>;
  currentGlobalSearchTerm?: string;
}

export function FilterSidebar({
  onFilterChange,
  initialFilters,
  currentGlobalSearchTerm = '',
}: FilterSidebarProps) {
  const defaultSidebarFilters: Omit<Filters, 'searchTerm'> = {
    location: '',
    roleType: 'all',
    isRemote: false,
    recentActivity: 'any',
    ...initialFilters,
  };

  const [filters, setFilters] = useState<Omit<Filters, 'searchTerm'>>(
    defaultSidebarFilters
  );
  const [searchName, setSearchName] = useState('');
  const [isSaveSearchAlertOpen, setIsSaveSearchAlertOpen] = useState(false);
  const { user, saveSearch } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleCheckboxChange = (
    name: keyof Omit<Filters, 'searchTerm'>,
    checked: boolean | 'indeterminate'
  ) => {
    setFilters((prev) => ({
      ...prev,
      [name]: checked === true,
    }));
  };

  const handleSelectChange = (
    name: keyof Omit<Filters, 'searchTerm'>,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // onFilterChange(filters); // This is now handled by useEffect
  };

  const handleReset = () => {
    setFilters(defaultSidebarFilters);
    // onFilterChange(defaultSidebarFilters); // This is now handled by useEffect
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="City, state, or zip code"
              value={filters.location}
              onChange={handleInputChange}
              aria-label="Location filter for jobs"
            />
          </div>
          <div>
            <Label htmlFor="roleType">Role Type</Label>
            <Select
              name="roleType"
              value={filters.roleType}
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
