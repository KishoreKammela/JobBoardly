'use client';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface JobSkeletonCardProps {
  viewMode: 'grid' | 'list';
}

export const JobSkeletonCard = ({ viewMode }: JobSkeletonCardProps) => (
  <Card
    className={`shadow-sm flex flex-col ${viewMode === 'list' ? '' : 'h-full'}`}
  >
    <CardHeader className="pb-3">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-md" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3 pb-4 flex-grow">
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <div className="flex flex-wrap gap-1.5 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </CardContent>
    <CardFooter className="pt-4 border-t">
      <div className="flex justify-between items-center w-full">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </CardFooter>
  </Card>
);
