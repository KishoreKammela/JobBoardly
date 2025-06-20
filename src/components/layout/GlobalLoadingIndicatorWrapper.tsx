'use client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function GlobalLoadingIndicatorWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading: authLoadingContext } = useAuth();

  if (authLoadingContext) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  return <>{children}</>;
}
