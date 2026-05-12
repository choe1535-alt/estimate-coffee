import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Generic inspector form primitives shared by all service panels.
 * Lives in the shell so each service can use the same look&feel
 * without duplicating wrappers.
 */
export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="text-[11px] leading-relaxed text-muted-foreground/80">{hint}</span>
      ) : null}
    </label>
  );
}

export function FieldGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <header className="space-y-0.5">
        <h3 className="font-display text-sm font-semibold tracking-tight">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
