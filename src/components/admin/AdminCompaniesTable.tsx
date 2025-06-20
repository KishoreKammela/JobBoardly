import React, { useState, useMemo } from 'react';
import type { Company } from '@/types';
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
  ExternalLink,
  Ban,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Trash2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';
import { Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ITEMS_PER_PAGE = 10;
type SortDirection = 'asc' | 'desc';
interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
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

interface AdminCompaniesTableProps {
  companies: Company[];
  isLoading: boolean;
  showConfirmationModal: (
    title: string,
    description: React.ReactNode,
    action: () => Promise<void>,
    confirmText?: string,
    confirmVariant?: 'default' | 'destructive'
  ) => void;
  handleCompanyStatusUpdate: (
    companyId: string,
    newStatus: 'approved' | 'rejected' | 'suspended' | 'active' | 'deleted',
    reason?: string
  ) => Promise<void>;
  specificActionLoading: string | null;
  canModerateContent: boolean;
}

const AdminCompaniesTable: React.FC<AdminCompaniesTableProps> = ({
  companies,
  isLoading,
  showConfirmationModal,
  handleCompanyStatusUpdate,
  specificActionLoading,
  canModerateContent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig<Company>>({
    key: 'createdAt',
    direction: 'desc',
  });

  const requestSort = (key: keyof Company) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const sortedAndFilteredCompanies = useMemo(() => {
    let sortableItems = [...companies];
    if (debouncedSearchTerm) {
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
      sortableItems = sortableItems.filter(
        (company) =>
          company.name.toLowerCase().includes(lowerSearchTerm) ||
          (company.websiteUrl &&
            company.websiteUrl.toLowerCase().includes(lowerSearchTerm))
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
  }, [companies, sortConfig, debouncedSearchTerm]);

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredCompanies.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [sortedAndFilteredCompanies, currentPage]);

  const totalPages = Math.ceil(
    sortedAndFilteredCompanies.length / ITEMS_PER_PAGE
  );

  const renderSortIcon = (key: keyof Company) => {
    if (sortConfig.key !== key)
      return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'asc' ? '🔼' : '🔽';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Manage Companies ({sortedAndFilteredCompanies.length})
        </CardTitle>
        <Input
          placeholder="Search companies by name or website..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className="max-w-sm mt-2"
          aria-label="Search companies"
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading
            companies...
          </div>
        ) : paginatedCompanies.length === 0 ? (
          <p className="text-muted-foreground">No companies found.</p>
        ) : (
          <>
            <Table>
              <TableCaption>A list of all companies.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => requestSort('name')}
                    className="cursor-pointer"
                  >
                    Name {renderSortIcon('name')}
                  </TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead
                    onClick={() => requestSort('status')}
                    className="cursor-pointer"
                  >
                    Status {renderSortIcon('status')}
                  </TableHead>
                  <TableHead>Jobs Posted</TableHead>
                  <TableHead>Apps Received</TableHead>
                  <TableHead
                    onClick={() => requestSort('createdAt')}
                    className="cursor-pointer"
                  >
                    Created At {renderSortIcon('createdAt')}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCompanies.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <a
                        href={
                          c.websiteUrl?.startsWith('http')
                            ? c.websiteUrl
                            : `https://${c.websiteUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {c.websiteUrl || 'N/A'}{' '}
                        {c.websiteUrl && <ExternalLink className="h-3 w-3" />}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          c.status === 'approved' || c.status === 'active'
                            ? 'default'
                            : c.status === 'rejected' ||
                                c.status === 'suspended' ||
                                c.status === 'deleted'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {c.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.jobCount ?? 'N/A'}</TableCell>
                    <TableCell>{c.applicationCount ?? 'N/A'}</TableCell>
                    <TableCell>
                      {c.createdAt
                        ? new Date(c.createdAt as string).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/companies/${c.id}`} target="_blank">
                          <Eye className="h-5 w-5" />
                        </Link>
                      </Button>
                      {canModerateContent && c.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              showConfirmationModal(
                                `Approve Company "${c.name}"?`,
                                `Are you sure you want to approve ${c.name}? The company will become active.`,
                                async () =>
                                  handleCompanyStatusUpdate(c.id, 'approved'),
                                'Approve Company'
                              )
                            }
                            disabled={
                              specificActionLoading === `company-${c.id}`
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
                                `Reject Company "${c.name}"?`,
                                `Are you sure you want to reject ${c.name}?`,
                                async () =>
                                  handleCompanyStatusUpdate(c.id, 'rejected'),
                                'Reject Company',
                                'destructive'
                              )
                            }
                            disabled={
                              specificActionLoading === `company-${c.id}`
                            }
                            className="text-destructive"
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </>
                      )}
                      {canModerateContent &&
                        (c.status === 'approved' || c.status === 'active') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              showConfirmationModal(
                                `Suspend Company "${c.name}"?`,
                                `Are you sure you want to suspend ${c.name}? Recruiters from this company will have limited access.`,
                                async () =>
                                  handleCompanyStatusUpdate(c.id, 'suspended'),
                                'Suspend Company',
                                'destructive'
                              )
                            }
                            disabled={
                              specificActionLoading === `company-${c.id}`
                            }
                            className="text-orange-600"
                          >
                            <Ban className="h-5 w-5" />
                          </Button>
                        )}
                      {canModerateContent &&
                        (c.status === 'suspended' ||
                          c.status === 'rejected') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              showConfirmationModal(
                                `Activate Company "${c.name}"?`,
                                `Are you sure you want to reactivate ${c.name}? This will restore full access for its recruiters.`,
                                async () =>
                                  handleCompanyStatusUpdate(c.id, 'active'),
                                'Activate Company'
                              )
                            }
                            disabled={
                              specificActionLoading === `company-${c.id}`
                            }
                            className="text-blue-600"
                          >
                            <CheckSquare className="h-5 w-5" />
                          </Button>
                        )}
                      {canModerateContent && c.status === 'deleted' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            showConfirmationModal(
                              `Re-Activate Company "${c.name}"?`,
                              `Are you sure you want to re-activate this previously deleted company? It will be set to 'active'.`,
                              async () =>
                                handleCompanyStatusUpdate(c.id, 'active'),
                              'Re-Activate Company'
                            )
                          }
                          disabled={specificActionLoading === `company-${c.id}`}
                          className="text-green-600"
                        >
                          <CheckSquare className="h-5 w-5" />
                        </Button>
                      )}
                      {canModerateContent && c.status !== 'deleted' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            showConfirmationModal(
                              `Delete Company "${c.name}"?`,
                              `Are you sure you want to delete ${c.name}? This is a soft delete. Recruiters will lose access. This action can be undone by re-activating.`,
                              async () =>
                                handleCompanyStatusUpdate(c.id, 'deleted'),
                              'Delete Company',
                              'destructive'
                            )
                          }
                          disabled={specificActionLoading === `company-${c.id}`}
                          className="text-destructive"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
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

export default AdminCompaniesTable;
