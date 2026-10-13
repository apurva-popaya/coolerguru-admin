import { CircleCheck, Store, UserRound, UserX, Users } from "lucide-react";

interface UsersStatsProps {
  total: number;
  buyers: number;
  suppliers: number;
  active: number;
  inactive: number;
}

export function UsersStats({ total, buyers, suppliers, active, inactive }: UsersStatsProps) {
  const stats = [
    { title: "Total Users", value: total, icon: Users },
    { title: "Buyers", value: buyers, icon: UserRound },
    { title: "Suppliers", value: suppliers, icon: Store },
    { title: "Active Users", value: active, icon: CircleCheck },
    { title: "Inactive Users", value: inactive, icon: UserX },
  ];
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map(({ title, value, icon: Icon }) => (
        <div key={title} className="relative min-w-0 rounded-lg border border-border bg-card p-4">
          <dt className="pr-10 text-admin-14 font-medium text-muted-foreground">{title}</dt>
          <dd className="mt-3 text-admin-24 font-bold leading-tight text-primary">{value.toLocaleString("en-IN")}</dd>
          <div className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon aria-hidden="true" className="size-4 text-primary" />
          </div>
        </div>
      ))}
    </dl>
  );
}
