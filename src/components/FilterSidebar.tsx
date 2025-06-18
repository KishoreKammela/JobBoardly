
"use client";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, RotateCcw, Save, AlertCircle } from 'lucide-react'; // Added Save
import type React from 'react';
import { useState } from 'react';
import type { Filters } from '@/types'; // Import Filters from global types
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { useToast } from '@/hooks/use-toast'; // Import useToast
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface FilterSidebarProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Partial<Filters>;
}

export function FilterSidebar({ onFilterChange, initialFilters }: FilterSidebarProps) {
  const defaultFilters: Filters = {
    searchTerm: '',
    location: '',
    roleType: 'all',
    isRemote: false,
    ...initialFilters,
  };

  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [searchName, setSearchName] = useState(''); // For naming the saved search
  const [isSaveSearchAlertOpen, setIsSaveSearchAlertOpen] = useState(false);
  const { user, saveSearch } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: keyof Filters, checked: boolean | 'indeterminate') => {
     setFilters(prev => ({
      ...prev,
      [name]: checked === true,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  }

  const handleOpenSaveSearchDialog = () => {
    if (!user || user.role !== 'jobSeeker') {
      toast({
        title: 'Login Required',
        description: 'Please log in as a job seeker to save searches.',
        variant: 'destructive',
      });
      return;
    }
    // Pre-fill search name if possible, e.g., from searchTerm
    setSearchName(filters.searchTerm || 'My Job Search');
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
        await saveSearch(searchName, filters);
        toast({
          title: 'Search Saved!',
          description: `"${searchName}" has been added to your saved searches.`,
        });
        setIsSaveSearchAlertOpen(false);
        setSearchName(''); 
      } catch (error) {
        toast({
          title: 'Error Saving Search',
          description: 'Could not save your search. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };


  return (
    <Card className="sticky top-24 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Filter Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="searchTerm">Keywords</Label>
            <Input
              id="searchTerm"
              name="searchTerm"
              placeholder="Job title, skills, company"
              value={filters.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="City, state, or zip code"
              value={filters.location}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="roleType">Role Type</Label>
            <Select
              name="roleType"
              value={filters.roleType}
              onValueChange={(value) => handleSelectChange('roleType', value)}
            >
              <SelectTrigger id="roleType">
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
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isRemote"
              name="isRemote"
              checked={filters.isRemote}
              onCheckedChange={(checked) => handleCheckboxChange('isRemote', checked)}
            />
            <Label htmlFor="isRemote" className="font-medium">
              Remote Only
            </Label>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" className="flex-1 min-w-[120px]">
                <Search className="mr-2 h-4 w-4" /> Apply Filters
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} className="flex-1 min-w-[100px] sm:flex-grow-0 sm:w-auto">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
            </div>
            {user && user.role === 'jobSeeker' && (
                <Button type="button" variant="outline" onClick={handleOpenSaveSearchDialog} className="w-full">
                    <Save className="mr-2 h-4 w-4" /> Save This Search
                </Button>
            )}
          </div>
        </form>
      </CardContent>
      <AlertDialog open={isSaveSearchAlertOpen} onOpenChange={setIsSaveSearchAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Job Search</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a name for this search. You can manage your saved searches in Settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="searchNameInput">Search Name</Label>
            <Input
              id="searchNameInput"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="e.g., Remote React Jobs"
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSaveSearch}>Save Search</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
