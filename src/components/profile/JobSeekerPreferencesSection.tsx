'use client';
import React from 'react';
import type { UserProfile } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Briefcase, Eye, EyeOff } from 'lucide-react';

interface JobSeekerPreferencesSectionProps {
  userFormData: Partial<UserProfile>;
  onUserChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationsChange: (locations: string[]) => void;
  onSelectChange: (name: keyof UserProfile, value: string) => void;
  onSwitchChange: (name: keyof UserProfile, checked: boolean) => void;
  isDisabled: boolean;
}

export function JobSeekerPreferencesSection({
  userFormData,
  onUserChange,
  onLocationsChange,
  onSelectChange,
  onSwitchChange,
  isDisabled,
}: JobSeekerPreferencesSectionProps) {
  const handleLocationsInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value;
    onLocationsChange(
      val
        .split(',')
        .map((loc) => loc.trim())
        .filter((loc) => loc)
    );
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <Briefcase /> Preferences & Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input
                id="portfolioUrl"
                name="portfolioUrl"
                placeholder="https://yourportfolio.com"
                value={userFormData.portfolioUrl || ''}
                onChange={onUserChange}
                disabled={isDisabled}
              />
            </div>
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                placeholder="https://linkedin.com/in/yourprofile"
                value={userFormData.linkedinUrl || ''}
                onChange={onUserChange}
                disabled={isDisabled}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="preferredLocations">
              Preferred Locations (comma-separated)
            </Label>
            <Input
              id="preferredLocations"
              name="preferredLocations"
              value={(userFormData.preferredLocations || []).join(', ')}
              onChange={handleLocationsInputChange}
              placeholder="e.g., San Francisco, Remote, New York"
              disabled={isDisabled}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="jobSearchStatus">Job Search Status</Label>
              <Select
                value={userFormData.jobSearchStatus || 'activelyLooking'}
                onValueChange={(value) =>
                  onSelectChange('jobSearchStatus', value)
                }
                disabled={isDisabled}
              >
                <SelectTrigger id="jobSearchStatus" disabled={isDisabled}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
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
            <div>
              <Label htmlFor="availability">Availability</Label>
              <Select
                value={userFormData.availability || 'Flexible'}
                onValueChange={(value) => onSelectChange('availability', value)}
                disabled={isDisabled}
              >
                <SelectTrigger id="availability" disabled={isDisabled}>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="2 Weeks Notice">2 Weeks Notice</SelectItem>
                  <SelectItem value="1 Month Notice">1 Month Notice</SelectItem>
                  <SelectItem value="Flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-3 pt-2">
            <Switch
              id="isProfileSearchable"
              checked={Boolean(userFormData.isProfileSearchable)}
              onCheckedChange={(checked) =>
                onSwitchChange('isProfileSearchable', checked)
              }
              disabled={isDisabled}
            />
            <Label
              htmlFor="isProfileSearchable"
              className="flex items-center gap-1.5 cursor-pointer"
            >
              {userFormData.isProfileSearchable ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}{' '}
              My profile is searchable by employers
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
