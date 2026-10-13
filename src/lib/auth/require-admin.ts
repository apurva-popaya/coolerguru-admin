import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/server-auth";

export async function requireAdmin() {
  const user = await getServerAuthUser("ADMIN");
  if (!user || user.active_portal !== "ADMIN" || !user.roles.includes("ADMIN")) redirect("/login");
  return user;
}
