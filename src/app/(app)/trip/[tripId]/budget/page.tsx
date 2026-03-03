"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import { Plus, X, AlertTriangle, TrendingUp } from "lucide-react";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type ExpenseCategory =
  | "transport"
  | "accommodation"
  | "food"
  | "activity"
  | "shopping"
  | "other";

const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; color: string; planned: string }
> = {
  transport: {
    label: "Transport",
    color: "#3B6EC4",
    planned: "rgba(59,110,196,0.3)",
  },
  accommodation: {
    label: "Accommodation",
    color: "#C4841D",
    planned: "rgba(196,132,29,0.3)",
  },
  food: { label: "Food", color: "#E8553A", planned: "rgba(232,85,58,0.3)" },
  activity: {
    label: "Activities",
    color: "#2D7A4F",
    planned: "rgba(45,122,79,0.3)",
  },
  shopping: {
    label: "Shopping",
    color: "#9C9C93",
    planned: "rgba(156,156,147,0.3)",
  },
  other: { label: "Other", color: "#6B6B63", planned: "rgba(107,107,99,0.3)" },
};

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "transport",
  "accommodation",
  "food",
  "activity",
  "shopping",
  "other",
];

const CURRENCIES = ["EUR", "USD", "GBP", "RON", "CZK", "PLN", "HUF", "CHF"];

