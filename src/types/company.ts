import type { Timestamp } from 'firebase/firestore';

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
  invitations?: {
    email: string;
    name: string;
    status: 'pending' | 'accepted';
  }[];
  pendingInvitationEmails?: string[];
}
