// src/components/layout/GlobalLoadingIndicatorWrapper.tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function GlobalLoadingIndicatorWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading: authLoadingContext } = useAuth();

  return (
    // This outer div will always be the flex item within <main>
    // It takes up the available space due to flex-1 and acts as a flex column container for its own content
    <div className="flex-1 flex flex-col">
      {authLoadingContext ? (
        // This inner div centers the spinner within the space provided by the outer div
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        // Children are rendered directly; they will flow normally within this flex-1 container
        // Page components usually have their own top-level div that manages their layout.
        children
      )}
    </div>
  );
}
