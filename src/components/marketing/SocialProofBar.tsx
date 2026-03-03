"use client";

const universities = [
  "TU Delft",
  "Politehnica",
  "KTH Royal Institute",
  "Sciences Po",
  "ETH Zürich",
  "TU München",
  "Sorbonne",
  "University of Amsterdam",
  "Politecnico di Milano",
  "University of Copenhagen",
];

export default function SocialProofBar() {
  return (
    <div className="bg-bg-secondary border-y border-border-subtle py-4 overflow-hidden">
      <div className="flex items-center gap-6 whitespace-nowrap">
        {/* Label */}
        <span className="shrink-0 pl-4 sm:pl-8 text-xs font-mono uppercase tracking-widest text-text-tertiary">
          Trusted by students from
        </span>

        {/* Marquee track */}
        <div className="flex overflow-hidden">
          <div
            className="flex gap-10 animate-marquee"
            style={{ willChange: "transform" }}
          >
            {[...universities, ...universities].map((uni, i) => (
              <span
                key={i}
                className="text-sm font-semibold text-text-secondary tracking-tight select-none"
              >
                {uni}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
