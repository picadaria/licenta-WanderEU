import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function SectionSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-border-subtle pb-8 mb-8">
      <Skeleton height={24} width={180} borderRadius={6} className="mb-5" />
      {children}
    </div>
  );
}

export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* User info */}
      <SectionSkeleton>
        <div className="flex items-center gap-4">
          <Skeleton circle height={64} width={64} />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton height={28} width={200} borderRadius={6} />
            <Skeleton height={14} width={240} borderRadius={4} />
          </div>
          <Skeleton height={36} width={110} borderRadius={6} />
        </div>
      </SectionSkeleton>

      {/* Travel Preferences */}
      <SectionSkeleton>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Skeleton height={14} width={80} borderRadius={4} />
              <Skeleton height={40} borderRadius={6} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Skeleton height={14} width={100} borderRadius={4} />
              <Skeleton height={40} borderRadius={6} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton height={14} width={100} borderRadius={4} />
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={88} borderRadius={8} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton height={14} width={70} borderRadius={4} />
            <div className="flex flex-wrap gap-2">
              {[80, 60, 90, 65, 75, 55, 85, 70].map((w, i) => (
                <Skeleton key={i} height={32} width={w} borderRadius={999} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton height={14} width={130} borderRadius={4} />
            <div className="flex flex-wrap gap-2">
              {[90, 65, 80, 70, 60, 75].map((w, i) => (
                <Skeleton key={i} height={32} width={w} borderRadius={999} />
              ))}
            </div>
          </div>
          <Skeleton height={40} width={130} borderRadius={6} />
        </div>
      </SectionSkeleton>

      {/* Stats */}
      <SectionSkeleton>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-3 p-4 rounded-[8px] border border-border-subtle"
            >
              <Skeleton height={36} width={36} borderRadius={6} />
              <div>
                <Skeleton height={30} width={60} borderRadius={4} />
                <div className="mt-1">
                  <Skeleton height={14} width={100} borderRadius={4} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionSkeleton>

      {/* Student Verification */}
      <SectionSkeleton>
        <div className="flex flex-col gap-4">
          <Skeleton height={28} width={140} borderRadius={999} />
          <Skeleton height={14} width="90%" borderRadius={4} />
          <div className="flex gap-3">
            <Skeleton height={40} borderRadius={6} className="flex-1" />
            <Skeleton height={40} width={80} borderRadius={6} />
          </div>
        </div>
      </SectionSkeleton>

      {/* Settings */}
      <div className="flex flex-col gap-8">
        <Skeleton height={24} width={80} borderRadius={6} />
        {/* Notifications */}
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Skeleton height={14} width={120} borderRadius={4} />
                <Skeleton height={12} width={180} borderRadius={4} />
              </div>
              <Skeleton height={24} width={44} borderRadius={999} />
            </div>
          ))}
        </div>
        {/* Currency */}
        <div className="flex flex-col gap-1.5">
          <Skeleton height={14} width={130} borderRadius={4} />
          <Skeleton height={40} borderRadius={6} />
        </div>
        {/* Danger zone */}
        <div className="pt-4 border-t border-border-subtle">
          <Skeleton height={14} width={80} borderRadius={4} className="mb-3" />
          <Skeleton height={40} width={140} borderRadius={6} />
        </div>
      </div>
    </div>
  );
}
