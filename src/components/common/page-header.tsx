import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="admin-page-header flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="font-bold text-[#15136f] text-[28px] leading-[34px]">{title}</h1>

        {description && <p className="mt-1 text-[#5d6280] text-[14px]">{description}</p>}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
