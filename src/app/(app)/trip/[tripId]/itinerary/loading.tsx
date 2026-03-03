import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ItineraryLoading() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6">
      {[1, 2, 3, 4].map((col) => (
        <div key={col} className="flex flex-col gap-2 w-[260px] shrink-0">
          {/* Column header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col gap-1">
              <Skeleton width={50} height={14} borderRadius={4} />
              <Skeleton width={90} height={12} borderRadius={4} />
            </div>
            <Skeleton width={40} height={20} borderRadius={4} />
          </div>

          {/* Activity cards */}
          {Array.from({ length: col === 1 ? 4 : col === 2 ? 3 : col === 3 ? 2 : 3 }).map(
            (_, i) => (
              <Skeleton key={i} height={88} borderRadius={8} />
            )
          )}

          {/* Add button */}
          <Skeleton height={36} borderRadius={8} />
        </div>
      ))}
    </div>
  );
}
