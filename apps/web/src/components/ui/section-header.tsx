import type { ReactNode } from "react";
import { cn } from "@/lib/utils/helpers";

/** Gold mono eyebrow with leading rule — matches event overview / design system. */
export const sectionEyebrowClass =
  "flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-gold/75 before:h-px before:w-4 before:shrink-0 before:bg-gold/60 before:content-['']";

export function SectionEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn(sectionEyebrowClass, className)}>{children}</p>;
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3.5 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}
          <h2 className="font-display text-foreground mt-1.5 text-[19px] leading-snug font-bold tracking-[0.01em]">
            {title}
          </h2>
          {description ? (
            <p className="text-muted/52 mt-1 max-w-3xl text-[13px] leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
