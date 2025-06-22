// src/components/layout/GlobalLoadingIndicatorWrapper.tsx
'use client';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function GlobalLoadingIndicatorWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading: authLoadingContext } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // On the server, authLoadingContext is true (initial state from AuthProvider).
  // On the client, for the very first render before useEffect runs, hasMounted is false.
  // So, `showLoader` will be true for both the server render and the initial client render if auth is still loading.
  // This ensures the initial client render matches the server output.
  const showLoader = !hasMounted || authLoadingContext;

  return (
    <div className="flex-1 flex flex-col">
      {showLoader ? (
        // This inner div centers the spinner within the space provided by the outer div
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        // Children are rendered directly once loading is complete and component is mounted
        children
      )}
    </div>
  );
}
