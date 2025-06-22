import type { Timestamp } from 'firebase/firestore';

export type NotificationType =
  | 'NEW_APPLICATION'
  | 'APPLICATION_STATUS_UPDATE'
  | 'JOB_APPROVED'
  | 'JOB_REJECTED'
  | 'COMPANY_APPROVED'
  | 'COMPANY_REJECTED'
  | 'ADMIN_CONTENT_PENDING'
  | 'GENERIC_INFO';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: Timestamp | Date | string;
}
