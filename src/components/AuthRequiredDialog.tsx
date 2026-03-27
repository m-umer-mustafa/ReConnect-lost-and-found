import React from 'react';
import { AlertCircle, LogIn } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';

interface AuthRequiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
  action: string; // e.g., "report an item" or "claim an item"
}

export const AuthRequiredDialog: React.FC<AuthRequiredDialogProps> = ({
  isOpen,
  onClose,
  action,
}) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-300 bg-destructive/10 dark:border-slate-700 dark:bg-destructive/15">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="font-semibold text-slate-900 dark:text-slate-100">
              Sign In Required
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
          You must be signed in to {action}. Please sign in or create an account to continue.
        </AlertDialogDescription>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="h-11 border border-slate-300 bg-white font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSignIn}
            className="flex h-11 items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
