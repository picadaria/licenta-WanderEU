"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import {
  Send,
  Plus,
  Plane,
  Building2,
  Utensils,
  Camera,
  Clock,
  Car,
  LogIn,
  LogOut,
  MapPin,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// ─── Types ─────────────────────────────────────────────────────────────────────
type ActivityType =
  | "transport"
  | "accommodation"
  | "food"
  | "activity"
  | "free_time"
  | "flight"
  | "checkin"
  | "checkout";

type ExpenseCategory =
  | "transport"
  | "accommodation"
  | "food"
  | "activity"
  | "shopping"
  | "other";

const TYPE_ICONS: Record<
  ActivityType,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  flight: Plane,
  accommodation: Building2,
  food: Utensils,
  activity: Camera,
  free_time: Clock,
  transport: Car,
  checkin: LogIn,
  checkout: LogOut,
};

const TYPE_COLORS: Record<ActivityType, string> = {
  flight: "text-[#3B6EC4]",
  accommodation: "text-warning",
  food: "text-accent",
  activity: "text-success",
  free_time: "text-text-tertiary",
  transport: "text-[#3B6EC4]",
  checkin: "text-success",
  checkout: "text-error",
};

const QUICK_SUGGESTIONS = [
  "What if it rains?",
  "Find cheaper lunch nearby",
  "What's open nearby?",
  "Best photo spots here",
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "food",
  "transport",
  "activity",
  "accommodation",
  "shopping",
  "other",
];

