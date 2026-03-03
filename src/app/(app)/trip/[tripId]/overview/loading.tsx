import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function OverviewLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero card */}
      <div className="rounded-[8px] border border-border-subtle p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton width={80} height={12} borderRadius={4} />
            <Skeleton width={240} height={28} borderRadius={6} />
            <Skeleton width={180} height={16} borderRadius={4} />
          </div>
          <div className="flex flex-col gap-2 items-start md:items-end">
            <Skeleton width={80} height={12} borderRadius={4} />
            <Skeleton width={120} height={40} borderRadius={6} />
            <Skeleton width={100} height={14} borderRadius={4} />
          </div>
        </div>
        <Skeleton height={8} borderRadius={4} />
      </div>

      {/* Map */}
      <div className="rounded-[8px] border border-border-subtle overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle">
          <Skeleton width={120} height={16} borderRadius={4} />
        </div>
        <Skeleton height={300} borderRadius={0} />
      </div>

      {/* Pie chart */}
      <div className="rounded-[8px] border border-border-subtle p-5">
        <Skeleton width={140} height={16} borderRadius={4} className="mb-4" />
        <div className="flex items-center justify-center">
          <Skeleton width={200} height={200} borderRadius={9999} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={80} borderRadius={8} />
        ))}
      </div>
    </div>
  );
}
