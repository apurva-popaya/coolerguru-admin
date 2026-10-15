import type { ReactNode } from "react";
import { cn } from "cn";

interface InquirySectionProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function InquirySection({ title, children, action, className }: InquirySectionProps) {
  return (
    <section className={cn("min-w-0 rounded-2xl border border-border bg-card shadow-sm", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
        <h2 className="font-bold text-foreground text-admin-15">{title}</h2>

        {action}
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
