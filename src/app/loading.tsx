import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="p-8 rounded-2xl slate-glass space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-96 max-w-full" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>

      {/* Leaderboard Table Skeleton */}
      <div className="rounded-xl border border-white/10 bg-[#0A192F]/60 p-4 space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
