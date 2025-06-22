// src/components/profile/EmployerCompanyInfoSection.tsx
'use client';
import React from 'react';
import type { Company } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Info, ShieldCheck, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmployerCompanyInfoSectionProps {
  company: Company | null;
  isDisabled: boolean;
  isCompanyAdmin: boolean;
}

export function EmployerCompanyInfoSection({
  company,
  isDisabled,
  isCompanyAdmin,
}: EmployerCompanyInfoSectionProps) {
  if (!company) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Company details are not available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isActionDisabled =
    isDisabled ||
    (company.status !== 'active' && company.status !== 'approved');

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-headline flex items-center gap-2">
              <Building /> Company Profile Information
            </CardTitle>
            <CardDescription>
              This is your company&apos;s current public information.
            </CardDescription>
          </div>
          {company.status && (
            <Badge
              variant={
                company.status === 'approved' || company.status === 'active'
                  ? 'default'
                  : company.status === 'rejected' ||
                      company.status === 'suspended' ||
                      company.status === 'deleted'
                    ? 'destructive'
                    : 'secondary'
              }
              className="text-sm"
            >
              <ShieldCheck className="mr-1.5 h-4 w-4" />
              {company.status.toUpperCase()}
            </Badge>
          )}
        </div>
        {(company.status === 'rejected' || company.status === 'suspended') &&
          company.moderationReason && (
            <p className="text-sm text-destructive mt-1">
              Admin Reason: {company.moderationReason}
            </p>
          )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">{company.name}</h4>
            <a
              href={
                company.websiteUrl?.startsWith('http')
                  ? company.websiteUrl
                  : `https://${company.websiteUrl}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {company.websiteUrl}
            </a>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {company.description || 'No description provided.'}
          </p>
          {isCompanyAdmin && (
            <>
              <hr className="my-4" />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 rounded-md bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  <Info className="inline h-4 w-4 mr-1.5" />
                  As a Company Admin, you can edit the company profile.
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  disabled={isActionDisabled}
                >
                  <Link href="/employer/company/edit">
                    <Edit className="mr-2 h-4 w-4" /> Edit Company Details
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
