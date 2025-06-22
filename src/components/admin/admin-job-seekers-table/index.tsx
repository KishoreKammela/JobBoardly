// src/components/admin/admin-job-seekers-table/index.tsx
'use client';
import React, { useState, useMemo } from 'react';
import type { UserProfile } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Eye,
  ChevronsUpDown,
  Ban,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Trash2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ITEMS_PER_PAGE } from './_lib/constants';
import type { SortConfig } from './_lib/interfaces';
import { getSortableValue } from './_lib/utils';

interface AdminJobSeekersTableProps {
  jobSeekers: UserProfile[];
  isLoading: boolean;
  showConfirmationModal: (
    title: string,
    description: React.ReactNode,
    action: () => Promise<void>,
    confirmText?: string,
    confirmVariant?: 'default' | 'destructive'
  ) => void;
  handleUserStatusUpdate: (
    userId: string,
    newStatus: 'active' | 'suspended' | 'deleted'
  ) => Promise<void>;
  specificActionLoading: string | null;
  canPerformUserActions: boolean;
}

export const AdminJobSeekersTable: React.FC<AdminJobSeekersTableProps> = ({
  jobSeekers,
  isLoading,
  showConfirmationModal,
  handleUserStatusUpdate,
  specificActionLoading,
  canPerformUserActions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig<UserProfile>>({
    key: 'createdAt',
    direction: 'desc',
  });

  const requestSort = (key: keyof UserProfile) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const sortedAndFilteredJobSeekers = useMemo(() => {
    let sortableItems = [...jobSeekers];
    if (debouncedSearchTerm) {
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
      sortableItems = sortableItems.filter(
        (user) =>
          (user.name && user.name.toLowerCase().includes(lowerSearchTerm)) ||
          (user.email && user.email.toLowerCase().includes(lowerSearchTerm))
      );
    }
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = getSortableValue(a, sortConfig.key);
        const valB = getSortableValue(b, sortConfig.key);
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [jobSeekers, sortConfig, debouncedSearchTerm]);

  const paginatedJobSeekers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredJobSeekers.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [sortedAndFilteredJobSeekers, currentPage]);

  const totalPages = Math.ceil(
    sortedAndFilteredJobSeekers.length / ITEMS_PER_PAGE
  );

  const renderSortIcon = (key: keyof UserProfile) => {
    if (sortConfig.key !== key)
      return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'asc' ? '🔼' : '🔽';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Manage Job Seekers ({sortedAndFilteredJobSeekers.length})
        </CardTitle>
        <Input
          placeholder="Search job seekers by name or email..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className="max-w-sm mt-2"
          aria-label="Search job seekers"
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading
            job seekers...
          </div>
        ) : paginatedJobSeekers.length === 0 ? (
          <p className="text-muted-foreground">No job seekers found.</p>
        ) : (
          <>
            <Table>
              <TableCaption>A list of all job seeker users.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => requestSort('name')}
                    className="cursor-pointer"
                  >
                    Name {renderSortIcon('name')}
                  </TableHead>
                  <TableHead
                    onClick={() => requestSort('email')}
                    className="cursor-pointer"
                  >
                    Email {renderSortIcon('email')}
                  </TableHead>
                  <TableHead
                    onClick={() => requestSort('status')}
                    className="cursor-pointer"
                  >
                    Status {renderSortIcon('status')}
                  </TableHead>
                  <TableHead>Profile Searchable</TableHead>
                  <TableHead>Jobs Applied</TableHead>
                  <TableHead
                    onClick={() => requestSort('lastActive')}
                    className="cursor-pointer"
                  >
                    Last Active {renderSortIcon('lastActive')}
                  </TableHead>
                  <TableHead
                    onClick={() => requestSort('createdAt')}
                    className="cursor-pointer"
                  >
                    Joined {renderSortIcon('createdAt')}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedJobSeekers.map((u) => {
                  const isUserEffectivelyActive =
                    u.status === 'active' || u.status === undefined;
                  return (
                    <TableRow key={u.uid}>
                      <TableCell className="font-medium">
                        {u.name || 'N/A'}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            isUserEffectivelyActive
                              ? 'default'
                              : u.status === 'deleted' ||
                                  u.status === 'suspended'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className={
                            isUserEffectivelyActive
                              ? 'bg-green-100 text-green-800'
                              : u.status === 'deleted' ||
                                  u.status === 'suspended'
                                ? 'bg-red-100 text-red-800'
                                : ''
                          }
                        >
                          {(u.status || 'ACTIVE').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.isProfileSearchable ? (
                          <CheckCircle2 className="text-green-500 h-5 w-5" />
                        ) : (
                          <XCircle className="text-red-500 h-5 w-5" />
                        )}
                      </TableCell>
                      <TableCell>{u.jobsAppliedCount ?? 'N/A'}</TableCell>
                      <TableCell>
                        {u.lastActive
                          ? new Date(u.lastActive as string).toLocaleString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {u.createdAt
                          ? new Date(u.createdAt as string).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/employer/candidates/${u.uid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                        </Button>
                        {u.status === 'deleted' ? (
                          canPerformUserActions && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                showConfirmationModal(
                                  `Re-Activate User "${u.name || u.email}"?`,
                                  `Are you sure you want to re-activate this previously deleted user account? Their status will be set to 'active'.`,
                                  async () =>
                                    handleUserStatusUpdate(u.uid, 'active'),
                                  'Re-Activate User'
                                )
                              }
                              disabled={
                                specificActionLoading === `user-${u.uid}`
                              }
                              className="text-green-600"
                            >
                              <CheckSquare className="h-5 w-5" />
                            </Button>
                          )
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newStatus = isUserEffectivelyActive
                                  ? 'suspended'
                                  : 'active';
                                showConfirmationModal(
                                  `${newStatus === 'active' ? 'Activate' : 'Suspend'} User "${u.name || u.email}"?`,
                                  `Are you sure you want to ${newStatus} this user account?`,
                                  async () =>
                                    handleUserStatusUpdate(u.uid, newStatus),
                                  `${newStatus === 'active' ? 'Activate' : 'Suspend'} User`,
                                  newStatus === 'suspended'
                                    ? 'destructive'
                                    : 'default'
                                );
                              }}
                              disabled={
                                specificActionLoading === `user-${u.uid}` ||
                                !canPerformUserActions
                              }
                              className={
                                isUserEffectivelyActive
                                  ? 'text-orange-600'
                                  : 'text-blue-600'
                              }
                            >
                              {isUserEffectivelyActive ? (
                                <Ban className="h-5 w-5" />
                              ) : (
                                <CheckSquare className="h-5 w-5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                showConfirmationModal(
                                  `Delete User "${u.name || u.email}"?`,
                                  'Are you sure you want to delete this user account? They will not be able to log in. This action can be undone by re-activating.',
                                  async () =>
                                    handleUserStatusUpdate(u.uid, 'deleted'),
                                  'Delete User',
                                  'destructive'
                                )
                              }
                              disabled={
                                specificActionLoading === `user-${u.uid}` ||
                                !canPerformUserActions
                              }
                              className="text-destructive"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center items-center gap-2">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
