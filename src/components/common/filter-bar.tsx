import type { ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
  rightContent?: ReactNode;
}

export function FilterBar({ children, rightContent }: FilterBarProps) {
  return (
    <div className="admin-filter-bar flex flex-col gap-3 rounded-[10px] border border-border bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">{children}</div>

      {rightContent && <div className="shrink-0">{rightContent}</div>}
    </div>
  );
}
