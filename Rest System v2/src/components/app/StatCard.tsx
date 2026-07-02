import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label, value, hint, icon: Icon, tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "neon" | "success" | "warning" | "danger";
}) {
  const toneMap = {
    default: "text-foreground",
    neon: "neon-text",
    success: "text-[color:var(--success)]",
    warning: "text-[color:var(--warning)]",
    danger: "text-destructive",
  };
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={cn("mt-2 text-3xl font-semibold tracking-tight", toneMap[tone])}>
            {value}
          </div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionCard({
  title, action, children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
        <h3 className="text-sm font-medium">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Badge({
  children, tone = "default",
}: { children: React.ReactNode; tone?: "default" | "neon" | "success" | "warning" | "danger" | "muted" }) {
  const map = {
    default: "bg-secondary text-secondary-foreground",
    muted: "bg-muted text-muted-foreground",
    neon: "bg-primary/10 text-primary border border-primary/30",
    success: "bg-[color:var(--success)]/10 text-[color:var(--success)] border border-[color:var(--success)]/30",
    warning: "bg-[color:var(--warning)]/10 text-[color:var(--warning)] border border-[color:var(--warning)]/30",
    danger: "bg-destructive/10 text-destructive border border-destructive/30",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", map[tone])}>
      {children}
    </span>
  );
}