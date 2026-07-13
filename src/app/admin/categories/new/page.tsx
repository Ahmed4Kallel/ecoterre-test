import { redirect } from "next/navigation";
import { getSession, requireAdmin } from "@/lib/auth";
import CategoryForm from "@/components/admin/CategoryForm";

export default async function NewCategoryPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!requireAdmin(user)) redirect("/admin");

  return <CategoryForm />;
}
