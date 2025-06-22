'use client';
import { useState, useEffect, type FormEvent } from 'react';
import type { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

const SEARCH_HISTORY_STORAGE_KEY = 'jobboardly-search-history';

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

export function SettingsForm() {
  const { user, updateUserProfile, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<Partial<UserProfile>>({
    theme: 'system',
    jobBoardDisplay: 'list',
    itemsPerPage: 10,
    jobAlerts: {
      newJobsMatchingProfile: true,
      savedSearchAlerts: false,
      applicationStatusUpdates: true,
    },
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [modalState, setModalState] = useState<ModalState>(defaultModalState);
  const [isModalActionLoading, setIsModalActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSettings({
        theme: user.theme || 'system',
        jobBoardDisplay: user.jobBoardDisplay || 'list',
        itemsPerPage: user.itemsPerPage || 10,
        jobAlerts: user.jobAlerts || {
          newJobsMatchingProfile: true,
          savedSearchAlerts: false,
          applicationStatusUpdates: true,
        },
      });
    }
    const storedSearchHistory = localStorage.getItem(
      SEARCH_HISTORY_STORAGE_KEY
    );
    if (storedSearchHistory) {
      setSearchHistory(JSON.parse(storedSearchHistory));
    }
  }, [user]);

  const handleSwitchChange = (
    name: keyof NonNullable<UserProfile['jobAlerts']>,
    checked: boolean
  ) => {
    if (user?.status === 'suspended' && user.role === 'jobSeeker') {
      toast({
        title: 'Account Suspended',
        description: 'Settings cannot be changed while account is suspended.',
        variant: 'destructive',
      });
      return;
    }
    setSettings((prev) => ({
      ...prev,
      jobAlerts: { ...(prev.jobAlerts || {}), [name]: checked },
    }));
  };

  const handleRadioChange = (
    name: 'theme' | 'jobBoardDisplay',
    value: string
  ) => {
    if (
      user?.status === 'suspended' &&
      user.role === 'jobSeeker' &&
      name !== 'theme'
    ) {
      // Allow theme change
      toast({
        title: 'Account Suspended',
        description: 'Settings cannot be changed while account is suspended.',
        variant: 'destructive',
      });
      return;
    }
    setSettings((prev) => ({ ...prev, [name]: value }));
    if (name === 'theme' && user) {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      if (value === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(value);
      }
    }
  };

  const handleSelectChange = (name: 'itemsPerPage', value: string) => {
    if (user?.status === 'suspended' && user.role === 'jobSeeker') {
      toast({
        title: 'Account Suspended',
        description: 'Settings cannot be changed while account is suspended.',
        variant: 'destructive',
      });
      return;
    }
    setSettings((prev) => ({
      ...prev,
      [name]: parseInt(value, 10) as UserProfile['itemsPerPage'],
    }));
  };

  const handleClearSearchHistory = () => {
    if (user?.status === 'suspended' && user.role === 'jobSeeker') {
      toast({
        title: 'Account Suspended',
        description:
          'Search history cannot be cleared while account is suspended.',
        variant: 'destructive',
      });
      return;
    }
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    toast({
      title: 'Search History Cleared',
      description: 'Your job search history has been cleared from this device.',
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save settings.',
        variant: 'destructive',
      });
      return;
    }
    if (user.status === 'suspended' && user.role === 'jobSeeker') {
      toast({
        title: 'Account Suspended',
        description: 'Settings cannot be saved while account is suspended.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const profileUpdates: Partial<UserProfile> = {
        theme: settings.theme,
        jobBoardDisplay: settings.jobBoardDisplay,
        itemsPerPage: settings.itemsPerPage,
        jobAlerts: settings.jobAlerts,
      };
      await updateUserProfile(profileUpdates);
      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Could not save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const showConfirmationModal = (
  //   title: string,
  //   description: React.ReactNode,
  //   action: () => Promise<void>,
  //   confirmText = 'Confirm',
  //   confirmVariant: 'default' | 'destructive' = 'default'
  // ) => {
  //   setModalState({
  //     isOpen: true,
  //     title,
  //     description,
  //     onConfirmAction: action,
  //     confirmText,
  //     confirmVariant,
  //   });
  // };

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

  // const performDeleteSearch = async (searchId: string) => {
  //   if (!user || user.role !== 'jobSeeker') return;
  //   if (user.status === 'suspended') {
  //     toast({
  //       title: 'Account Suspended',
  //       description: 'Cannot delete searches while account is suspended.',
  //       variant: 'destructive',
  //     });
  //     return;
  //   }
  //   try {
  //     await deleteSearch(searchId);
  //     toast({
  //       title: 'Search Deleted',
  //       description: 'The saved search has been removed.',
  //     });
  //   } catch (error: unknown) {
  //     toast({
  //       title: 'Error',
  //       description: 'Could not delete the search. Please try again.',
  //       variant: 'destructive',
  //     });
  //   }
  // };

  // const handleDeleteSearch = (searchId: string, searchName: string) => {
  //   if (user?.status === 'suspended' && user.role === 'jobSeeker') {
  //     toast({
  //       title: 'Account Suspended',
  //       description: 'Cannot delete searches while account is suspended.',
  //       variant: 'destructive',
  //     });
  //     return;
  //   }
  //   showConfirmationModal(
  //     `Delete Saved Search "${searchName}"?`,
  //     'Are you sure you want to delete this saved search? This action cannot be undone.',
  //     () => performDeleteSearch(searchId),
  //     'Delete Search',
  //     'destructive'
  //   );
  // };

  if (authLoading || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Settings...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const isJobSeekerSuspended =
    user.role === 'jobSeeker' && user.status === 'suspended';

  return (
    <>
      {isJobSeekerSuspended && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Account Suspended</AlertTitle>
          <AlertDescription>
            Your account is currently suspended. Most settings cannot be
            changed. Theme preference can still be updated.
          </AlertDescription>
        </Alert>
      )}
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">
            Account Settings
          </CardTitle>
          <CardDescription>
            Customize your JobBoardly experience and notification preferences.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            <section>
              <h3 className="text-lg font-semibold mb-3">Appearance</h3>
              <div>
                <Label className="mb-2 block">Theme</Label>
                <RadioGroup
                  value={settings.theme || 'system'}
                  onValueChange={(value) => handleRadioChange('theme', value)}
                  className="flex gap-4"
                  disabled={false} // Theme can always be changed
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="light"
                      id="theme-light"
                      aria-label="Light theme"
                    />
                    <Label htmlFor="theme-light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="dark"
                      id="theme-dark"
                      aria-label="Dark theme"
                    />
                    <Label htmlFor="theme-dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="system"
                      id="theme-system"
                      aria-label="System theme"
                    />
                    <Label htmlFor="theme-system">System</Label>
                  </div>
                </RadioGroup>
              </div>
            </section>

            {user.role === 'jobSeeker' && (
              <section>
                <h3 className="text-lg font-semibold mb-3">
                  Job Board Display
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Default View Mode</Label>
                    <RadioGroup
                      value={settings.jobBoardDisplay || 'list'}
                      onValueChange={(value) =>
                        handleRadioChange('jobBoardDisplay', value)
                      }
                      className="flex gap-4"
                      disabled={isJobSeekerSuspended}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="list"
                          id="view-list"
                          aria-label="List view for job board"
                          disabled={isJobSeekerSuspended}
                        />
                        <Label htmlFor="view-list">List View</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="grid"
                          id="view-grid"
                          aria-label="Grid view for job board"
                          disabled={isJobSeekerSuspended}
                        />
                        <Label htmlFor="view-grid">Grid View</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="itemsPerPage" className="mb-2 block">
                      Jobs Per Page
                    </Label>
                    <Select
                      value={String(settings.itemsPerPage || 10)}
                      onValueChange={(value) =>
                        handleSelectChange('itemsPerPage', value)
                      }
                      disabled={isJobSeekerSuspended}
                    >
                      <SelectTrigger
                        id="itemsPerPage"
                        className="w-[180px]"
                        disabled={isJobSeekerSuspended}
                      >
                        <SelectValue placeholder="Select count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 items</SelectItem>
                        <SelectItem value="20">20 items</SelectItem>
                        <SelectItem value="50">50 items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>
            )}

            <section>
              <h3 className="text-lg font-semibold mb-3">
                Notification Preferences
              </h3>
              <div className="space-y-3">
                {(
                  Object.keys(settings.jobAlerts || {}) as Array<
                    keyof NonNullable<UserProfile['jobAlerts']>
                  >
                ).map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 border rounded-md bg-muted/20"
                  >
                    <Label htmlFor={key} className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()} Alerts
                    </Label>
                    <Switch
                      id={key}
                      checked={settings.jobAlerts?.[key] || false}
                      onCheckedChange={(checked) =>
                        handleSwitchChange(key, checked)
                      }
                      disabled={
                        isJobSeekerSuspended && user.role === 'jobSeeker'
                      }
                      aria-label={`${key.replace(/([A-Z])/g, ' $1').trim()} Alerts Toggle`}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-1">
                Search History (Device Specific)
              </h3>
              {searchHistory.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 max-h-40 overflow-y-auto bg-muted/20 p-3 rounded-md">
                  {searchHistory.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No search history on this device yet.
                </p>
              )}
              {searchHistory.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearSearchHistory}
                  className="mt-3"
                  disabled={isJobSeekerSuspended && user.role === 'jobSeeker'}
                  aria-label="Clear job search history"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear Search History
                </Button>
              )}
            </section>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={
                isLoading ||
                authLoading ||
                (isJobSeekerSuspended && user.role === 'jobSeeker')
              }
            >
              {(isLoading || authLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Settings
            </Button>
          </CardFooter>
        </form>
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
    </>
  );
}
