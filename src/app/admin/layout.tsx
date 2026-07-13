import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminLayoutClient from "@/components/admin/AdminLayout";

const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-current-path") || "";

  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  const user = await getSession();

  if (!user) {
    redirect("/admin/login");
  }

  const { password: _, ...safeUser } = user;

  return (
    <AdminLayoutClient user={{ name: safeUser.name, role: safeUser.role }}>
      {children}
    </AdminLayoutClient>
  );
}
