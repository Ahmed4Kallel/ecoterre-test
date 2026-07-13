import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findAll } from "@/lib/db";
import type { Article } from "@/lib/types";
import PodcastsClient from "./PodcastsClient";

export default async function AdminPodcastsPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");

  const articles = findAll<Article>("articles");
  const podcasts = articles.filter((a) => a.audioUrl && a.audioUrl.length > 0);

  return <PodcastsClient podcasts={podcasts} />;
}
