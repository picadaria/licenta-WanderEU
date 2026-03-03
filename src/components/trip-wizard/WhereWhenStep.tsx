"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Calendar, ChevronDown, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { EU_DESTINATIONS, type Destination } from "@/lib/destinations";
import { format, differenceInDays, parseISO, isAfter, isBefore, isEqual } from "date-fns";

export interface WhereWhenData {
  destination: Destination | null;
  origin: Destination | null;
  startDate: string;
  endDate: string;
}

interface WhereWhenStepProps {
  data: WhereWhenData;
  onChange: (data: WhereWhenData) => void;
  homeCity?: string;
}

interface CityComboboxProps {
  label: string;
  placeholder: string;
  value: Destination | null;
  onChange: (dest: Destination | null) => void;
  excludeCity?: string;
  icon?: React.ReactNode;
}

function CityCombobox({
  label,
  placeholder,
  value,
  onChange,
  excludeCity,
  icon,
}: CityComboboxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered =
    query.length === 0
      ? EU_DESTINATIONS.filter((d) => d.city !== excludeCity).slice(0, 8)
      : EU_DESTINATIONS.filter(
          (d) =>
            d.city !== excludeCity &&
            (d.city.toLowerCase().includes(query.toLowerCase()) ||
              d.country.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 10);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(dest: Destination) {
    onChange(dest);
    setQuery("");
    setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    inputRef.current?.focus();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    if (!open) setOpen(true);
    if (e.target.value === "") onChange(null);
  }

  const displayValue = value ? `${value.city}` : query;

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <div className="relative">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-[6px] border bg-white transition-colors",
            open ? "border-accent ring-2 ring-accent/10" : "border-border-default",
            "hover:border-border-strong"
          )}
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
          }}
        >
          <span className="text-text-tertiary flex-shrink-0">
            {icon || <MapPin size={16} />}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={value ? `${value.city}, ${value.country}` : query}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
            readOnly={!!value}
            onClick={() => {
              if (value) {
                onChange(null);
                setQuery("");
              }
            }}
          />
          {value ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-text-tertiary hover:text-text-primary transition-colors flex-shrink-0"
            >
              <X size={14} />
            </button>
          ) : (
            <ChevronDown
              size={14}
              className={cn(
                "text-text-tertiary transition-transform flex-shrink-0",
                open && "rotate-180"
              )}
            />
          )}
        </div>

        {open && filtered.length > 0 && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-border-default rounded-[8px] shadow-md overflow-hidden">
            <div className="max-h-[240px] overflow-y-auto">
              {filtered.map((dest) => (
                <button
                  key={`${dest.city}-${dest.countryCode}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(dest);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-bg-secondary transition-colors",
                    value?.city === dest.city && "bg-accent-muted"
                  )}
                >
                  <span className="text-xs font-mono text-text-tertiary w-6 flex-shrink-0">
                    {dest.countryCode}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text-primary">{dest.city}</span>
                    <span className="text-xs text-text-secondary">{dest.country}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {open && filtered.length === 0 && query.length > 0 && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-border-default rounded-[8px] shadow-md">
            <div className="px-3 py-4 text-sm text-text-tertiary text-center">
              No cities found for &ldquo;{query}&rdquo;
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const today = new Date().toISOString().split("T")[0];
const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

export function WhereWhenStep({ data, onChange, homeCity }: WhereWhenStepProps) {
  const homeCityDest = homeCity
    ? EU_DESTINATIONS.find((d) => d.city.toLowerCase() === homeCity.toLowerCase()) ?? null
    : null;

  const handleChange = useCallback(
    (patch: Partial<WhereWhenData>) => {
      onChange({ ...data, ...patch });
    },
    [data, onChange]
  );

  const tripDays =
    data.startDate && data.endDate
      ? (() => {
          const start = parseISO(data.startDate);
          const end = parseISO(data.endDate);
          return isAfter(end, start) || isEqual(end, start)
            ? differenceInDays(end, start) + 1
            : null;
        })()
      : null;

  const dateRangeValid =
    data.startDate && data.endDate && tripDays !== null && tripDays >= 1 && tripDays <= 30;

  const startDateError = (() => {
    if (!data.startDate) return null;
    if (data.startDate < today) return "Start date must be today or later";
    return null;
  })();

  const endDateError = (() => {
    if (!data.endDate || !data.startDate) return null;
    if (data.endDate < data.startDate) return "End date must be after start date";
    if (tripDays !== null && tripDays > 30) return "Trips can be at most 30 days";
    if (tripDays !== null && tripDays < 1) return "Trip must be at least 1 day";
    return null;
  })();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-serif text-2xl text-text-primary mb-1">Where are you going?</h2>
        <p className="text-sm text-text-secondary">Choose your destination and travel dates.</p>
      </div>

      {/* Destination */}
      <CityCombobox
        label="Destination city"
        placeholder="Search for a city..."
        value={data.destination}
        onChange={(dest) => handleChange({ destination: dest })}
        excludeCity={data.origin?.city}
        icon={<MapPin size={16} />}
      />

      {/* Origin */}
      <CityCombobox
        label="Departing from"
        placeholder="Where are you leaving from?"
        value={data.origin ?? homeCityDest}
        onChange={(dest) => handleChange({ origin: dest })}
        excludeCity={data.destination?.city}
        icon={<MapPin size={16} />}
      />

      {/* Dates */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Start date</label>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-[6px] border bg-white transition-colors",
                startDateError ? "border-error" : "border-border-default hover:border-border-strong",
                data.startDate && !startDateError && "border-border-strong"
              )}
            >
              <Calendar size={16} className="text-text-tertiary flex-shrink-0" />
              <input
                type="date"
                value={data.startDate}
                min={today}
                max={maxDate}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange({
                    startDate: val,
                    endDate:
                      data.endDate && data.endDate < val ? "" : data.endDate,
                  });
                }}
                className="flex-1 bg-transparent text-sm text-text-primary outline-none [color-scheme:light]"
              />
            </div>
            {startDateError && (
              <p className="text-xs text-error">{startDateError}</p>
            )}
          </div>

          {/* End date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">End date</label>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-[6px] border bg-white transition-colors",
                endDateError ? "border-error" : "border-border-default hover:border-border-strong",
                data.endDate && !endDateError && "border-border-strong"
              )}
            >
              <Calendar size={16} className="text-text-tertiary flex-shrink-0" />
              <input
                type="date"
                value={data.endDate}
                min={data.startDate || today}
                max={maxDate}
                onChange={(e) => handleChange({ endDate: e.target.value })}
                className="flex-1 bg-transparent text-sm text-text-primary outline-none [color-scheme:light]"
                disabled={!data.startDate}
              />
            </div>
            {endDateError && (
              <p className="text-xs text-error">{endDateError}</p>
            )}
          </div>
        </div>

        {/* Duration badge */}
        {dateRangeValid && tripDays !== null && (
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-muted border border-accent/20 rounded-full">
              <Clock size={13} className="text-accent" />
              <span className="text-sm font-medium text-accent font-mono">
                {tripDays} {tripDays === 1 ? "day" : "days"}
              </span>
            </div>
            {data.startDate && data.endDate && (
              <span className="text-xs text-text-tertiary">
                {format(parseISO(data.startDate), "MMM d")} –{" "}
                {format(parseISO(data.endDate), "MMM d, yyyy")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Summary card */}
      {data.destination && data.origin && dateRangeValid && (
        <div className="p-4 rounded-[8px] bg-bg-secondary border border-border-subtle">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <MapPin size={14} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {data.origin.city} → {data.destination.city}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                {data.destination.country} · {tripDays} {tripDays === 1 ? "day" : "days"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function validateWhereWhen(data: WhereWhenData): boolean {
  if (!data.destination || !data.origin) return false;
  if (!data.startDate || !data.endDate) return false;
  if (data.startDate < today) return false;
  if (data.endDate < data.startDate) return false;
  const days = differenceInDays(parseISO(data.endDate), parseISO(data.startDate)) + 1;
  return days >= 1 && days <= 30;
}
