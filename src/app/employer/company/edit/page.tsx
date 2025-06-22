// src/app/employer/company/edit/page.tsx
'use client';

import React, { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { useCompany } from '@/contexts/Company/CompanyContext';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Company } from '@/types';
import { Loader2, Building, AlertTriangle, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateCompanyProfileAndSetPending } from '@/services/company.services';
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

export default function EditCompanyPage() {
  const { user, loading: authLoading } = useAuth();
  const { company, loading: companyLoading } = useCompany();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Company>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (authLoading || companyLoading) return;
    if (!user) {
      router.replace(
        `/employer/login?redirect=${encodeURIComponent(pathname)}`
      );
      return;
    }
    if (!user.isCompanyAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only company admins can edit company details.',
        variant: 'destructive',
      });
      router.replace('/profile');
      return;
    }
    if (company) {
      setFormData({
        name: company.name || '',
        description: company.description || '',
        websiteUrl: company.websiteUrl || '',
        logoUrl: company.logoUrl || '',
        bannerImageUrl: company.bannerImageUrl || '',
      });
    }
  }, [user, company, authLoading, companyLoading, router, pathname, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!company) return;
    setIsSubmitting(true);
    try {
      await updateCompanyProfileAndSetPending(company.id, formData);
      toast({
        title: 'Company Profile Updated',
        description:
          'Your changes have been saved and submitted for admin approval.',
      });
      router.push('/profile');
    } catch (error) {
      console.error('Failed to update company profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not save company details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

  if (authLoading || companyLoading || !company) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.isCompanyAdmin) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>Redirecting...</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <Building /> Edit Company Profile
          </CardTitle>
          <CardDescription>
            Update your company&apos;s public information. Changes will be
            submitted for admin review before going live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                placeholder="e.g., Your Company Inc."
              />
            </div>
            <div>
              <Label htmlFor="websiteUrl">Company Website URL</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                placeholder="https://yourcompany.com"
                value={formData.websiteUrl || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="logoUrl">Company Logo URL</Label>
              <Input
                id="logoUrl"
                name="logoUrl"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl || ''}
                onChange={handleChange}
                data-ai-hint="company logo"
              />
            </div>
            <div>
              <Label htmlFor="bannerImageUrl">Company Banner Image URL</Label>
              <Input
                id="bannerImageUrl"
                name="bannerImageUrl"
                placeholder="https://example.com/banner.png"
                value={formData.bannerImageUrl || ''}
                onChange={handleChange}
                data-ai-hint="company banner"
              />
            </div>
            <div>
              <Label htmlFor="description">
                Company Description (Markdown supported)
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={8}
                placeholder="Briefly describe your company, its mission, and culture..."
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save and Submit for Review
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these changes? Your company profile
              will be set to &quot;pending&quot; and will require admin approval
              before the changes are publicly visible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Confirm and Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
