import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  Eye,
  Heart,
  MapPin,
  MessageSquare,
  Package,
  // Pencil, // Restore when user editing is supported.
  Phone,
  ShieldCheck,
  Store,
  // Trash2, // Restore when user deletion is supported.
  Users,
} from "lucide-react";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";

import type { BuyerStats, SupplierStats, UserActivity, UserDetailData } from "./user-detail-data";

export function UserDetail({ user }: { user: UserDetailData }) {
  return (
    <div className="space-y-5">
      {/* PAGE HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-admin-14">
            <Link href="/users" className="font-medium text-[#2720a8]">
              Users
            </Link>

            <span className="text-muted-foreground">/</span>

            <span>{user.name}</span>
          </div>

          <h1 className="font-bold text-[#15136f] text-admin-28">User Details</h1>

          <p className="mt-1 text-[#5d6280] text-admin-14">
            View detailed information, activity and engagement for this user.
          </p>
        </div>

        <Button asChild variant="outline" className="gap-2">
          <Link href="/users">
            <ArrowLeft className="size-4" />
            Back to Users
          </Link>
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <UserProfile user={user} />

         {user.roles.includes("Buyer") && user.buyerStats ? (
  <BuyerStatsGrid stats={user.buyerStats} />
) : null}

{user.roles.includes("Supplier") && user.supplierStats ? (
  <SupplierStatsGrid stats={user.supplierStats} />
) : null}
          <RecentActivity activities={user.activities} />
        </div>

        <div className="space-y-5">
          <InformationCard title="Account Information">
            <InformationRow label="User ID" value={`#${user.id}`} />

           <InformationRow label="Role" value={user.roles.join(", ")} />

            <InformationRow label="Account Type" value={user.accountType} />

            <InformationRow label="Registration Date" value={user.registrationDate} />

            <InformationRow label="Last Activity" value={user.lastActivity} />

            <InformationRow label="Status" value={user.status} />
          </InformationCard>

          <InformationCard title="Additional Information">
            <InformationRow label={user.role === "Supplier" ? "Company" : "Name"} value={user.name} />

            <InformationRow label="Mobile" value={user.mobile} />

            {/* <InformationRow
              label="Email"
              value={user.email}
            /> */}

            <InformationRow label="Location" value={user.location} />
          </InformationCard>

          {/* Quick Actions disabled until admin user editing and deletion are supported. */}
          {/* <InformationCard title="Quick Actions"> */}
            {/* <Button
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Mail className="size-4" />

              Send Email
            </Button> */}

            {/* <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href={`/users/${user.id}?edit=true`}>
                <Pencil className="size-4" />
                Edit User
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-4" />
              Delete User
            </Button> */}

            {/* <Button
              variant="outline"
              className="w-full justify-start gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
            >
              <ShieldCheck className="size-4" />

              {user.status ===
              "Active"
                ? "Deactivate User"
                : "Activate User"}
            </Button> */}
          {/* </InformationCard> */}
        </div>
      </div>
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
    <div className="rounded-[10px] border border-border bg-white p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex size-[105px] shrink-0 items-center justify-center rounded-full bg-[#dcecff] font-bold text-[#2720a8] text-admin-30">
          {initials}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-bold text-[#15136f] text-admin-24">{user.name}</h2>

            <div className="flex flex-wrap gap-2">
  {user.roles.map((role) => (
    <StatusBadge key={role} variant={role === "Buyer" ? "info" : "purple"}>
      {role}
    </StatusBadge>
  ))}
</div>
          </div>

          <div className="mt-3 space-y-2 text-[#5d6280] text-admin-14">
            <p className="flex items-center gap-2">
              <Phone className="size-4" />

              {user.mobile}
            </p>

            {/* <p className="flex items-center gap-2">
              <Mail className="size-4" />

              {user.email}
            </p> */}

            <p className="flex items-center gap-2">
              <MapPin className="size-4" />

              {user.location}
            </p>
          </div>
        </div>

        {/* <StatusBadge
          variant={
            user.status ===
            "Active"
              ? "success"
              : "danger"
          }
        >
          {user.status}
        </StatusBadge> */}
      </div>
    </div>
  );
}

function BuyerStatsGrid({ stats }: { stats: BuyerStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard icon={Heart} value={stats.savedProducts} label="Saved Products" />

      <MetricCard icon={Building2} value={stats.savedCompanies} label="Saved Companies" />

      {/* <MetricCard icon={Eye} value={stats.productsViewed} label="Products Viewed" />

      <MetricCard icon={Building2} value={stats.companiesViewed} label="Companies Viewed" /> */}

      <MetricCard icon={MessageSquare} value={stats.inquiriesSent} label="Inquiries Sent" />

      <MetricCard icon={Users} value={stats.companiesContacted} label="Companies Contacted" />
    </div>
  );
}

function SupplierStatsGrid({ stats }: { stats: SupplierStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Link href={`/companies/${stats.companyId}`}>
        <MetricCard icon={Store} value={stats.company} label="Company" />
      </Link>

      <MetricCard icon={Package} value={stats.products} label="Products" />

      <MetricCard icon={MessageSquare} value={stats.inquiriesReceived} label="Inquiries Received" />

      <MetricCard icon={MessageSquare} value={stats.repliesSent} label="Replies Sent" />

      <MetricCard icon={ShieldCheck} value={stats.verification} label="Verification" />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;

  value: string | number;

  label: string;
}) {
  return (
    <div className="h-full rounded-[9px] border border-border bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[8px] bg-[#edf3ff]">
          <Icon className="size-5 text-[#2563eb]" />
        </div>

        <div>
          <p className="font-bold text-[#15136f] text-admin-19">{value}</p>

          <p className="text-[#5d6280] text-admin-14">{label}</p>
        </div>
      </div>
    </div>
  );
}

function RecentActivity({ activities }: { activities: UserActivity[] }) {
  return (
    <div className="rounded-[10px] border border-border bg-white p-5">
      <h2 className="font-bold text-[#15136f] text-admin-18">Recent Activity</h2>

      <p className="mt-1 text-admin-14 text-muted-foreground">
        A list of this user&apos;s recent actions on the platform.
      </p>

      <div className="mt-5">
  {activities.length > 0 ? (
    activities.map((activity) => (
      <ActivityRow key={activity.id} activity={activity} />
    ))
  ) : (
    <div className="rounded-[8px] border border-dashed border-border px-4 py-8 text-center text-admin-14 text-muted-foreground">
      No recent activity available.
    </div>
  )}
</div>

      {/* <div className="mt-4 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/activity">View All Activity</Link>
        </Button>
      </div> */}
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
    <div className="flex items-center gap-4 border-border border-b py-3 last:border-b-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#edf3ff]">
        <Icon className="size-4 text-[#2563eb]" />
      </div>

      <div className="flex-1">
        <p className="font-semibold text-[#15136f] text-admin-14">{activity.type}</p>

        <p className="mt-1 text-[#5d6280] text-admin-14">{activity.title}</p>
      </div>

      <p className="text-right text-[#5d6280] text-admin-14">{activity.date}</p>
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
    <div className="rounded-[10px] border border-border bg-white p-5">
      <h2 className="font-bold text-[#15136f] text-admin-17">{title}</h2>

      <div className="mt-5 space-y-4">{children}</div>
    </div>
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
    <div className="grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)] gap-3 text-admin-14">
      <span className="text-[#5d6280]">{label}</span>

      <span className="font-medium text-[#15136f]">{value}</span>
    </div>
  );
}
