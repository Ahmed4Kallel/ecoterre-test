"use client";

import { useState } from "react";
import type { ContactMessage } from "@/lib/types";

interface ContactsListProps {
  messages: ContactMessage[];
}

export default function ContactsList({ messages: initialMessages }: ContactsListProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleMarkRead(id: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, read: true } : m))
        );
      }
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-600 dark:bg-slate-800 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Nom</th>
            <th className="px-4 py-3 font-medium hidden md:table-cell">Email</th>
            <th className="px-4 py-3 font-medium hidden lg:table-cell">Sujet</th>
            <th className="px-4 py-3 font-medium">Message</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
          {messages.map((msg) => (
            <tr
              key={msg.id}
              className={`hover:bg-gray-50 dark:hover:bg-slate-800 ${!msg.read ? "bg-blue-50/50 dark:bg-blue-900/20" : ""}`}
            >
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">
                {msg.name}
              </td>
              <td className="px-4 py-3 text-gray-500 hidden md:table-cell dark:text-slate-400">
                {msg.email}
              </td>
              <td className="px-4 py-3 text-gray-500 hidden lg:table-cell max-w-[120px] truncate dark:text-slate-400">
                {msg.message.slice(0, 50)}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                  className="text-left text-gray-600 max-w-[200px] truncate block hover:text-green-700 cursor-pointer dark:text-slate-300 dark:hover:text-green-400"
                >
                  {expanded === msg.id ? msg.message : msg.message.slice(0, 80)}
                  {msg.message.length > 80 && expanded !== msg.id ? "..." : ""}
                </button>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    msg.read
                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                  }`}
                >
                  {msg.read ? "Lu" : "Non lu"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 hidden sm:table-cell dark:text-slate-400">
                {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {!msg.read && (
                    <button
                      onClick={() => handleMarkRead(msg.id)}
                      disabled={updating === msg.id}
                      className="text-xs text-green-700 hover:underline disabled:opacity-50 cursor-pointer dark:text-green-400 dark:hover:text-green-300"
                    >
                      Marquer lu
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(msg.id)}
                    disabled={updating === msg.id}
                    className="text-xs text-red-600 hover:underline disabled:opacity-50 cursor-pointer dark:text-red-400 dark:hover:text-red-300"
                  >
                    Suppr.
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {messages.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-gray-500 dark:text-slate-400">
                Aucun message.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
