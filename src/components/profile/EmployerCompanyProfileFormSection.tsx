'use client';
import React from 'react';
import type { Company, UserProfile } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Building, Users, Info, ShieldCheck, Loader2 } from 'lucide-react';

interface EmployerCompanyProfileFormSectionProps {
  companyFormData: Partial<Company>;
  onCompanyChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  recruiters: UserProfile[];
  isFetchingRecruiters: boolean;
  isDisabled: boolean;
  companyStatus?: Company['status'];
  moderationReason?: string | null;
}

export function EmployerCompanyProfileFormSection({
  companyFormData,
  onCompanyChange,
  recruiters,
  isFetchingRecruiters,
  isDisabled,
  companyStatus,
  moderationReason,
}: EmployerCompanyProfileFormSectionProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-headline flex items-center gap-2">
              <Building /> Company Profile
            </CardTitle>
            <CardDescription>
              Manage your company&apos;s public information. Changes here affect
              your public company page. Profile status changes are handled by
              site admins.
            </CardDescription>
          </div>
          {companyStatus && (
            <Badge
              variant={
                companyStatus === 'approved' || companyStatus === 'active'
                  ? 'default'
                  : companyStatus === 'rejected' ||
                      companyStatus === 'suspended' ||
                      companyStatus === 'deleted'
                    ? 'destructive'
                    : 'secondary'
              }
              className="text-sm"
            >
              <ShieldCheck className="mr-1.5 h-4 w-4" />
              {companyStatus.toUpperCase()}
            </Badge>
          )}
        </div>
        {(companyStatus === 'rejected' || companyStatus === 'suspended') &&
          moderationReason && (
            <p className="text-sm text-destructive mt-1">
              Admin Reason: {moderationReason}
            </p>
          )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="companyNameActual">Company Name</Label>
            <Input
              id="companyNameActual"
              name="name"
              value={companyFormData.name || ''}
              onChange={onCompanyChange}
              required
              placeholder="e.g., Your Company Inc."
              disabled={isDisabled}
            />
          </div>
          <div>
            <Label htmlFor="companyWebsiteUrl">Company Website URL</Label>
            <Input
              id="companyWebsiteUrl"
              name="websiteUrl"
              placeholder="https://yourcompany.com"
              value={companyFormData.websiteUrl || ''}
              onChange={onCompanyChange}
              disabled={isDisabled}
            />
          </div>
          <div>
            <Label htmlFor="companyLogoUrl">Company Logo URL</Label>
            <Input
              id="companyLogoUrl"
              name="logoUrl"
              placeholder="https://example.com/logo.png"
              value={companyFormData.logoUrl || ''}
              onChange={onCompanyChange}
              data-ai-hint="company logo"
              disabled={isDisabled}
            />
          </div>
          <div>
            <Label htmlFor="companyBannerImageUrl">
              Company Banner Image URL
            </Label>
            <Input
              id="companyBannerImageUrl"
              name="bannerImageUrl"
              placeholder="https://example.com/banner.png"
              value={companyFormData.bannerImageUrl || ''}
              onChange={onCompanyChange}
              data-ai-hint="company banner"
              disabled={isDisabled}
            />
          </div>
          <div>
            <Label htmlFor="companyDescription">
              Company Description (Markdown supported)
            </Label>
            <Textarea
              id="companyDescription"
              name="description"
              value={companyFormData.description || ''}
              onChange={onCompanyChange}
              rows={6}
              placeholder="Briefly describe your company, its mission, and culture..."
              disabled={isDisabled}
            />
          </div>
          <hr className="my-6" />
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users /> Recruiters ({recruiters.length})
            </h3>
            {isFetchingRecruiters ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading recruiters...
              </div>
            ) : recruiters.length > 0 ? (
              <div className="space-y-3">
                {recruiters.map((rec) => (
                  <div
                    key={rec.uid}
                    className="flex items-center gap-3 p-2 border rounded-md bg-muted/20"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={rec.avatarUrl || `https://placehold.co/40x40.png`}
                        alt={rec.name || 'Recruiter'}
                        data-ai-hint="recruiter avatar"
                      />
                      <AvatarFallback>
                        {rec.name?.[0]?.toUpperCase() || 'R'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{rec.name || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">
                        {rec.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recruiters currently associated with this company besides
                yourself.
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              <Info className="inline h-3 w-3 mr-1" />
              Recruiter management (inviting, removing) is handled by site
              administrators.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
