"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const budgetBreakdown = [
  { label: "Transport", amount: 89, color: "bg-[#3B6EC4]", percent: 23 },
  { label: "Stay", amount: 145, color: "bg-[#E8553A]", percent: 37 },
  { label: "Food", amount: 95, color: "bg-[#2D7A4F]", percent: 25 },
  { label: "Activities", amount: 58, color: "bg-[#C4841D]", percent: 15 },
];

const days = [
  {
    label: "Day 1",
    date: "Mon",
    activities: [
      {
        time: "09:30",
        title: "Sagrada Família",
        location: "Eixample",
        cost: "€26",
        note: "Student discount applied",
      },
      {
        time: "12:00",
        title: "Lunch at Mercat de Sant Josep",
        location: "La Rambla",
        cost: "€10",
        note: "Local market pintxos",
      },
      {
        time: "15:00",
        title: "Gothic Quarter exploration",
        location: "Barri Gòtic",
        cost: "Free",
        note: "Self-guided walk",
      },
    ],
  },
  {
    label: "Day 2",
    date: "Tue",
    activities: [
      {
        time: "10:00",
        title: "Park Güell",
        location: "Gràcia",
        cost: "€10",
        note: "Book online for discount",
      },
      {
        time: "13:30",
        title: "Barceloneta Beach",
        location: "Barceloneta",
        cost: "Free",
        note: "Bring your own snacks",
      },
      {
        time: "19:00",
        title: "El Born evening bar hop",
        location: "El Born",
        cost: "€15",
        note: "Budget 3 drinks",
      },
    ],
  },
  {
    label: "Day 3",
    date: "Wed",
    activities: [
      {
        time: "10:00",
        title: "Casa Batlló exterior",
        location: "Passeig de Gràcia",
        cost: "Free",
        note: "Interior €35 — skip",
      },
      {
        time: "12:30",
        title: "Boqueria lunch",
        location: "La Rambla",
        cost: "€8",
        note: "Go early to avoid crowds",
      },
      {
        time: "16:00",
        title: "Montjuïc cable car",
        location: "Montjuïc",
        cost: "€14",
        note: "Great sunset views",
      },
    ],
  },
  {
    label: "Day 4",
    date: "Thu",
    activities: [
      {
        time: "09:00",
        title: "Day trip to Montserrat",
        location: "Montserrat",
        cost: "€22",
        note: "Train + rack railway combo",
      },
      {
        time: "14:00",
        title: "Mountain hike trail",
        location: "Montserrat",
        cost: "Free",
        note: "Sant Joan trail (1.5h)",
      },
      {
        time: "19:30",
        title: "Return + Tapas dinner",
        location: "Barcelona",
        cost: "€16",
        note: "El Xampanyet recommended",
      },
    ],
  },
  {
    label: "Day 5",
    date: "Fri",
    activities: [
      {
        time: "10:00",
        title: "MACBA Contemporary Museum",
        location: "El Raval",
        cost: "€12",
        note: "Free Saturdays after 4pm",
      },
      {
        time: "13:00",
        title: "Farewell lunch — El Raval",
        location: "El Raval",
        cost: "€11",
        note: "Try the menú del día",
      },
      {
        time: "16:30",
        title: "Airport (T1) — Bus Aerobús",
        location: "El Prat Airport",
        cost: "€6",
        note: "40 min from Plaça Catalunya",
      },
    ],
  },
];

export default function TripExample() {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <section id="trip-example" className="bg-bg-secondary py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-12 lg:mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-text-secondary mb-4">
            See it in action
          </p>
          <h2 className="font-serif italic text-[36px] sm:text-[48px] leading-[1.1] text-text-primary max-w-lg">
            A real trip, built in seconds.
          </h2>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
          className="bg-bg-primary border border-border-subtle rounded-[8px] shadow-lg overflow-hidden"
          style={{ transform: "rotate(-1deg)" }}
        >
          <div style={{ transform: "rotate(1deg)" }}>
            {/* Card Header */}
            <div className="px-6 py-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-[17px] font-semibold text-text-primary">
                  Barcelona · 5 days
                </h3>
                <p className="font-mono text-[22px] text-text-primary mt-0.5">
                  €387
                  <span className="text-sm font-sans font-normal text-text-secondary ml-2">
                    total budget
                  </span>
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-muted text-success text-[11px] font-mono rounded-full self-start sm:self-center">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                Generated in 12 seconds
              </span>
            </div>

            {/* Budget Breakdown Bar */}
            <div className="px-6 py-4 border-b border-border-subtle">
              <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
                Budget breakdown
              </p>
              {/* Stacked bar */}
              <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
                {budgetBreakdown.map((seg) => (
                  <div
                    key={seg.label}
                    className={`${seg.color} h-full transition-all`}
                    style={{ width: `${seg.percent}%` }}
                  />
                ))}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
                {budgetBreakdown.map((seg) => (
                  <div
                    key={seg.label}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${seg.color} shrink-0`}
                    />
                    <span className="text-[11px] text-text-secondary">
                      {seg.label}
                    </span>
                    <span className="font-mono text-[11px] text-text-primary">
                      €{seg.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day Tabs */}
            <div className="flex overflow-x-auto border-b border-border-subtle scrollbar-none">
              {days.map((day, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDay(i)}
                  className={`flex flex-col items-center px-5 py-3 text-xs shrink-0 border-b-2 transition-colors ${
                    activeDay === i
                      ? "border-accent text-accent font-semibold"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider">
                    {day.date}
                  </span>
                  <span className="mt-0.5">{day.label}</span>
                </button>
              ))}
            </div>

            {/* Activities */}
            <div className="px-6 py-4">
              <div className="flex flex-col divide-y divide-border-subtle">
                {days[activeDay].activities.map((act, i) => (
                  <div key={i} className="py-4 flex gap-4">
                    {/* Time */}
                    <div className="flex flex-col items-end shrink-0 w-12">
                      <span className="font-mono text-[11px] text-text-tertiary">
                        {act.time}
                      </span>
                    </div>

                    {/* Timeline dot */}
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`w-2 h-2 rounded-full mt-0.5 ${
                          i === 0 ? "bg-accent" : "bg-border-default"
                        }`}
                      />
                      {i < days[activeDay].activities.length - 1 && (
                        <div className="flex-1 w-px bg-border-subtle mt-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-text-primary leading-snug">
                          {act.title}
                        </p>
                        <span
                          className={`font-mono text-sm font-medium shrink-0 ${
                            act.cost === "Free"
                              ? "text-success"
                              : "text-text-primary"
                          }`}
                        >
                          {act.cost}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                          <MapPin size={10} />
                          {act.location}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                          <Clock size={10} />
                          {act.note}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
