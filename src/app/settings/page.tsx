'use client';
import { SettingsForm } from '@/components/SettingsForm';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Filters } from '@/types';
import { useToast } from '@/hooks/use-toast';
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

interface ModalState {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  onConfirmAction: (() => Promise<void>) | null;
  confirmText: string;
  confirmVariant: 'default' | 'destructive';
}

const defaultModalState: ModalState = {
  isOpen: false,
  title: '',
  description: '',
  onConfirmAction: null,
  confirmText: 'Confirm',
  confirmVariant: 'default',
};

export default function SettingsPage() {
  const { user, loading, deleteSearch } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [modalState, setModalState] = useState<ModalState>(defaultModalState);
  const [isModalActionLoading, setIsModalActionLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  const showConfirmationModal = (
    title: string,
    description: React.ReactNode,
    action: () => Promise<void>,
    confirmText = 'Confirm',
    confirmVariant: 'default' | 'destructive' = 'default'
  ) => {
    setModalState({
      isOpen: true,
      title,
      description,
      onConfirmAction: action,
      confirmText,
      confirmVariant,
    });
  };

  const executeConfirmedAction = async () => {
    if (modalState.onConfirmAction) {
      setIsModalActionLoading(true);
      try {
        await modalState.onConfirmAction();
      } catch (e: unknown) {
        console.error('Error executing confirmed action:', e);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } finally {
        setIsModalActionLoading(false);
        setModalState(defaultModalState);
      }
    }
  };

  const performDeleteSearch = async (searchId: string) => {
    if (!user || user.role !== 'jobSeeker') return;
    try {
      await deleteSearch(searchId);
      toast({
        title: 'Search Deleted',
        description: 'The saved search has been removed.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Could not delete the search. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSearch = (searchId: string, searchName: string) => {
    if (user?.status === 'suspended') {
      toast({
        title: 'Account Suspended',
        description:
          'You cannot delete saved searches while your account is suspended.',
        variant: 'destructive',
      });
      return;
    }
    showConfirmationModal(
      `Delete Saved Search "${searchName}"?`,
      'Are you sure you want to delete this saved search? This action cannot be undone.',
      () => performDeleteSearch(searchId),
      'Delete Search',
      'destructive'
    );
  };

  const handleApplySavedSearch = (filters: Filters) => {
    if (user?.status === 'suspended') {
      toast({
        title: 'Account Suspended',
        description:
          'You cannot apply saved searches while your account is suspended.',
        variant: 'destructive',
      });
      return;
    }
    const queryParams = new URLSearchParams();
    if (filters.searchTerm) queryParams.set('q', filters.searchTerm);
    if (filters.location) queryParams.set('loc', filters.location);
    if (filters.roleType && filters.roleType !== 'all')
      queryParams.set('type', filters.roleType);
    if (filters.isRemote) queryParams.set('remote', 'true');
    if (filters.recentActivity && filters.recentActivity !== 'any')
      queryParams.set('activity', filters.recentActivity);
    router.push(`/jobs?${queryParams.toString()}`);
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences, saved searches, and notification
          settings.
        </p>
      </div>
      <Separator />
      <SettingsForm />

      {user.role === 'jobSeeker' && (
        <>
          <Separator />
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline">
                My Saved Searches
              </CardTitle>
              <CardDescription>
                Manage your saved job searches. Click a search to re-apply its
                filters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.savedSearches && user.savedSearches.length > 0 ? (
                <ul className="space-y-3">
                  {user.savedSearches.map((search) => (
                    <li
                      key={search.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-muted/20 hover:bg-muted/30 transition-colors group"
                    >
                      <div>
                        <button
                          onClick={() => handleApplySavedSearch(search.filters)}
                          className="font-medium text-primary hover:underline text-left"
                          title="Apply this search"
                          disabled={user.status === 'suspended'}
                        >
                          {search.name}
                        </button>
                        <p className="text-xs text-muted-foreground">
                          Keywords: {search.filters.searchTerm || 'Any'} |
                          Location: {search.filters.location || 'Any'} | Type:{' '}
                          {search.filters.roleType === 'all'
                            ? 'Any'
                            : search.filters.roleType}{' '}
                          | Remote: {search.filters.isRemote ? 'Yes' : 'No'}|
                          Activity: {search.filters.recentActivity || 'Any'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Saved:{' '}
                          {new Date(
                            search.createdAt as string
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDeleteSearch(search.id, search.name)
                        }
                        className="text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                        aria-label={`Delete saved search ${search.name}`}
                        disabled={user.status === 'suspended'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You have no saved searches yet. You can save a search from the
                  jobs page filter sidebar.
                </p>
              )}
            </CardContent>
            {user.savedSearches && user.savedSearches.length > 0 && (
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Click on a search name to apply it to the job listings page.
                </p>
              </CardFooter>
            )}
          </Card>
        </>
      )}
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
            <AlertDialogCancel
              onClick={() => setModalState({ ...modalState, isOpen: false })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeConfirmedAction}
              disabled={isModalActionLoading}
              className={
                modalState.confirmVariant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {isModalActionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {modalState.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
