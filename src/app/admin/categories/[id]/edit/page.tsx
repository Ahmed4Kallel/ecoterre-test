import { redirect, notFound } from "next/navigation";
import { getSession, requireAdmin } from "@/lib/auth";
import { findById } from "@/lib/db";
import type { Category } from "@/lib/types";
import CategoryForm from "@/components/admin/CategoryForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!requireAdmin(user)) redirect("/admin");

  const { id } = await params;
  const category = await findById<Category>("categories", id);

  if (!category) notFound();

  return <CategoryForm category={category} />;
}
