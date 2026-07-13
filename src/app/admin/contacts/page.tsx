import { redirect } from "next/navigation";
import { getSession, requireAdmin } from "@/lib/auth";
import { findAll } from "@/lib/db";
import type { ContactMessage } from "@/lib/types";
import ContactsList from "@/components/admin/ContactsList";

export default async function ContactsPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!requireAdmin(user)) redirect("/admin");

  const messages = findAll<ContactMessage>("contacts").sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return <ContactsList messages={messages} />;
}
