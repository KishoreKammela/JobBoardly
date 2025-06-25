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

  const showLoader = !hasMounted || authLoadingContext;

  if (showLoader) {
    // This container reserves a large vertical space to prevent layout shift
    // when the actual content (which is typically long) loads.
    // 250px is a general approximation for header + footer height.
    return (
      <div className="flex-1 flex justify-center items-center min-h-[calc(100vh-250px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
