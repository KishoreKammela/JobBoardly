import React, { useState, useMemo } from 'react';
import type { Job, UserRole } from '@/types';
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
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';
import { Timestamp } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const ITEMS_PER_PAGE = 10;
type SortDirection = 'asc' | 'desc';

interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

interface JobWithApplicantCount extends Job {
  applicantCount: number;
}

function getSortableValue<T>(
  item: T,
  key: keyof T | null
): string | number | null | boolean | undefined {
  if (!key) return null;
  const value = item[key as keyof T];
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  return value as string | number | null | boolean | undefined;
}

interface AdminJobsTableProps {
  jobs: JobWithApplicantCount[];
  isLoading: boolean;
  currentUserRole?: UserRole;
  showConfirmationModal: (
    title: string,
    description: React.ReactNode,
    action: () => Promise<void>,
    confirmText?: string,
    confirmVariant?: 'default' | 'destructive'
  ) => void;
  handleJobStatusUpdate: (
    jobId: string,
    newStatus: 'approved' | 'rejected' | 'suspended',
    reason?: string
  ) => Promise<void>;
  specificActionLoading: string | null;
  canModerateContent: boolean;
}

const AdminJobsTable: React.FC<AdminJobsTableProps> = ({
  jobs,
  isLoading,
  currentUserRole,
  showConfirmationModal,
  handleJobStatusUpdate,
  specificActionLoading,
  canModerateContent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<
    SortConfig<JobWithApplicantCount>
  >({
    key: 'createdAt',
    direction: 'desc',
  });

  const requestSort = (key: keyof JobWithApplicantCount) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const sortedAndFilteredJobs = useMemo(() => {
    let sortableItems = [...jobs];
    if (debouncedSearchTerm) {
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
      sortableItems = sortableItems.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerSearchTerm) ||
          job.company.toLowerCase().includes(lowerSearchTerm)
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
  }, [jobs, sortConfig, debouncedSearchTerm]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedAndFilteredJobs, currentPage]);

  const totalPages = Math.ceil(sortedAndFilteredJobs.length / ITEMS_PER_PAGE);

  const renderSortIcon = (key: keyof JobWithApplicantCount) => {
    if (sortConfig.key !== key)
      return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'asc' ? '🔼' : '🔽';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage All Jobs ({sortedAndFilteredJobs.length})</CardTitle>
        <CardDescription>
          Manage job status (approve, reject, suspend, activate). Job content
          editing is handled by employers.
        </CardDescription>
        <Input
          placeholder="Search jobs by title or company..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className="max-w-sm mt-2"
          aria-label="Search all jobs"
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading
            jobs...
          </div>
        ) : paginatedJobs.length === 0 ? (
          <p className="text-muted-foreground">No jobs found.</p>
        ) : (
          <>
            <Table>
              <TableCaption>A list of all jobs.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => requestSort('title')}
                    className="cursor-pointer"
                  >
                    Job Title {renderSortIcon('title')}
                  </TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead
                    onClick={() => requestSort('status')}
                    className="cursor-pointer"
                  >
                    Status {renderSortIcon('status')}
                  </TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead
                    onClick={() => requestSort('createdAt')}
                    className="cursor-pointer"
                  >
                    Created At {renderSortIcon('createdAt')}
                  </TableHead>
                  <TableHead
                    onClick={() => requestSort('updatedAt')}
                    className="cursor-pointer"
                  >
                    Updated At {renderSortIcon('updatedAt')}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.status === 'approved'
                            ? 'default'
                            : job.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {job.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.applicantCount}</TableCell>
                    <TableCell>
                      {job.createdAt
                        ? new Date(job.createdAt as string).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {job.updatedAt
                        ? new Date(job.updatedAt as string).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/jobs/${job.id}`} target="_blank">
                          <Eye className="h-5 w-5" />
                        </Link>
                      </Button>
                      {canModerateContent && job.status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            showConfirmationModal(
                              `Suspend Job "${job.title}"?`,
                              `Are you sure you want to suspend this job? It will be hidden from public view and recruiters won't be able to manage it or its applicants.`,
                              async () =>
                                handleJobStatusUpdate(job.id, 'suspended'),
                              'Suspend Job',
                              'destructive'
                            )
                          }
                          disabled={
                            specificActionLoading === `job-${job.id}` ||
                            currentUserRole === 'moderator' ||
                            currentUserRole === 'supportAgent' ||
                            currentUserRole === 'dataAnalyst'
                          }
                          className="text-orange-600"
                        >
                          <Ban className="h-5 w-5" />
                        </Button>
                      )}
                      {canModerateContent &&
                        (job.status === 'suspended' ||
                          job.status === 'rejected') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              showConfirmationModal(
                                `Activate Job "${job.title}"?`,
                                `Are you sure you want to activate this job? It will become approved and publicly visible.`,
                                async () =>
                                  handleJobStatusUpdate(job.id, 'approved'),
                                'Activate Job'
                              )
                            }
                            disabled={
                              specificActionLoading === `job-${job.id}` ||
                              currentUserRole === 'supportAgent' ||
                              currentUserRole === 'dataAnalyst'
                            }
                            className="text-blue-600"
                          >
                            <CheckSquare className="h-5 w-5" />
                          </Button>
                        )}
                      {canModerateContent && job.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              showConfirmationModal(
                                `Approve Job "${job.title}"?`,
                                `Are you sure you want to approve this job posting? It will become publicly visible.`,
                                async () =>
                                  handleJobStatusUpdate(job.id, 'approved'),
                                'Approve Job'
                              )
                            }
                            disabled={
                              specificActionLoading === `job-${job.id}` ||
                              currentUserRole === 'supportAgent' ||
                              currentUserRole === 'dataAnalyst'
                            }
                            className="text-green-600"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              showConfirmationModal(
                                `Reject Job "${job.title}"?`,
                                'Are you sure you want to reject this job posting? It will not be visible to job seekers.',
                                async () =>
                                  handleJobStatusUpdate(job.id, 'rejected'),
                                'Reject Job',
                                'destructive'
                              )
                            }
                            disabled={
                              specificActionLoading === `job-${job.id}` ||
                              currentUserRole === 'supportAgent' ||
                              currentUserRole === 'dataAnalyst'
                            }
                            className="text-destructive"
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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

export default AdminJobsTable;
