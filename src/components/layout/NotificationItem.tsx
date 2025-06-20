'use client';
import type { Notification } from '@/types';
import { formatDistanceToNowStrict } from 'date-fns';
import Link from 'next/link';
import {
  Briefcase,
  CheckCircle,
  FileText,
  Info,
  MessageSquare,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
}

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'NEW_APPLICATION':
      return <FileText className="h-5 w-5 text-primary" />;
    case 'APPLICATION_STATUS_UPDATE':
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case 'JOB_APPROVED':
    case 'COMPANY_APPROVED':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'JOB_REJECTED':
    case 'COMPANY_REJECTED':
      return <XCircle className="h-5 w-5 text-destructive" />;
    case 'ADMIN_CONTENT_PENDING':
      return <Briefcase className="h-5 w-5 text-orange-500" />;
    default:
      return <Info className="h-5 w-5 text-muted-foreground" />;
  }
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const timeAgo = formatDistanceToNowStrict(
    new Date(notification.createdAt as string),
    {
      addSuffix: true,
    }
  );

  const content = (
    <div
      className={cn(
        'flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors w-full',
        !notification.isRead && 'bg-primary/5'
      )}
      onClick={() => {
        if (!notification.isRead) {
          onMarkAsRead(notification.id);
        }
        // Navigation will be handled by Link component if present
      }}
    >
      <div className="flex-shrink-0 pt-0.5">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1">
        <p
          className={cn(
            'text-sm font-medium',
            !notification.isRead && 'font-semibold text-foreground'
          )}
        >
          {notification.title}
        </p>
        <p
          className={cn(
            'text-xs text-muted-foreground line-clamp-2',
            !notification.isRead && 'text-foreground/80'
          )}
        >
          {notification.message}
        </p>
        <p
          className={cn(
            'text-xs text-muted-foreground/80 mt-1',
            !notification.isRead && 'font-medium'
          )}
        >
          {timeAgo}
        </p>
      </div>
      {!notification.isRead && (
        <div className="h-2.5 w-2.5 rounded-full bg-primary self-center shrink-0" />
      )}
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block w-full cursor-pointer">
        {content}
      </Link>
    );
  }

  return <div className="block w-full cursor-pointer">{content}</div>;
}
