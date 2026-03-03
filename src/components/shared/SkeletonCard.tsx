"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type CardVariant = "trip" | "destination" | "stat" | "activity";

interface SkeletonCardProps {
  variant: CardVariant;
  className?: string;
}

function TripSkeleton() {
  return (
    <div className="rounded-[8px] border border-border-subtle overflow-hidden bg-bg-primary">
      <Skeleton height={112} borderRadius={0} />
      <div className="p-3.5 flex flex-col gap-2">
        <Skeleton height={16} width="70%" borderRadius={4} />
        <Skeleton height={12} width="50%" borderRadius={4} />
        <Skeleton height={12} width="40%" borderRadius={4} />
        <div className="flex justify-between items-center">
          <Skeleton height={10} width={80} borderRadius={4} />
          <Skeleton height={10} width={80} borderRadius={4} />
        </div>
        <Skeleton height={4} borderRadius={999} />
      </div>
    </div>
  );
}

function DestinationSkeleton() {
  return (
    <div className="rounded-[8px] overflow-hidden relative h-[200px]">
      <Skeleton height={200} borderRadius={8} />
      <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1">
        <Skeleton height={18} width="60%" borderRadius={4} />
        <Skeleton height={12} width="40%" borderRadius={4} />
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-[8px] border border-border-subtle bg-bg-primary">
      <Skeleton height={36} width={36} borderRadius={6} />
      <div>
        <Skeleton height={30} width={80} borderRadius={4} />
        <div className="mt-1">
          <Skeleton height={14} width={120} borderRadius={4} />
        </div>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-[8px] border border-border-subtle bg-bg-primary">
      <Skeleton height={40} width={40} borderRadius={6} />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton height={14} width="70%" borderRadius={4} />
        <Skeleton height={12} width="50%" borderRadius={4} />
        <Skeleton height={10} width="30%" borderRadius={4} />
      </div>
    </div>
  );
}

export function SkeletonCard({ variant, className }: SkeletonCardProps) {
  return (
    <div className={className}>
      {variant === "trip" && <TripSkeleton />}
      {variant === "destination" && <DestinationSkeleton />}
      {variant === "stat" && <StatSkeleton />}
      {variant === "activity" && <ActivitySkeleton />}
    </div>
  );
}
