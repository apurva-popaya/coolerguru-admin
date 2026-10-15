import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  Eye,
  Heart,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Store,
  Users,
} from "lucide-react";

import { StatusBadge } from "@/components/common/status-badge";
import { DetailSection } from "@/components/admin/company-detail/detail-section";
import type { LucideIcon } from "lucide-react";

import type { BuyerStats, SupplierStats, UserActivity, UserDetailData } from "./user-detail-data";

export function UserDetail({ user }: { user: UserDetailData }) {
  return (
    <div className="user-detail-page flex min-w-0 flex-col gap-4">
      <Link href="/users" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" />Back to Users
      </Link>
      <UserProfile user={user} />
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-2">
        {user.roles.includes("Buyer") && user.buyerStats && <BuyerStatsGrid stats={user.buyerStats} />}
        {user.roles.includes("Supplier") && user.supplierStats && <SupplierStatsGrid stats={user.supplierStats} />}
      </div>
        <InformationCard title="Account Information">
          <InformationRow label="User ID" value={`#${user.id}`} />
          <InformationRow label="Role" value={user.roles.join(", ")} />
          <InformationRow label="Account Type" value={user.accountType} />
          <InformationRow label="Registration Date" value={user.registrationDate} />
          <InformationRow label="Last Activity" value={user.lastActivity} />
          <InformationRow label="Status" value={user.status} />
          <InformationRow label="Name" value={user.name} />
          <InformationRow label="Mobile" value={user.mobile} />
          <InformationRow label="Location" value={user.location} />
        </InformationCard>
      <RecentActivity activities={user.activities} />
    </div>
  );
}

function UserProfile({ user }: { user: UserDetailData }) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-accent text-xl font-bold text-primary">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-words font-bold text-foreground text-admin-24">{displayValue(user.name)}</h1>

            <div className="flex flex-wrap gap-2">
              <StatusBadge variant={user.status === "Active" ? "success" : "danger"}>{user.status}</StatusBadge>
  {user.roles.map((role) => (
    <StatusBadge key={role} variant={role === "Buyer" ? "info" : "purple"}>
      {role}
    </StatusBadge>
  ))}
</div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground text-sm">
            <p className="flex items-center gap-2">
              <Phone aria-hidden="true" className="size-4 shrink-0" />

              {user.mobile}
            </p>

            

            <p className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4 shrink-0" />

              {user.location}
            </p>
          </div>
        </div>

        
      </div>
    </div>
  );
}

function BuyerStatsGrid({ stats }: { stats: BuyerStats }) {
  return (
    <DetailSection title="Buyer Activity">
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
      <MetricCard icon={Heart} value={stats.savedProducts} label="Saved Products" />

      <MetricCard icon={Building2} value={stats.savedCompanies} label="Saved Companies" />

      

      <MetricCard icon={MessageSquare} value={stats.inquiriesSent} label="Inquiries Sent" />

      <MetricCard icon={Users} value={stats.companiesContacted} label="Companies Contacted" />
    </div>
    </DetailSection>
  );
}

function SupplierStatsGrid({ stats }: { stats: SupplierStats }) {
  return (
    <DetailSection title="Supplier Activity">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
          <Link href={`/companies/${stats.companyId}`} className="flex min-w-0 items-center gap-3 rounded-lg text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Store aria-hidden="true" className="size-5 shrink-0" />
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Company</span>
              <span className="block break-words text-sm font-semibold">{displayValue(stats.company)}</span>
            </span>
          </Link>
          <StatusBadge variant={stats.verification === "Verified" ? "success" : "info"}>
            {displayValue(stats.verification)}
          </StatusBadge>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
      <MetricCard icon={Package} value={stats.products} label="Products" />

      <MetricCard icon={MessageSquare} value={stats.inquiriesReceived} label="Inquiries Received" />

      <MetricCard icon={MessageSquare} value={stats.repliesSent} label="Replies Sent" />

        </div>
      </div>
    </DetailSection>
  );
}

function MetricCard({ icon, value, label }: { icon: LucideIcon; value: string | number; label: string }) {
  const Icon = icon;
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl bg-muted/50 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <dl className="min-w-0">
        <dt className="text-xs leading-snug text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-2xl font-semibold leading-tight tabular-nums text-foreground">
          {typeof value === "number" ? value.toLocaleString("en-IN") : displayValue(value)}
        </dd>
      </dl>
    </div>
  );
}

function RecentActivity({ activities }: { activities: UserActivity[] }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <h2 className="font-bold text-foreground text-admin-18">Recent Activity</h2>

      <p className="mt-1 text-admin-14 text-muted-foreground">
        A list of this user&apos;s recent actions on the platform.
      </p>

      <div className="mt-5">
  {activities.length > 0 ? (
    activities.map((activity) => (
      <ActivityRow key={activity.id} activity={activity} />
    ))
  ) : (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-admin-14 text-muted-foreground">
      No recent activity available.
    </div>
  )}
</div>

      
    </div>
  );
}

function ActivityRow({ activity }: { activity: UserActivity }) {
  let Icon = Eye;

  if (activity.type.includes("Saved")) {
    Icon = Heart;
  }

  if (activity.type.includes("Inquiry")) {
    Icon = MessageSquare;
  }

  if (activity.type.includes("Company")) {
    Icon = Building2;
  }

  if (activity.type.includes("Product") && (activity.type.includes("Added") || activity.type.includes("Updated"))) {
    Icon = Package;
  }

  return (
    <div className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 gap-y-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto]">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent">
        <Icon className="size-4 text-primary" />
      </div>

      <div className="flex-1">
        <p className="font-semibold text-foreground text-admin-14">{activity.type}</p>

        <p className="mt-1 text-muted-foreground text-admin-14">{activity.title}</p>
      </div>

      <p className="col-start-2 text-xs text-muted-foreground sm:col-start-auto sm:text-right">{activity.date}</p>
    </div>
  );
}

function InformationCard({
  title,
  children,
}: {
  title: string;

  children: React.ReactNode;
}) {
  return (
    <DetailSection title={title}>
      <dl className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</dl>
    </DetailSection>
  );
}

function InformationRow({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 text-sm">
      <dt className="text-muted-foreground">{label}</dt>

      <dd className="break-words font-medium text-foreground">{displayValue(value)}</dd>
    </div>
  );
}

function displayValue(value: string | null | undefined) {
  const text = value?.trim();
  return !text || text === "-" || text === "\u2014" ? "Not provided" : text;
}
