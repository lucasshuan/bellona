import { cn } from "@/lib/utils/helpers";

export const heroPillButtonClass =
  "inline-flex h-[34px] items-center gap-1.75 rounded-[9px] border border-border bg-background-soft px-3 text-xs font-semibold text-secondary transition-all duration-200 hover:border-gold/55 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 active:scale-[0.99] disabled:cursor-wait";

export function HeroPillButton({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(heroPillButtonClass, className)}
      {...props}
    >
      {children}
    </button>
  );
}
