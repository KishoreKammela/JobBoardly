'use client';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, CheckCircle, XCircle } from 'lucide-react';
import type { FirebaseError } from 'firebase/app';
import { checkPasswordStrength, type PasswordStrength } from '@/lib/utils';
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
}

const defaultModalState: ModalState = {
  isOpen: false,
  title: '',
  description: '',
  onConfirmAction: null,
  confirmText: 'Confirm',
};

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(
    checkPasswordStrength('')
  );
  const [modalState, setModalState] = useState<ModalState>(defaultModalState);
  const [isModalActionLoading, setIsModalActionLoading] = useState(false);

  const { changeUserPassword } = useAuth();
  const { toast } = useToast();

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pass = e.target.value;
    setNewPassword(pass);
    setPasswordStrength(checkPasswordStrength(pass));
  };

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
      } catch (e: unknown) {
        // Errors are handled within performPasswordChange
      } finally {
        setIsModalActionLoading(false);
        setModalState(defaultModalState);
      }
    }
  };

  const performPasswordChange = async () => {
    setIsLoading(true); // Set this for the main form submission state
    try {
      await changeUserPassword(currentPassword, newPassword);
      toast({
        title: 'Password Changed Successfully',
        description: 'Your password has been updated.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordStrength(checkPasswordStrength(''));
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      let message = 'Failed to change password. Please try again.';
      if (firebaseError.code === 'auth/wrong-password') {
        message = 'Incorrect current password.';
      } else if (firebaseError.code === 'auth/weak-password') {
        message = 'The new password is too weak.';
      } else if (firebaseError.code === 'auth/requires-recent-login') {
        message =
          'This operation is sensitive and requires recent authentication. Please log out and log back in, then try again.';
      }
      console.error('Change password error:', firebaseError);
      toast({
        title: 'Password Change Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!passwordStrength.isValid) {
      toast({
        title: 'Weak Password',
        description: `Please ensure your new password meets all criteria: ${passwordStrength.issues.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'The new password and confirmation password do not match.',
        variant: 'destructive',
      });
      return;
    }

    showConfirmationModal(
      'Confirm Password Change',
      'Are you sure you want to change your password? You will need to use the new password for future logins.',
      performPasswordChange,
      'Change Password'
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            aria-label="Current password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            required
            autoComplete="new-password"
            aria-label="New password"
          />
          <ul className="mt-2 space-y-1 text-xs">
            {passwordStrength.criteria.map((criterion, index) => (
              <li
                key={index}
                className={`flex items-center ${criterion.met ? 'text-green-600' : 'text-destructive'}`}
              >
                {criterion.met ? (
                  <CheckCircle className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <XCircle className="mr-2 h-3.5 w-3.5" />
                )}
                {criterion.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
          <Input
            id="confirmNewPassword"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            aria-label="Confirm new password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="mr-2 h-4 w-4" />
          )}
          Change Password
        </Button>
      </form>
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
