import { AdminAuthShell } from "@/components/admin/auth/admin-auth-shell";
import { AdminLoginForm } from "@/components/admin/auth/admin-login-form";

export default function AdminLoginPage() {
  return (
    <AdminAuthShell title="Welcome back" description="Login with your registered admin email address and password.">
      <AdminLoginForm />
    </AdminAuthShell>
  );
}
