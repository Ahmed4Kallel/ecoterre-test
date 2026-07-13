import { redirect } from "next/navigation";
import { getSession, requireAdmin } from "@/lib/auth";
import MediaLibrary from "@/components/admin/MediaLibrary";

export default async function MediaPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!requireAdmin(user)) redirect("/admin");

  return <MediaLibrary />;
}
