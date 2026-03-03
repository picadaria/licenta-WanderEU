"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DestinationOption {
  city: string;
  country: string;
}

interface DestinationComboboxProps {
  value: string;
  onChange: (value: string, option?: DestinationOption) => void;
  placeholder?: string;
  destinations: DestinationOption[];
  className?: string;
}

export function DestinationCombobox({
  value,
  onChange,
  placeholder = "Search destinations...",
  destinations,
  className,
}: DestinationComboboxProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = destinations.filter((d) => {
    const q = query.toLowerCase();
    return (
      d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)
    );
  });

  const select = useCallback(
    (option: DestinationOption) => {
      const display = `${option.city}, ${option.country}`;
      setQuery(display);
      onChange(display, option);
      setOpen(false);
      setHighlighted(0);
    },
    [onChange]
  );

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.children[highlighted] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && e.key !== "Escape") {
      setOpen(true);
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlighted]) {
          select(filtered[highlighted]);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input */}
      <div className="relative flex items-center">
        <Search
          size={16}
          className="absolute left-3 text-text-tertiary pointer-events-none"
        />
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value, undefined);
            setOpen(true);
            setHighlighted(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full h-10 pl-9 pr-3 border border-border-default rounded-[6px] bg-bg-primary",
            "text-sm text-text-primary placeholder:text-text-tertiary",
            "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted",
            "transition-colors"
          )}
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
        />
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className={cn(
            "absolute z-50 w-full mt-1 bg-bg-primary border border-border-default",
            "rounded-[8px] shadow-md max-h-60 overflow-y-auto"
          )}
        >
          {filtered.map((option, idx) => (
            <li
              key={`${option.city}-${option.country}`}
              role="option"
              aria-selected={idx === highlighted}
              onMouseEnter={() => setHighlighted(idx)}
              onMouseDown={(e) => {
                e.preventDefault();
                select(option);
              }}
              className={cn(
                "flex items-center justify-between px-3 py-2 cursor-pointer transition-colors",
                idx === highlighted
                  ? "bg-bg-secondary"
                  : "hover:bg-bg-secondary"
              )}
            >
              <span className="text-sm font-medium text-text-primary">
                {option.city}
              </span>
              <span className="text-sm text-text-secondary">{option.country}</span>
            </li>
          ))}
        </ul>
      )}

      {open && query.length > 0 && filtered.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-bg-primary border border-border-default rounded-[8px] shadow-md px-3 py-4 text-sm text-text-secondary text-center">
          No destinations found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
