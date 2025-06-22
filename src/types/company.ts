// src/types/company.ts
import type { Timestamp } from 'firebase/firestore';

export interface RecruiterInvitation {
  id: string;
  companyId: string;
  companyName: string;
  recruiterEmail: string;
  recruiterName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp | Date | string;
  acceptedAt?: Timestamp | Date | string;
  userId?: string; // The UID of the user who accepted the invite
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
  bannerImageUrl?: string;
  adminUids: string[];
  recruiterUids: string[];
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'suspended'
    | 'deleted'
    | 'active';
  moderationReason?: string;
  jobCount?: number;
  applicationCount?: number;
}
