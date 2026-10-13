import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminAddAdminForm } from "@/components/admin/auth/admin-add-admin-form";
import { AdminAuthShell } from "@/components/admin/auth/admin-auth-shell";

export default async function AdminAddAdminPage() {
  await requireAdmin();
  return (
    <AdminAuthShell
      title="Add new administrator"
      description="Create an administrator account for an authorized CoolerGuru team member."
    >
      <AdminAddAdminForm />
    </AdminAuthShell>
  );
}
