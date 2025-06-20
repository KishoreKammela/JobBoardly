'use client';
import React from 'react';
import type { UserProfile } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign } from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';

interface JobSeekerCompensationSectionProps {
  userFormData: Partial<UserProfile>;
  onUserChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchChange: (name: keyof UserProfile, checked: boolean) => void;
  isDisabled: boolean;
}

export function JobSeekerCompensationSection({
  userFormData,
  onUserChange,
  onSwitchChange,
  isDisabled,
}: JobSeekerCompensationSectionProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-1.5">
          <DollarSign /> Compensation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <Label htmlFor="currentCTCValue">Current Annual CTC (INR)</Label>
              <Input
                id="currentCTCValue"
                name="currentCTCValue"
                type="number"
                placeholder="e.g., 1600000"
                value={
                  userFormData.currentCTCValue === undefined
                    ? ''
                    : userFormData.currentCTCValue
                }
                onChange={onUserChange}
                disabled={isDisabled}
              />
              {userFormData.currentCTCValue !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  Formatted: {formatCurrencyINR(userFormData.currentCTCValue)}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <Checkbox
                id="currentCTCConfidential"
                name="currentCTCConfidential"
                checked={userFormData.currentCTCConfidential || false}
                onCheckedChange={(checked) =>
                  onSwitchChange('currentCTCConfidential', Boolean(checked))
                }
                disabled={isDisabled}
              />
              <Label htmlFor="currentCTCConfidential">Confidential</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <Label htmlFor="expectedCTCValue">
                Expected Annual CTC (INR)
              </Label>
              <Input
                id="expectedCTCValue"
                name="expectedCTCValue"
                type="number"
                placeholder="e.g., 2000000"
                value={
                  userFormData.expectedCTCValue === undefined
                    ? ''
                    : userFormData.expectedCTCValue
                }
                onChange={onUserChange}
                disabled={isDisabled}
              />
              {userFormData.expectedCTCValue !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  Formatted: {formatCurrencyINR(userFormData.expectedCTCValue)}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <Checkbox
                id="expectedCTCNegotiable"
                name="expectedCTCNegotiable"
                checked={userFormData.expectedCTCNegotiable || false}
                onCheckedChange={(checked) =>
                  onSwitchChange('expectedCTCNegotiable', Boolean(checked))
                }
                disabled={isDisabled}
              />
              <Label htmlFor="expectedCTCNegotiable">Negotiable</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
