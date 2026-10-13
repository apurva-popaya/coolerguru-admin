import type { ReactNode } from "react";

interface InquirySectionProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function InquirySection({ title, children, action, className }: InquirySectionProps) {
  return (
    <section className={`rounded-[9px] border border-border bg-white ${className ?? ""}`}>
      <div className="flex min-h-[48px] items-center justify-between gap-3 border-border border-b px-4">
        <h2 className="font-bold text-[#15136f] text-admin-15">{title}</h2>

        {action}
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}
