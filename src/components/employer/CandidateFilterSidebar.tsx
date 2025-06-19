'use client';
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
import { Search, RotateCcw } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { CandidateFilters } from '@/types';

interface CandidateFilterSidebarProps {
  onFilterChange: (filters: CandidateFilters) => void;
  initialFilters?: Partial<CandidateFilters>;
}

export function CandidateFilterSidebar({
  onFilterChange,
  initialFilters,
}: CandidateFilterSidebarProps) {
export function CandidateFilterSidebar({
  onFilterChange,
  initialFilters,
}: CandidateFilterSidebarProps) {
  const defaultFilters: CandidateFilters = {
    searchTerm: '',
    location: '', // For candidate's preferred location text search
    availability: 'all',
    jobSearchStatus: 'all',
    desiredSalaryMin: undefined,
    desiredSalaryMax: undefined,
    recentActivity: 'any', // Profile updated_at
    gender: 'all',
    homeState: '',
    homeCity: '',
    ...initialFilters,
  };

  const [filters, setFilters] = useState<CandidateFilters>(defaultFilters);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
    setFilters((prev) => ({
      ...prev,
      [name]:
        name === 'desiredSalaryMin' || name === 'desiredSalaryMax'
          ? value
            ? parseFloat(value)
            : undefined
          : value,
    }));
  };

  const handleSelectChange = (name: keyof CandidateFilters, value: string) => {
    setFilters((prev) => ({
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
  };
  };

  return (
    <Card className="sticky top-24 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-headline">
          Filter Candidates
        </CardTitle>
        <CardTitle className="text-xl font-headline">
          Filter Candidates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="searchTerm">
              Keywords (Name, Skills, Headline, Experience summary)
            </Label>
            <Input
              id="searchTerm"
              name="searchTerm"
              placeholder='e.g., React, "Senior Engineer", AI'
              value={filters.searchTerm}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use quotes for exact phrases. Multiple terms are ANDed.
            </p>
          </div>
          <div>
            <Label htmlFor="location">Preferred Location (text search)</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., Remote, Bangalore"
              value={filters.location}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="homeState">Home State</Label>
              <Input
                id="homeState"
                name="homeState"
                placeholder="e.g., Karnataka"
                value={filters.homeState || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="homeCity">Home City</Label>
              <Input
                id="homeCity"
                name="homeCity"
                placeholder="e.g., Bangalore"
                value={filters.homeCity || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              name="gender"
              value={filters.gender || 'all'}
              onValueChange={(value) => handleSelectChange('gender', value)}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Prefer not to say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
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
              <SelectTrigger id="availability">
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
              <SelectTrigger id="jobSearchStatus">
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
              type="submit"
              className="flex-1 min-w-[120px]"
              aria-label="Apply search filters"
            >
              <Search className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1 min-w-[100px] sm:flex-grow-0 sm:w-auto"
              aria-label="Reset search filters"
            >
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1 min-w-[100px] sm:flex-grow-0 sm:w-auto"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
