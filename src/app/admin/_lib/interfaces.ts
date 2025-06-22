import type { Job } from '@/types';
import type React from 'react';

export interface JobWithApplicantCount extends Job {
  applicantCount: number;
}

export interface ModalState {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  onConfirmAction: (() => Promise<void>) | null;
  confirmText: string;
  confirmVariant: 'default' | 'destructive';
}

export const initialModalState: ModalState = {
  isOpen: false,
  title: '',
  description: '',
  onConfirmAction: null,
  confirmText: 'Confirm',
  confirmVariant: 'default',
};

export interface PlatformStats {
  totalJobSeekers: number;
  totalCompanies: number;
  totalJobs: number;
  approvedJobs: number;
  totalApplications: number;
}
