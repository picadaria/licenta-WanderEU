import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function NewTripLoading() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-88px)] md:min-h-screen">
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex flex-col gap-1.5">
          <Skeleton width={80} height={12} />
          <Skeleton width={120} height={14} />
        </div>

        <div className="flex items-center gap-4">
          {/* Progress dots skeleton */}
          <div className="flex items-center gap-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton circle width={12} height={12} />
                {i < 3 && <Skeleton width={48} height={2} className="mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step heading skeleton */}
      <div className="flex flex-col gap-2 mb-8">
        <Skeleton width={240} height={28} />
        <Skeleton width={200} height={16} />
      </div>

      {/* Form fields skeleton */}
      <div className="flex flex-col gap-6">
        {/* City combobox 1 */}
        <div className="flex flex-col gap-1.5">
          <Skeleton width={120} height={14} />
          <Skeleton height={44} borderRadius={6} />
        </div>

        {/* City combobox 2 */}
        <div className="flex flex-col gap-1.5">
          <Skeleton width={160} height={14} />
          <Skeleton height={44} borderRadius={6} />
        </div>

        {/* Date inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Skeleton width={80} height={14} />
            <Skeleton height={44} borderRadius={6} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton width={80} height={14} />
            <Skeleton height={44} borderRadius={6} />
          </div>
        </div>
      </div>

      {/* Bottom bar skeleton */}
      <div className="mt-auto pt-8">
        <div className="border-t border-border-subtle pt-4 flex justify-end">
          <Skeleton width={120} height={42} borderRadius={6} />
        </div>
      </div>
    </div>
  );
}
