import type { ReactNode } from "react";

interface DetailSectionProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DetailSection({ title, icon, action, children, className }: DetailSectionProps) {
  return (
    <section className={`rounded-[9px] border border-border bg-white ${className ?? ""}`}>
      <div className="flex min-h-[50px] items-center justify-between gap-4 border-border border-b px-4">
        <div className="flex items-center gap-2">
          {icon}

          <h2 className="font-bold text-[#15136f] text-admin-15">{title}</h2>
        </div>

        {action}
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}