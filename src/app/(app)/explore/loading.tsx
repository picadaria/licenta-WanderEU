import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function DestinationCardSkeleton() {
  return (
    <div className="rounded-[8px] overflow-hidden h-[200px] bg-bg-secondary">
      <Skeleton height={200} borderRadius={8} />
    </div>
  );
}

function BudgetPickSkeleton() {
  return (
    <div className="w-48 flex-shrink-0 rounded-[8px] border border-border-subtle overflow-hidden bg-bg-primary">
      <Skeleton height={96} borderRadius={0} />
      <div className="p-3 flex flex-col gap-1.5">
        <Skeleton height={14} width="70%" borderRadius={4} />
        <Skeleton height={12} width="50%" borderRadius={4} />
        <Skeleton height={14} width="40%" borderRadius={4} />
        <Skeleton height={10} width={60} borderRadius={4} />
      </div>
    </div>
  );
}

export default function ExploreLoading() {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar skeleton */}
      <aside className="w-64 shrink-0 border-r border-border-subtle p-6 hidden lg:flex flex-col gap-6">
        <Skeleton height={20} width={80} borderRadius={4} />
        <div className="flex flex-col gap-2">
          <Skeleton height={12} width={100} borderRadius={4} />
          <div className="flex gap-2">
            <Skeleton height={36} borderRadius={6} className="flex-1" />
            <Skeleton height={36} borderRadius={6} className="flex-1" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton height={12} width={80} borderRadius={4} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton circle height={16} width={16} />
              <Skeleton height={14} width={80} borderRadius={4} />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton height={12} width={70} borderRadius={4} />
          <div className="flex flex-wrap gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={28} width={70} borderRadius={999} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton height={12} width={60} borderRadius={4} />
          <div className="flex flex-wrap gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={28} width={65} borderRadius={999} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-auto">
          <Skeleton height={36} borderRadius={6} />
          <Skeleton height={20} width={60} borderRadius={4} className="mx-auto" />
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-12">
        {/* Hero skeleton */}
        <section className="flex flex-col items-center gap-5 text-center pt-4">
          <Skeleton height={20} width={180} borderRadius={999} />
          <Skeleton height={44} width={320} borderRadius={6} />
          <Skeleton height={18} width={280} borderRadius={4} />
          {/* Search bar */}
          <div className="w-full max-w-xl">
            <Skeleton height={56} borderRadius={8} />
          </div>
          <Skeleton height={32} width={120} borderRadius={6} />
        </section>

        {/* Popular Destinations */}
        <section>
          <Skeleton height={28} width={220} borderRadius={6} className="mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <DestinationCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Budget-Friendly Picks */}
        <section>
          <Skeleton height={28} width={200} borderRadius={6} className="mb-5" />
          <div className="flex gap-4 overflow-hidden">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <BudgetPickSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Community Trips */}
        <section>
          <Skeleton height={28} width={180} borderRadius={6} className="mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-[8px] border border-border-subtle overflow-hidden bg-bg-primary"
              >
                <Skeleton height={112} borderRadius={0} />
                <div className="p-3.5 flex flex-col gap-2">
                  <Skeleton height={14} width="70%" borderRadius={4} />
                  <Skeleton height={12} width="50%" borderRadius={4} />
                  <Skeleton height={12} width="35%" borderRadius={4} />
                  <Skeleton height={10} width="90%" borderRadius={4} />
                  <Skeleton height={10} width="60%" borderRadius={4} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
