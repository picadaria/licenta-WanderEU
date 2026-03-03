"use client";

import { cn } from "@/lib/utils";

interface InterestTagsProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelect?: number;
  className?: string;
}

export function InterestTags({
  options,
  selected,
  onChange,
  maxSelect,
  className,
}: InterestTagsProps) {
  const isSelected = (tag: string) => selected.includes(tag);

  const toggle = (tag: string) => {
    if (isSelected(tag)) {
      onChange(selected.filter((s) => s !== tag));
    } else {
      if (maxSelect !== undefined && selected.length >= maxSelect) return;
      onChange([...selected, tag]);
    }
  };

  const atLimit = maxSelect !== undefined && selected.length >= maxSelect;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((tag) => {
        const active = isSelected(tag);
        const disabled = !active && atLimit;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            disabled={disabled}
            title={
              disabled && maxSelect
                ? `Max ${maxSelect} interests selected`
                : undefined
            }
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-colors select-none",
              active
                ? "bg-accent text-white border border-accent"
                : "border border-border-default text-text-secondary hover:border-accent hover:text-text-primary bg-transparent",
              disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            {tag}
          </button>
        );
      })}
      {maxSelect !== undefined && (
        <span className="text-xs text-text-tertiary self-center ml-1">
          {selected.length}/{maxSelect} selected
        </span>
      )}
    </div>
  );
}
