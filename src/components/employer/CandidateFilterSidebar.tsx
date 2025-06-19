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
import { Search, RotateCcw } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export interface CandidateFilters {
  searchTerm: string; // For skills, headline, name
  location: string;
  availability: string; // 'all', 'Immediate', '2 Weeks Notice', '1 Month Notice', 'Flexible'
}

interface CandidateFilterSidebarProps {
  onFilterChange: (filters: CandidateFilters) => void;
  initialFilters?: Partial<CandidateFilters>;
}

export function CandidateFilterSidebar({
  onFilterChange,
  initialFilters,
}: CandidateFilterSidebarProps) {
  const defaultFilters: CandidateFilters = {
    searchTerm: '',
    location: '',
    availability: 'all',
    ...initialFilters,
  };

  const [filters, setFilters] = useState<CandidateFilters>(defaultFilters);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
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

  return (
    <Card className="sticky top-24 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-headline">
          Filter Candidates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="searchTerm">Keywords</Label>
            <Input
              id="searchTerm"
              name="searchTerm"
              placeholder="Skills, name, headline"
              value={filters.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="City, state, or remote"
              value={filters.location}
              onChange={handleChange}
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
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button type="submit" className="flex-1 min-w-[120px]">
              <Search className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
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
