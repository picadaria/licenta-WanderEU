"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

type PageVariant = "dashboard" | "explore" | "profile" | "tripDetail";

interface SkeletonPageProps {
  variant: PageVariant;
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Skeleton height={36} width={260} borderRadius={6} />
        <Skeleton height={16} width={180} borderRadius={4} />
      </div>
      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} variant="stat" />
        ))}
      </div>
      {/* Trip cards */}
      <div>
        <Skeleton height={20} width={120} borderRadius={4} className="mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} variant="trip" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExploreSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <div className="flex flex-col gap-4 items-center py-12">
        <Skeleton height={44} width={340} borderRadius={6} />
        <Skeleton height={48} width="100%" borderRadius={8} />
      </div>
      {/* Section heading */}
      <div>
        <Skeleton height={24} width={200} borderRadius={4} className="mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonCard key={i} variant="destination" />
          ))}
        </div>
      </div>
      {/* Horizontal scroll */}
      <div>
        <Skeleton height={24} width={200} borderRadius={4} className="mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-48 flex-shrink-0">
              <Skeleton height={160} borderRadius={8} />
              <div className="mt-2 flex flex-col gap-1">
                <Skeleton height={14} width="70%" borderRadius={4} />
                <Skeleton height={12} width="50%" borderRadius={4} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      {/* User info */}
      <div className="flex items-center gap-4 pb-8 border-b border-border-subtle">
        <Skeleton circle height={64} width={64} />
        <div className="flex flex-col gap-2">
          <Skeleton height={28} width={180} borderRadius={6} />
          <Skeleton height={14} width={220} borderRadius={4} />
        </div>
      </div>
      {/* Section */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="pb-8 border-b border-border-subtle">
          <Skeleton height={24} width={180} borderRadius={6} className="mb-4" />
          <div className="flex flex-col gap-3">
            <Skeleton height={40} borderRadius={6} />
            <Skeleton height={40} borderRadius={6} />
            <Skeleton height={40} borderRadius={6} />
          </div>
        </div>
      ))}
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} variant="stat" />
        ))}
      </div>
    </div>
  );
}

function TripDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Cover */}
      <Skeleton height={280} borderRadius={8} />
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Skeleton height={32} width={300} borderRadius={6} />
        <Skeleton height={16} width={200} borderRadius={4} />
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} variant="stat" />
        ))}
      </div>
      {/* Activities */}
      <div>
        <Skeleton height={20} width={120} borderRadius={4} className="mb-3" />
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} variant="activity" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonPage({ variant }: SkeletonPageProps) {
  return (
    <div className="w-full animate-pulse-none">
      {variant === "dashboard" && <DashboardSkeleton />}
      {variant === "explore" && <ExploreSkeleton />}
      {variant === "profile" && <ProfileSkeleton />}
      {variant === "tripDetail" && <TripDetailSkeleton />}
    </div>
  );
}
