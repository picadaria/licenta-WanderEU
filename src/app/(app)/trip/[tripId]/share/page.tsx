"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ClipboardCopy,
  Check,
  Globe,
  Lock,
  Users,
  Crown,
  Pencil,
  Eye,
  Trash2,
  ChevronDown,
  Link2,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type MemberRole = "owner" | "editor" | "viewer";

interface Member {
  _id: Id<"tripMembers">;
  userId: Id<"users">;
  role: MemberRole;
  joinedAt: number;
  user: {
    name: string;
    email: string;
    imageUrl?: string;
  } | null;
}

const ROLE_CONFIG: Record<
  MemberRole,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }
> = {
  owner: { label: "Owner", icon: Crown, color: "text-warning" },
  editor: { label: "Editor", icon: Pencil, color: "text-[#3B6EC4]" },
  viewer: { label: "Viewer", icon: Eye, color: "text-text-secondary" },
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="w-8 h-8 rounded-full object-cover shrink-0"
      />
    );
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-accent-muted text-accent text-xs font-semibold flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
}

// ─── Member Row ────────────────────────────────────────────────────────────────
function MemberRow({
  member,
  tripId,
}: {
  member: Member;
  tripId: Id<"trips">;
}) {
  const updateRole = useMutation(api.tripMembers.updateRole);
  const removeMember = useMutation(api.tripMembers.remove);
  const [menuOpen, setMenuOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const cfg = ROLE_CONFIG[member.role];
  const Icon = cfg.icon;

  async function handleRoleChange(role: MemberRole) {
    setMenuOpen(false);
    if (role === member.role) return;
    await updateRole({ tripId, targetUserId: member.userId, role });
  }

  async function handleRemove() {
    setRemoving(true);
    await removeMember({ tripId, targetUserId: member.userId });
  }

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-bg-secondary transition-colors">
      <Avatar
        name={member.user?.name ?? "?"}
        imageUrl={member.user?.imageUrl}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {member.user?.name ?? "Unknown"}
        </p>
        <p className="text-xs text-text-tertiary truncate">
          {member.user?.email ?? ""}
        </p>
      </div>

      {/* Role badge + dropdown */}
      <div className="relative shrink-0">
        {member.role === "owner" ? (
          <span className="flex items-center gap-1 text-xs font-medium text-warning px-2 py-1 rounded-full bg-warning-muted">
            <Crown size={11} />
            Owner
          </span>
        ) : (
          <>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors",
                "bg-bg-secondary hover:bg-bg-tertiary",
                cfg.color
              )}
            >
              <Icon size={11} />
              {cfg.label}
              <ChevronDown size={10} className="text-text-tertiary" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-bg-primary border border-border-default rounded-[8px] shadow-lg z-20 overflow-hidden">
                {(["editor", "viewer"] as MemberRole[]).map((role) => {
                  const r = ROLE_CONFIG[role];
                  const RIcon = r.icon;
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={cn(
                        "flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-bg-secondary transition-colors",
                        member.role === role
                          ? "text-text-primary font-medium"
                          : "text-text-secondary"
                      )}
                    >
                      <RIcon size={12} className={r.color} />
                      {r.label}
                    </button>
                  );
                })}
                <div className="border-t border-border-subtle" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleRemove();
                  }}
                  disabled={removing}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-error hover:bg-[rgba(196,61,46,0.06)] transition-colors"
                >
                  <Trash2 size={12} />
                  {removing ? "Removing…" : "Remove"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SharePage() {
  const params = useParams();
  const tripId = params.tripId as Id<"trips">;

  const trip = useQuery(api.trips.getById, { tripId });
  const members = useQuery(api.tripMembers.listByTrip, { tripId });
  const updateTrip = useMutation(api.trips.update);

  const [copied, setCopied] = useState(false);
  const [togglingPublic, setTogglingPublic] = useState(false);

  if (!trip || !members) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton height={100} borderRadius={8} />
        <Skeleton height={60} borderRadius={8} />
        <Skeleton height={200} borderRadius={8} />
      </div>
    );
  }

  const inviteLink = trip.inviteCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${trip.inviteCode}`
    : null;

  const shareLink = `${typeof window !== "undefined" ? window.location.origin : ""}/trip/${tripId}/overview`;

  function handleCopyInvite() {
    const link = inviteLink ?? shareLink;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleShareGmail() {
    if (!trip) return;
    const subject = encodeURIComponent(`Join my trip to ${trip.destination.city}`);
    const body = encodeURIComponent(
      `Hey! I'd like you to join my trip to ${trip.destination.city} on WanderEU.\n\nJoin here: ${inviteLink ?? shareLink}`
    );
    window.open(`https://mail.google.com/mail/?view=cm&su=${subject}&body=${body}`, "_blank");
  }

  function handleShareWhatsApp() {
    if (!trip) return;
    const text = encodeURIComponent(
      `Hey! Join my trip to ${trip.destination.city} on WanderEU: ${inviteLink ?? shareLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  async function handleTogglePublic() {
    if (!trip) return;
    setTogglingPublic(true);
    await updateTrip({ tripId, isPublic: !trip.isPublic });
    setTogglingPublic(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Invite Section ───────────────────────────────────── */}
      {!trip.isGroupTrip && (
        <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Link2 size={16} className="text-text-tertiary" />
            <h2 className="text-sm font-semibold text-text-primary">
              Invite friends
            </h2>
          </div>

          {/* Invite link */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center px-3 py-2 rounded-[6px] border border-border-default bg-bg-secondary">
              <span className="text-xs text-text-secondary truncate font-mono">
                {inviteLink ?? shareLink}
              </span>
            </div>
            <button
              onClick={handleCopyInvite}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-sm font-medium transition-colors shrink-0",
                copied
                  ? "bg-success text-white"
                  : "bg-accent text-white hover:bg-accent-hover"
              )}
            >
              {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Share via */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-text-tertiary font-medium">Share via</p>
            <div className="flex gap-2">
              <button
                onClick={handleShareGmail}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-sm font-medium border border-border-default text-text-primary hover:bg-bg-secondary transition-colors"
              >
                <Mail size={14} className="text-[#EA4335]" />
                Gmail
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-sm font-medium border border-border-default text-text-primary hover:bg-bg-secondary transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Group Members ────────────────────────────────────── */}
      {(trip.isGroupTrip || members.length > 1) && (
        <div className="rounded-[8px] border border-border-subtle bg-bg-primary overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-text-tertiary" />
              <h2 className="text-sm font-semibold text-text-primary">
                Trip members
              </h2>
              <span className="text-xs text-text-tertiary">
                ({members.length})
              </span>
            </div>
          </div>

          <div className="divide-y divide-border-subtle">
            {(members as Member[]).map((member) => (
              <MemberRow
                key={member._id}
                member={member}
                tripId={tripId}
              />
            ))}
          </div>

          {/* Invite via code for group trips */}
          {trip.isGroupTrip && inviteLink && (
            <div className="border-t border-border-subtle px-4 py-3 bg-bg-secondary">
              <p className="text-xs text-text-secondary mb-2">
                Share invite link to add members:
              </p>
              <div className="flex gap-2">
                <span className="flex-1 font-mono text-xs text-text-secondary truncate py-1">
                  {inviteLink}
                </span>
                <button
                  onClick={handleCopyInvite}
                  className="flex items-center gap-1 text-xs text-accent font-medium hover:underline shrink-0"
                >
                  {copied ? <Check size={12} /> : <ClipboardCopy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Visibility toggle ────────────────────────────────── */}
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {trip.isPublic ? (
            <Globe size={16} className="text-success mt-0.5 shrink-0" />
          ) : (
            <Lock size={16} className="text-text-tertiary mt-0.5 shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-text-primary">
              {trip.isPublic ? "Public trip" : "Private trip"}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {trip.isPublic
                ? "Your completed trip appears on the Explore page for others to discover."
                : "Only invited members can view this trip."}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={handleTogglePublic}
          disabled={togglingPublic}
          aria-checked={trip.isPublic}
          role="switch"
          className={cn(
            "relative inline-flex w-10 h-6 items-center rounded-full transition-colors shrink-0 focus:outline-none",
            "disabled:opacity-60",
            trip.isPublic ? "bg-success" : "bg-border-default"
          )}
        >
          <span
            className={cn(
              "inline-block w-4 h-4 rounded-full bg-white shadow transition-transform",
              trip.isPublic ? "translate-x-5" : "translate-x-1"
            )}
          />
        </button>
      </div>

      {/* ── Share link ───────────────────────────────────────── */}
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Link2 size={14} className="text-text-tertiary" />
          <p className="text-sm font-medium text-text-primary">Share this trip</p>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center px-3 py-2 rounded-[6px] border border-border-default bg-bg-secondary">
            <span className="text-xs text-text-secondary font-mono truncate">
              {shareLink}
            </span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareLink).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              });
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-sm font-medium transition-colors shrink-0",
              copied
                ? "bg-success text-white"
                : "border border-border-default text-text-primary hover:bg-bg-secondary"
            )}
          >
            {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
