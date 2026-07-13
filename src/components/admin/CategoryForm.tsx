"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import type { Category } from "@/lib/types";

const ICON_OPTIONS = [
  "newspaper",
  "chart-line",
  "leaf",
  "heart-pulse",
  "file-text",
  "podcast",
  "globe",
  "users",
  "camera",
  "microphone",
];

interface CategoryFormProps {
  category?: Category;
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = !!category;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [nameFr, setNameFr] = useState(category?.name.fr || "");
  const [nameAr, setNameAr] = useState(category?.name.ar || "");
  const [descFr, setDescFr] = useState(category?.description.fr || "");
  const [descAr, setDescAr] = useState(category?.description.ar || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [icon, setIcon] = useState(category?.icon || "");
  const [order, setOrder] = useState(category?.order || 0);

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function handleNameFrChange(value: string) {
    setNameFr(value);
    if (!isEdit && !slug) {
      setSlug(generateSlug(value));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!nameFr.trim()) {
      setError("Le nom français est requis");
      return;
    }

    setSaving(true);

    const payload = {
      name: { fr: nameFr, ar: nameAr },
      description: { fr: descFr, ar: descAr },
      slug: slug || generateSlug(nameFr),
      icon: icon || undefined,
      order: Number(order) || 0,
    };

    try {
      const url = isEdit
        ? `/api/categories/${category!.id}`
        : "/api/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la sauvegarde");
        return;
      }

      router.push("/admin/categories");
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"}
        </h1>
        <Button variant="outline" size="sm" href="/admin/categories">
          ← Retour
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom (Français) <span className="text-red-500">*</span>
              </label>
              <input
                value={nameFr}
                onChange={(e) => handleNameFrChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                placeholder="Actualités"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom (Arabe)
              </label>
              <input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none text-right"
                placeholder="أخبار"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Français)
              </label>
              <textarea
                value={descFr}
                onChange={(e) => setDescFr(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Arabe)
              </label>
              <textarea
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none resize-y text-right"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                placeholder="auto-généré"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordre
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icône
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none bg-white"
              >
                <option value="">Aucune</option>
                {ICON_OPTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" href="/admin/categories">
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
