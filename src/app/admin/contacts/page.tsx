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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Messages de contact</h1>
        <span className="text-sm text-gray-500">
          {messages.filter((m) => !m.read).length} non lus
        </span>
      </div>
      <ContactsList messages={messages} />
    </div>
  );
}
