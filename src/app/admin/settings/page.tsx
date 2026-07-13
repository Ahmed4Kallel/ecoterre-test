import { redirect } from "next/navigation";
import { getSession, requireAdmin } from "@/lib/auth";
import { findAll } from "@/lib/db";
import type { SiteSetting } from "@/lib/types";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!requireAdmin(user)) redirect("/admin");

  const settings = findAll<SiteSetting>("settings");
  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }

  return <SettingsForm settings={settingsMap} />;
}
