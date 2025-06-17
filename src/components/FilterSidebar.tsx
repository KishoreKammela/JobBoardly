
"use client";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, RotateCcw } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export interface Filters {
  searchTerm: string;
  location: string;
  roleType: string; // 'all', 'Full-time', 'Part-time', 'Contract', 'Internship'
  isRemote: boolean;
}

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
              onCheckedChange={(checked) => handleSelectChange('isRemote', checked as boolean ? 'true' : 'false')}
            />
            <Label htmlFor="isRemote" className="font-medium">
              Remote Only
            </Label>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2"> {/* Changed to flex-wrap */}
            <Button type="submit" className="flex-1 min-w-[120px]"> {/* Adjusted classes for flex-wrap */}
              <Search className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} className="flex-1 min-w-[100px] sm:flex-grow-0 sm:w-auto"> {/* Adjusted classes for flex-wrap */}
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