// ─── Add Expense Modal ──────────────────────────────────────────────────────────
function AddExpenseModal({
  tripId,
  onClose,
}: {
  tripId: Id<"trips">;
  onClose: () => void;
}) {
  const createExpense = useMutation(api.expenses.create);
  const [form, setForm] = useState({
    amount: "",
    currency: "EUR",
    category: "food" as ExpenseCategory,
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.description.trim()) return;
    setSaving(true);

    const amount = parseFloat(form.amount);
    // Simple EUR conversion approximation for non-EUR
    const rates: Record<string, number> = {
      EUR: 1,
      USD: 0.92,
      GBP: 1.17,
      RON: 0.2,
      CZK: 0.04,
      PLN: 0.23,
      HUF: 0.0026,
      CHF: 1.05,
    };
    const amountEur = amount * (rates[form.currency] ?? 1);

    try {
      await createExpense({
        tripId,
        amount,
        currency: form.currency,
        amountEur,
        category: form.category,
        description: form.description.trim(),
        date: form.date,
      });
      onClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed z-50 bg-bg-primary border border-border-default shadow-xl",
          "bottom-0 left-0 right-0 rounded-t-[16px] max-h-[85vh] overflow-y-auto",
          "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
          "md:w-[420px] md:rounded-[8px] md:max-h-none"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-8 h-1 rounded-full bg-border-default" />
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <h3 className="font-medium text-text-primary">Add expense</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[6px] text-text-tertiary hover:bg-bg-secondary"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 p-4">
          {/* Amount + currency */}
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs text-text-secondary font-medium">
                Amount *
              </label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="0.00"
                className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm font-mono text-text-primary focus:outline-none focus:border-accent placeholder:text-text-tertiary"
              />
            </div>
            <div className="w-28 flex flex-col gap-1">
              <label className="text-xs text-text-secondary font-medium">
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
                className="px-2 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary font-medium">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_CONFIG[c].label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary font-medium">
              Description *
            </label>
            <input
              required
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="e.g. Lunch at Piazza Navona"
              className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-tertiary"
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary font-medium">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !form.amount || !form.description.trim()}
            className="w-full py-2.5 rounded-[6px] bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Adding…" : "Add expense"}
          </button>
        </form>
      </div>
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BudgetPage() {
  const params = useParams();
  const tripId = params.tripId as Id<"trips">;

  const trip = useQuery(api.trips.getById, { tripId });
  const expenses = useQuery(api.expenses.listByTrip, { tripId });
  const dailySpending = useQuery(api.expenses.getDailySpending, { tripId });
  const categoryTotals = useQuery(api.expenses.getTotalByCategory, { tripId });

  const [showModal, setShowModal] = useState(false);

  // ── Derived data ────────────────────────────────────────────────────────
  const budgetPct = useMemo(() => {
    if (!trip) return 0;
    return Math.min((trip.actualSpent / trip.budgetTotal) * 100, 100);
  }, [trip]);

  const barData = useMemo(() => {
    if (!trip || !categoryTotals) return [];
    const breakdown = trip.budgetBreakdown as Record<string, number>;
    return Object.entries(CATEGORY_CONFIG)
      .filter(([key]) => key !== "shopping")
      .map(([key, cfg]) => ({
        name: cfg.label,
        Planned: breakdown[key === "activity" ? "activities" : key] ?? 0,
        Actual: (categoryTotals as Record<string, number>)[key] ?? 0,
      }))
      .filter((d) => d.Planned > 0 || d.Actual > 0);
  }, [trip, categoryTotals]);

  const lineData = useMemo(() => {
    if (!trip || !dailySpending) return [];
    const start = parseISO(trip.startDate);
    const end = parseISO(trip.endDate);
    const days = eachDayOfInterval({ start, end });
    const dailyBudget = trip.budgetTotal / Math.max(trip.totalDays, 1);

    let cumActual = 0;
    const spendingMap = new Map<string, number>(
      dailySpending.map((d: { date: string; total: number }) => [d.date, d.total])
    );

    return days.map((day, i) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const daySpend = spendingMap.get(dateStr) ?? 0;
      cumActual += daySpend;
      return {
        day: format(day, "d MMM"),
        Actual: parseFloat(cumActual.toFixed(2)),
        Budget: parseFloat(((i + 1) * dailyBudget).toFixed(2)),
      };
    });
  }, [trip, dailySpending]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!trip || !expenses || !categoryTotals) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton height={100} borderRadius={8} />
        <Skeleton height={220} borderRadius={8} />
        <Skeleton height={220} borderRadius={8} />
        <Skeleton height={200} borderRadius={8} />
      </div>
    );
  }

  const alertLevel =
    budgetPct > 90 ? "red" : budgetPct > 80 ? "yellow" : null;

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-0">
      {/* ── Budget Alert Banner ─────────────────────────────── */}
      {alertLevel && (
        <div
          className={cn(
            "flex items-start gap-3 p-4 rounded-[8px] border",
            alertLevel === "red"
              ? "bg-[rgba(196,61,46,0.06)] border-[rgba(196,61,46,0.2)]"
              : "bg-warning-muted border-[rgba(196,132,29,0.2)]"
          )}
        >
          <AlertTriangle
            size={16}
            className={cn(
              "shrink-0 mt-0.5",
              alertLevel === "red" ? "text-error" : "text-warning"
            )}
          />
          <div>
            <p
              className={cn(
                "text-sm font-medium",
                alertLevel === "red" ? "text-error" : "text-warning"
              )}
            >
              {alertLevel === "red"
                ? "Budget critical — you've used over 90%"
                : "Budget warning — you've used over 80%"}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Tips: Try local markets for lunch, use public transport instead of
              taxis, look for free museum days, and book activities with your
              ISIC student card.
            </p>
          </div>
        </div>
      )}

      {/* ── Total Budget vs Actual ──────────────────────────── */}
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
              Budget
            </span>
            <span className="font-mono text-3xl text-text-primary font-medium">
              €{trip.budgetTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 md:items-end">
            <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
              Spent
            </span>
            <span
              className={cn(
                "font-mono text-3xl font-medium",
                alertLevel === "red"
                  ? "text-error"
                  : alertLevel === "yellow"
                    ? "text-warning"
                    : "text-success"
              )}
            >
              €{trip.actualSpent.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-text-tertiary">
            <span>
              €{(trip.budgetTotal - trip.actualSpent).toFixed(2)} remaining
            </span>
            <span className="font-mono">{budgetPct.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 bg-bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                budgetPct >= 90
                  ? "bg-error"
                  : budgetPct >= 70
                    ? "bg-warning"
                    : "bg-success"
              )}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Category Bar Chart ──────────────────────────────── */}
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-5">
        <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
          <TrendingUp size={14} className="text-text-tertiary" />
          Category Breakdown
        </h2>

        {barData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-text-tertiary text-sm">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={barData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`€${Number(value).toFixed(2)}`, ""]}
                contentStyle={{
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
              />
              <Bar dataKey="Planned" fill="#E8E7E3" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Actual" fill="#E8553A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Daily Spending Line Chart ───────────────────────── */}
      {lineData.length > 0 && (
        <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-5">
          <h2 className="text-sm font-medium text-text-primary mb-4">
            Cumulative Spending
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={lineData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#E8553A"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    stopColor="#E8553A"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
              />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`€${Number(value).toFixed(2)}`, ""]}
                contentStyle={{
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line
                type="monotone"
                dataKey="Budget"
                stroke="#D4D3CF"
                strokeDasharray="4 2"
                dot={false}
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="Actual"
                stroke="#E8553A"
                strokeWidth={2}
                fill="url(#actualGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Expense List ────────────────────────────────────── */}
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <h2 className="text-sm font-medium text-text-primary">
            Expenses ({expenses.length})
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus size={13} />
            Add expense
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
            <p className="text-sm text-text-secondary">No expenses yet</p>
            <p className="text-xs text-text-tertiary">
              Add expenses to track your spending
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {expenses.map((expense: { _id: string; description: string; date: string; category: string; amountEur: number }) => {
              const cat =
                CATEGORY_CONFIG[expense.category as ExpenseCategory];
              return (
                <div
                  key={expense._id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-bg-secondary transition-colors"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat?.color ?? "#9C9C93" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">
                      {expense.description}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {expense.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: cat
                          ? `${cat.color}18`
                          : "var(--bg-secondary)",
                        color: cat?.color ?? "var(--text-secondary)",
                      }}
                    >
                      {cat?.label ?? expense.category}
                    </span>
                    <span className="font-mono text-sm font-medium text-text-primary">
                      €{expense.amountEur.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Mobile floating add button ──────────────────────── */}
      <button
        onClick={() => setShowModal(true)}
        className="md:hidden fixed bottom-24 right-4 w-12 h-12 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:bg-accent-hover transition-colors z-30"
        aria-label="Add expense"
      >
        <Plus size={20} />
      </button>

      {/* Modal */}
      {showModal && (
        <AddExpenseModal tripId={tripId} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
