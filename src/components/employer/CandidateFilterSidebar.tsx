
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, RotateCcw, Briefcase } from 'lucide-react';
import type React from 'react';
import { useState, useEffect } from 'react';
import type { CandidateFilters } from '@/types';

interface CandidateFilterSidebarProps {
  onFilterChange: (filters: Omit<CandidateFilters, 'searchTerm'>) => void;
  initialFilters?: Partial<Omit<CandidateFilters, 'searchTerm'>>;
}

export function CandidateFilterSidebar({
  onFilterChange,
  initialFilters,
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

  const [filters, setFilters] = useState<Omit<CandidateFilters, 'searchTerm'>>(defaultSidebarFilters);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
    setFilters((prev) => ({
      ...prev,
      [name]:
        name === 'desiredSalaryMin' || name === 'desiredSalaryMax' || name === 'minExperienceYears'
          ? value
            ? parseFloat(value)
            : undefined
          : value,
    }));
  };

  const handleSelectChange = (name: keyof Omit<CandidateFilters, 'searchTerm'>, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFilters(defaultSidebarFilters);
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
            <Label htmlFor="minExperienceYears" className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-primary/80" /> Min Experience (Years)
            </Label>
            <Input
              id="minExperienceYears"
              name="minExperienceYears"
              type="number"
              placeholder="e.g., 2"
              value={filters.minExperienceYears || ''}
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
              onValueChange={(value) =>
                handleSelectChange('availability', value)
              }
            >
              <SelectTrigger id="availability" aria-label="Filter by candidate availability">
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
              <SelectTrigger id="jobSearchStatus" aria-label="Filter by job search status">
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
                value={filters.desiredSalaryMin || ''}
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
                value={filters.desiredSalaryMax || ''}
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

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="w-full"
              aria-label="Reset search filters"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
