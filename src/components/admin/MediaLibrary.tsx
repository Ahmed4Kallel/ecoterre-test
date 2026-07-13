"use client";

import { useState, useEffect } from "react";
import type { MediaItem } from "@/lib/types";
import OptimizedImage from "@/components/ui/OptimizedImage";

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/media")
      .then((res) => res.json())
      .then((data) => {
        setMedia(data.files || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (name: string) => {
    if (!confirm("Supprimer ce fichier ?")) return;
    setDeleting(name);
    try {
      const res = await fetch(`/api/media?file=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.name !== name));
      }
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setMedia((prev) => [
          {
            name: data.url.split("/").pop() || file.name,
            url: data.url,
            size: file.size,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch {
      // ignore
    }
    e.target.value = "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Médiathèque</h1>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-800 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Uploader
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {media.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-slate-700">
          <p className="text-gray-500 dark:text-slate-400">Aucun fichier dans la médiathèque.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div
              key={item.name}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="aspect-square bg-gray-100">
                {item.url.match(/\.(jpg|jpeg|png|gif|webp|svg)/i) ? (
                  <OptimizedImage
                    src={item.url}
                    alt={item.name}
                    fill
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="absolute inset-0 flex items-end justify-center gap-2 bg-black/0 p-3 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                <button
                  onClick={() => copyUrl(item.url)}
                  className="rounded bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-800 shadow hover:bg-white cursor-pointer"
                >
                  {copied === item.url ? "Copié !" : "Copier URL"}
                </button>
                <button
                  onClick={() => handleDelete(item.name)}
                  disabled={deleting === item.name}
                  className="rounded bg-red-600/90 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-red-700 cursor-pointer disabled:opacity-50"
                >
                  {deleting === item.name ? "..." : "Suppr."}
                </button>
              </div>

              <div className="p-2">
                <p className="truncate text-xs text-gray-500 dark:text-slate-400">{item.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">{(item.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
