import type { ReactNode } from "react";
import { cn } from "cn";

interface DetailSectionProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DetailSection({ title, icon, action, children, className }: DetailSectionProps) {
  return (
    <section className={cn("min-w-0 rounded-2xl border border-border bg-card shadow-sm", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          {icon}

          <h2 className="font-bold text-foreground text-admin-15">{title}</h2>
        </div>

        {action}
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
