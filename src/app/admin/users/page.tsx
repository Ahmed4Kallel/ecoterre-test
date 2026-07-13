import { redirect } from "next/navigation";
import { getSession, requireAdmin, getAllUsers } from "@/lib/auth";
import UsersList from "@/components/admin/UsersList";

export default async function AdminUsersPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!requireAdmin(user)) redirect("/admin");

  const users = getAllUsers().map((u) => {
    const { password: _, ...safe } = u;
    return safe;
  });

  return <UsersList users={users} currentUserId={user.id} />;
}
