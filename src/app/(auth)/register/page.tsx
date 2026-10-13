import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminAuthShell } from "@/components/admin/auth/admin-auth-shell";
import { AdminRegisterForm } from "@/components/admin/auth/admin-register-form";

export default async function AdminRegisterPage() {
  await requireAdmin();
  return (
    <AdminAuthShell
      title="Create admin account"
      description="Enter your details to create your CoolerGuru administrator account."
    >
      <AdminRegisterForm />
    </AdminAuthShell>
  );
}
