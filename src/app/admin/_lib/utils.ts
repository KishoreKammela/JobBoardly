// src/app/admin/_lib/utils.ts
import type { UserRole } from '@/types';

export const getRoleDisplayName = (role: UserRole) => {
  switch (role) {
    case 'superAdmin':
      return 'Super Admin';
    case 'supportAgent':
      return 'Support Agent';
    case 'dataAnalyst':
      return 'Data Analyst';
    case 'complianceOfficer':
      return 'Compliance Officer';
    case 'systemMonitor':
      return 'System Monitor';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

export const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case 'superAdmin':
      return 'destructive';
    case 'admin':
      return 'default';
    case 'moderator':
      return 'secondary';
    case 'supportAgent':
      return 'outline';
    case 'dataAnalyst':
      return 'outline';
    default:
      return 'secondary';
  }
};
