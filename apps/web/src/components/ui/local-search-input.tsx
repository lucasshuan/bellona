"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

export function LocalSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Search className="text-muted/50 size-4" />
      </div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className="focus:border-gold/45 focus:ring-gold/10 border-gold-dim/35 bg-card-strong/50 text-secondary placeholder:text-secondary/30 hover:border-gold-dim/55 focus:bg-card-strong/70 h-11 w-full rounded-xl border pr-11 pl-10 text-sm outline-hidden transition-all focus:ring-4"
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-muted/40 hover:text-muted absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
