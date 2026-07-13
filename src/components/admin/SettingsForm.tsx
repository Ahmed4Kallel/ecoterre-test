"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";

interface SettingsFormProps {
  settings: Record<string, string>;
}

const FIELD_DEFS: { key: string; label: string; type?: string }[] = [
  { key: "site_name_fr", label: "Nom du site (FR)" },
  { key: "site_name_ar", label: "Nom du site (AR)" },
  { key: "site_description_fr", label: "Description du site (FR)" },
  { key: "site_description_ar", label: "Description du site (AR)" },
  { key: "contact_email", label: "Email de contact", type: "email" },
  { key: "contact_phone", label: "Téléphone" },
  { key: "facebook_url", label: "URL Facebook", type: "url" },
  { key: "twitter_url", label: "URL Twitter / X", type: "url" },
  { key: "linkedin_url", label: "URL LinkedIn", type: "url" },
  { key: "youtube_url", label: "URL YouTube", type: "url" },
  { key: "google_analytics_id", label: "Google Analytics ID" },
];

export default function SettingsForm({ settings: initialSettings }: SettingsFormProps) {
  const [values, setValues] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Paramètres enregistrés avec succès." });
      } else {
        setMessage({ type: "error", text: "Erreur lors de l'enregistrement." });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Paramètres du site</h1>

      {message && (
        <div
          className={`rounded-md p-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5 dark:border-slate-700 dark:bg-slate-900">
        {FIELD_DEFS.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={`setting-${field.key}`}
              className="mb-1 block text-sm font-semibold text-gray-700 dark:text-slate-300"
            >
              {field.label}
            </label>
            <input
              id={`setting-${field.key}`}
              type={field.type || "text"}
              value={values[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
            />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
      </Button>
    </form>
  );
}
