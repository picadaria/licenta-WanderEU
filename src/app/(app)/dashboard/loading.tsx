import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function DashboardLoading() {
  return (
    <SkeletonTheme baseColor="#F1F0EC" highlightColor="#E8E7E3">
      <div className="space-y-8">
        {/* Greeting skeleton */}
        <div>
          <Skeleton height={40} width={280} className="!rounded-[6px]" />
          <Skeleton height={16} width={180} className="!rounded-[6px] mt-2" />
        </div>

        {/* Upcoming trip hero card skeleton */}
        <section>
          <Skeleton height={12} width={100} className="!rounded-full mb-3" />
          <div className="rounded-[8px] border border-border-subtle p-5 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton height={44} width="60%" className="!rounded-[6px]" />
                <Skeleton height={16} width="40%" className="!rounded-[6px]" />
                <Skeleton height={26} width={100} className="!rounded-full" />
              </div>
              <div className="space-y-1 text-right">
                <Skeleton height={12} width={60} className="!rounded-full ml-auto" />
                <Skeleton height={20} width={120} className="!rounded-[6px] ml-auto" />
              </div>
            </div>
            {/* Budget bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton height={12} width={48} className="!rounded-full" />
                <Skeleton height={12} width={80} className="!rounded-full" />
              </div>
              <Skeleton height={6} className="!rounded-full" />
            </div>
          </div>
        </section>

        {/* Recent trips horizontal scroll skeleton */}
        <section>
          <Skeleton height={12} width={100} className="!rounded-full mb-3" />
          <div className="flex gap-4 overflow-x-hidden pb-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-64 min-w-[256px] rounded-[8px] border border-border-subtle overflow-hidden"
              >
                {/* Card cover */}
                <Skeleton height={112} className="!rounded-none" />
                {/* Card content */}
                <div className="p-3.5 space-y-2">
                  <Skeleton height={16} width="80%" className="!rounded-[6px]" />
                  <Skeleton height={12} width="55%" className="!rounded-[6px]" />
                  <Skeleton height={12} width="65%" className="!rounded-[6px]" />
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between">
                      <Skeleton height={10} width={40} className="!rounded-full" />
                      <Skeleton height={10} width={60} className="!rounded-full" />
                    </div>
                    <Skeleton height={4} className="!rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick stats skeleton */}
        <section>
          <Skeleton height={12} width={90} className="!rounded-full mb-3" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-[8px] border border-border-subtle space-y-3"
              >
                {/* Icon box */}
                <Skeleton height={36} width={36} className="!rounded-[6px]" />
                {/* Value */}
                <Skeleton height={32} width="60%" className="!rounded-[6px]" />
                {/* Label */}
                <Skeleton height={12} width="80%" className="!rounded-full" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </SkeletonTheme>
  );
}
