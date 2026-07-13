import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findAll } from "@/lib/db";
import type { Article } from "@/lib/types";
import ReportsClient from "./ReportsClient";

export default async function AdminReportsPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");

  const articles = findAll<Article>("articles");
  const reports = articles.filter((a) => a.pdfUrl && a.pdfUrl.length > 0);

  return <ReportsClient reports={reports} />;
}
