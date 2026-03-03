import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function BudgetLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Budget totals */}
      <div className="rounded-[8px] border border-border-subtle p-5">
        <div className="flex justify-between mb-4">
          <div className="flex flex-col gap-1">
            <Skeleton width={60} height={12} borderRadius={4} />
            <Skeleton width={120} height={36} borderRadius={6} />
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Skeleton width={60} height={12} borderRadius={4} />
            <Skeleton width={120} height={36} borderRadius={6} />
          </div>
        </div>
        <Skeleton height={10} borderRadius={4} />
      </div>

      {/* Bar chart */}
      <div className="rounded-[8px] border border-border-subtle p-5">
        <Skeleton width={160} height={16} borderRadius={4} className="mb-4" />
        <Skeleton height={220} borderRadius={6} />
      </div>

      {/* Line chart */}
      <div className="rounded-[8px] border border-border-subtle p-5">
        <Skeleton width={140} height={16} borderRadius={4} className="mb-4" />
        <Skeleton height={220} borderRadius={6} />
      </div>

      {/* Expense list */}
      <div className="rounded-[8px] border border-border-subtle overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle">
          <Skeleton width={100} height={16} borderRadius={4} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-0"
          >
            <Skeleton width={8} height={8} borderRadius={9999} />
            <div className="flex-1">
              <Skeleton width="60%" height={14} borderRadius={4} />
              <Skeleton width={80} height={11} borderRadius={4} className="mt-1" />
            </div>
            <Skeleton width={60} height={20} borderRadius={4} />
          </div>
        ))}
      </div>
    </div>
  );
}
