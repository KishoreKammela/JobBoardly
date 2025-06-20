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
      <div className="flex flex-col min-h-screen">
        {/* Optional: Basic Navbar structure for consistent feel during load */}
        {/* <header className="bg-card shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 h-[65px] flex items-center justify-between">
             <div className="flex items-center gap-2 text-primary">
              <Briefcase className="h-7 w-7 animate-pulse" />
              <div className="h-6 w-32 bg-primary/20 rounded animate-pulse"></div>
            </div>
            <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div>
          </div>
        </header> */}
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        {/* Optional: Basic Footer structure */}
        {/* <footer className="bg-muted/50 border-t border-border mt-auto">
          <div className="container mx-auto px-4 py-10 h-[100px]"/>
        </footer> */}
      </div>
    );
  }
  return <>{children}</>;
}
