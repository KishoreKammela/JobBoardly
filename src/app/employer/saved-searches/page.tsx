'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { useEmployerActions } from '@/contexts/EmployerActionsContext/EmployerActionsContext';
import { useRouter, usePathname } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
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
import {
  Loader2,
  Bookmark,
  Trash2,
  Play,
  AlertTriangle,
  FilePlus,
} from 'lucide-react';
import type { CandidateFilters, SavedCandidateSearch } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ModalState {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  onConfirmAction: (() => Promise<void>) | null;
  confirmText: string;
}

const defaultModalState: ModalState = {
  isOpen: false,
  title: '',
  description: '',
  onConfirmAction: null,
  confirmText: 'Confirm',
};

function formatFilters(filters: CandidateFilters): string {
  const parts: string[] = [];
  if (filters.searchTerm) parts.push(`Keywords: "${filters.searchTerm}"`);
  if (filters.location) parts.push(`Location: "${filters.location}"`);
  if (filters.noticePeriod && filters.noticePeriod !== 'all')
    parts.push(`Notice: ${filters.noticePeriod}`);
  if (filters.minExperienceYears)
    parts.push(`Min Exp: ${filters.minExperienceYears} yrs`);
  return parts.join(' | ') || 'No filters';
}

export default function SavedCandidateSearchesPage() {
  const { user, company, loading, isLoggingOut } = useAuth();
  const { deleteCandidateSearch } = useEmployerActions();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [modalState, setModalState] = useState<ModalState>(defaultModalState);
  const [isModalActionLoading, setIsModalActionLoading] = useState(false);

  const savedSearches = useMemo(() => {
    if (!user?.savedCandidateSearches) return [];
    // Sort by most recently created
    return [...user.savedCandidateSearches].sort(
      (a, b) =>
        new Date(b.createdAt as string).getTime() -
        new Date(a.createdAt as string).getTime()
    );
  }, [user?.savedCandidateSearches]);

  useEffect(() => {
    if (loading || isLoggingOut) return;
    if (!user) {
      toast({
        title: 'Authentication Required',
        description:
          'Please log in as an employer to view your saved searches.',
        variant: 'destructive',
      });
      router.replace(
        `/employer/login?redirect=${encodeURIComponent(pathname)}`
      );
    } else if (user.role !== 'employer') {
      toast({
        title: 'Access Denied',
        description: 'This page is for employers only.',
        variant: 'destructive',
      });
      router.replace('/');
    }
  }, [user, loading, router, pathname, toast, isLoggingOut]);

  const showConfirmationModal = (
    title: string,
    description: React.ReactNode,
    action: () => Promise<void>,
    confirmText = 'Confirm'
  ) => {
    setModalState({
      isOpen: true,
      title,
      description,
      onConfirmAction: action,
      confirmText,
    });
  };

  const executeConfirmedAction = async () => {
    if (modalState.onConfirmAction) {
      setIsModalActionLoading(true);
      try {
        await modalState.onConfirmAction();
        toast({
          title: 'Success',
          description: 'The saved search has been deleted.',
        });
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Could not delete the search. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsModalActionLoading(false);
        setModalState(defaultModalState);
      }
    }
  };

  const handleDelete = (search: SavedCandidateSearch) => {
    if (company?.status === 'suspended' || company?.status === 'deleted') {
      toast({
        title: 'Company Account Restricted',
        description:
          'You cannot delete searches while your company account is restricted.',
        variant: 'destructive',
      });
      return;
    }
    showConfirmationModal(
      `Delete "${search.name}"?`,
      'Are you sure you want to permanently delete this saved search? This action cannot be undone.',
      () => deleteCandidateSearch(search.id),
      'Delete Search'
    );
  };

  const handleApply = (filters: CandidateFilters) => {
    if (company?.status === 'suspended' || company?.status === 'deleted') {
      toast({
        title: 'Company Account Restricted',
        description:
          'You cannot apply searches while your company account is restricted.',
        variant: 'destructive',
      });
      return;
    }
    const queryParams = new URLSearchParams();
    if (filters.searchTerm) queryParams.set('q', filters.searchTerm);
    if (filters.location) queryParams.set('loc', filters.location);
    if (filters.noticePeriod && filters.noticePeriod !== 'all')
      queryParams.set('notice', filters.noticePeriod);
    if (filters.jobSearchStatus && filters.jobSearchStatus !== 'all')
      queryParams.set('status', filters.jobSearchStatus);
    if (filters.desiredSalaryMin)
      queryParams.set('minSal', filters.desiredSalaryMin.toString());
    if (filters.desiredSalaryMax)
      queryParams.set('maxSal', filters.desiredSalaryMax.toString());
    if (filters.recentActivity && filters.recentActivity !== 'any')
      queryParams.set('activity', filters.recentActivity);
    if (filters.minExperienceYears)
      queryParams.set('minExp', filters.minExperienceYears.toString());

    router.push(`/employer/find-candidates?${queryParams.toString()}`);
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (company?.status === 'suspended' || company?.status === 'deleted') {
    return (
      <div className="container mx-auto py-10 max-w-2xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Company Account Restricted</AlertTitle>
          <AlertDescription>
            Your company account is currently {company.status}. You cannot
            manage saved searches.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <Bookmark />
                Manage Saved Candidate Searches
              </CardTitle>
              <CardDescription>
                Quickly apply, rename, or delete your saved search criteria.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/employer/find-candidates">
                <FilePlus className="mr-2 h-4 w-4" /> New Search
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {savedSearches.length > 0 ? (
            <Table>
              <TableCaption>
                A list of your saved candidate searches.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Search Name</TableHead>
                  <TableHead className="w-[45%] hidden md:table-cell">
                    Filters Summary
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedSearches.map((search) => (
                  <TableRow key={search.id}>
                    <TableCell className="font-medium">{search.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs hidden md:table-cell">
                      {formatFilters(search.filters)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(
                        search.createdAt as string
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApply(search.filters)}
                      >
                        <Play className="mr-2 h-4 w-4" /> Apply
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(search)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-semibold">No Saved Searches Yet</h3>
              <p className="text-muted-foreground mt-1">
                Perform a search on the &quot;Find Candidates&quot; page and
                save it for later.
              </p>
              <Button asChild className="mt-4">
                <Link href="/employer/find-candidates">Find Candidates</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog
        open={modalState.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setModalState(defaultModalState);
            setIsModalActionLoading(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{modalState.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {modalState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeConfirmedAction}
              disabled={isModalActionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isModalActionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {modalState.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