// ─── Typing Indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5 bg-bg-secondary rounded-[8px] rounded-bl-none w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LivePage() {
  const params = useParams();
  const tripId = params.tripId as Id<"trips">;

  const trip = useQuery(api.trips.getById, { tripId });
  const days = useQuery(api.tripDays.listByTrip, { tripId });
  const activities = useQuery(api.activities.listByTrip, { tripId });
  const chatData = useQuery(api.chatMessages.listByTrip, { tripId });

  const createMessage = useMutation(api.chatMessages.create);
  const createExpense = useMutation(api.expenses.create);

  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const currentTimeStr = format(now, "HH:mm");

  // ── State ────────────────────────────────────────────────────────────────
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickExpense, setQuickExpense] = useState({
    amount: "",
    category: "food" as ExpenseCategory,
  });
  const [addingExpense, setAddingExpense] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Scroll to bottom on new messages ────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.messages]);

  // ── Today's activities ───────────────────────────────────────────────────
  const todayDay = days?.find((d: { date: string }) => d.date === todayStr);
  const todayActivities: Array<{
    _id: Id<"activities">;
    type: ActivityType;
    title: string;
    startTime?: string;
    endTime?: string;
    location?: { name: string };
    tripDayId: Id<"tripDays">;
  }> = (activities ?? [])
    .filter((a: { tripDayId: string }) => a.tripDayId === todayDay?._id)
    .sort((a: { startTime?: string }, b: { startTime?: string }) =>
      (a.startTime ?? "00:00").localeCompare(b.startTime ?? "00:00")
    );

  // ── Highlight current/next activity ─────────────────────────────────────
  function getActivityStatus(
    startTime?: string,
    endTime?: string
  ): "past" | "current" | "next" | "future" {
    if (!startTime) return "future";
    const start = startTime.replace(":", "");
    const end = endTime ? endTime.replace(":", "") : "9999";
    const now = currentTimeStr.replace(":", "");
    if (now >= start && now < end) return "current";
    if (now < start) return "next";
    return "past";
  }

  // ── Budget remaining ─────────────────────────────────────────────────────
  const budgetRemaining = trip
    ? Math.max(0, trip.budgetTotal - trip.actualSpent)
    : 0;
  const dailyAllowance = trip
    ? (budgetRemaining / Math.max(trip.totalDays, 1)).toFixed(2)
    : "0.00";

  // ── Send chat message ─────────────────────────────────────────────────────
  async function handleSendMessage(text?: string) {
    const content = (text ?? chatInput).trim();
    if (!content || sending) return;

    setSending(true);
    setChatInput("");

    try {
      // Save user message
      await createMessage({ tripId, role: "user", content });

      // Simulate assistant typing + response
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
      setIsTyping(false);

      // Simple rule-based responses (in production, call api.ai.chatAssistant)
      let assistantReply = "";
      const lower = content.toLowerCase();
      if (lower.includes("rain")) {
        assistantReply = `If it rains in ${trip?.destination.city ?? "your destination"}, I'd suggest visiting indoor museums, local cafes, or covered markets. Check if your accommodation has an umbrella to borrow!`;
      } else if (lower.includes("lunch") || lower.includes("cheap")) {
        assistantReply = `For budget lunches, try local markets, bakeries, or student restaurants (mense). Using your ISIC card can get you up to 50% off at many places. Lunch menus (menu del día) are often the best deal!`;
      } else if (lower.includes("nearby") || lower.includes("open")) {
        assistantReply = `I can suggest some options near ${trip?.destination.city ?? "you"}! Try checking Google Maps for "open now" nearby. In Europe, many shops close between 13:00–15:00, so plan your visits accordingly.`;
      } else if (lower.includes("photo")) {
        assistantReply = `Great photo spots are often found at golden hour (1 hour after sunrise or before sunset). Look for elevated viewpoints, historic squares, and canal-side walks. Always ask locals — they know the hidden gems!`;
      } else {
        assistantReply = `I'm here to help you make the most of your trip to ${trip?.destination.city ?? "your destination"}! I can suggest budget tips, nearby attractions, local restaurant recommendations, or help with any travel questions you have.`;
      }

      await createMessage({
        tripId,
        role: "assistant",
        content: assistantReply,
      });
    } catch {
      setIsTyping(false);
    } finally {
      setSending(false);
    }
  }

  // ── Add quick expense ─────────────────────────────────────────────────────
  async function handleAddExpense() {
    if (!quickExpense.amount) return;
    setAddingExpense(true);
    const amount = parseFloat(quickExpense.amount);
    try {
      await createExpense({
        tripId,
        amount,
        currency: "EUR",
        amountEur: amount,
        category: quickExpense.category,
        description: `${quickExpense.category.charAt(0).toUpperCase() + quickExpense.category.slice(1)} expense`,
        date: todayStr,
      });
      setQuickExpense({ amount: "", category: "food" });
    } finally {
      setAddingExpense(false);
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!trip || !days || !activities) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton height={80} borderRadius={8} />
        <Skeleton height={180} borderRadius={8} />
        <Skeleton height={300} borderRadius={8} />
      </div>
    );
  }

  const messages = chatData?.messages ?? [];

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* ── Budget Remaining ─────────────────────────────────── */}
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
            Budget Remaining
          </span>
          <span className="font-mono text-4xl text-accent font-medium">
            €{budgetRemaining.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className="text-sm text-text-secondary">
            ~€{dailyAllowance}/day remaining
          </span>
        </div>

        {/* Quick expense add */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={quickExpense.amount}
            onChange={(e) =>
              setQuickExpense((q) => ({ ...q, amount: e.target.value }))
            }
            placeholder="Amount €"
            className="w-24 px-2.5 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm font-mono text-text-primary focus:outline-none focus:border-accent placeholder:text-text-tertiary"
          />
          <select
            value={quickExpense.category}
            onChange={(e) =>
              setQuickExpense((q) => ({
                ...q,
                category: e.target.value as ExpenseCategory,
              }))
            }
            className="px-2 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddExpense}
            disabled={addingExpense || !quickExpense.amount}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60"
          >
            <Plus size={14} />
            {addingExpense ? "…" : "Add"}
          </button>
        </div>
      </div>

      {/* ── Today's Schedule ─────────────────────────────────── */}
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-accent" />
            <h2 className="text-sm font-semibold text-text-primary">
              Today&apos;s schedule
            </h2>
          </div>
          <span className="font-mono text-xs text-text-tertiary bg-bg-secondary rounded px-2 py-0.5">
            {format(now, "EEEE, d MMM")}
          </span>
        </div>

        {todayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
            <Clock size={24} className="text-text-tertiary" />
            <p className="text-sm text-text-secondary">
              No activities planned for today
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[28px] top-0 bottom-0 w-px bg-border-subtle" />

            <div className="flex flex-col divide-y divide-border-subtle">
              {todayActivities.map((activity) => {
                const status = getActivityStatus(
                  activity.startTime,
                  activity.endTime
                );
                const Icon =
                  TYPE_ICONS[activity.type as ActivityType] ?? Camera;
                const colorClass =
                  TYPE_COLORS[activity.type as ActivityType] ?? "text-text-secondary";

                return (
                  <div
                    key={activity._id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 relative transition-colors",
                      status === "current" && "bg-accent-muted",
                      status === "past" && "opacity-50"
                    )}
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border-2 shrink-0 z-10 bg-bg-primary flex items-center justify-center mt-0.5",
                        status === "current"
                          ? "border-accent bg-accent"
                          : status === "next"
                            ? "border-[#3B6EC4]"
                            : "border-border-default"
                      )}
                    >
                      {status === "current" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Icon size={13} className={colorClass} />
                          <p
                            className={cn(
                              "text-sm font-medium leading-tight",
                              status === "current"
                                ? "text-accent"
                                : "text-text-primary"
                            )}
                          >
                            {activity.title}
                          </p>
                          {status === "current" && (
                            <span className="text-[10px] font-bold text-accent bg-accent-muted rounded-full px-1.5 py-0.5 animate-pulse">
                              NOW
                            </span>
                          )}
                          {status === "next" && (
                            <span className="text-[10px] font-medium text-[#3B6EC4] bg-[rgba(59,110,196,0.1)] rounded-full px-1.5 py-0.5">
                              NEXT
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-text-tertiary shrink-0">
                          {activity.startTime ?? ""}
                          {activity.endTime ? ` – ${activity.endTime}` : ""}
                        </span>
                      </div>

                      {activity.location?.name && (
                        <p className="flex items-center gap-1 text-[11px] text-text-tertiary mt-0.5">
                          <MapPin size={9} />
                          {activity.location.name}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── AI Chat Section ──────────────────────────────────── */}
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <h2 className="text-sm font-semibold text-text-primary">
            AI Travel Assistant
          </h2>
          <span className="text-xs text-text-tertiary ml-auto">
            {trip.destination.city} mode
          </span>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-3 px-4 py-4 min-h-[240px] max-h-[360px] overflow-y-auto">
          {messages.length === 0 && !isTyping && (
            <div className="flex flex-col items-start gap-2">
              <div className="bg-bg-secondary rounded-[8px] rounded-bl-none px-3.5 py-2.5 max-w-[85%]">
                <p className="text-sm text-text-primary">
                  Hey! I&apos;m your AI assistant for {trip.destination.city}.
                  Ask me about local tips, budget advice, or what to do if plans
                  change.
                </p>
              </div>
            </div>
          )}

          {(messages as Array<{ _id: string; role: "user" | "assistant"; content: string }>).map((msg) => (
            <div
              key={msg._id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-accent text-white rounded-[8px] rounded-br-none"
                    : "bg-bg-secondary text-text-primary rounded-[8px] rounded-bl-none"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick suggestions */}
        <div className="flex gap-1.5 px-4 py-2 flex-wrap border-t border-border-subtle">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSendMessage(suggestion)}
              disabled={sending}
              className="text-xs px-2.5 py-1 rounded-full border border-border-default text-text-secondary hover:border-accent hover:text-accent hover:bg-accent-muted transition-colors disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 px-4 py-3 border-t border-border-subtle">
          <input
            ref={inputRef}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Ask me anything about ${trip.destination.city}…`}
            disabled={sending}
            className="flex-1 px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-tertiary disabled:opacity-60"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!chatInput.trim() || sending}
            className="px-3 py-2 rounded-[6px] bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
