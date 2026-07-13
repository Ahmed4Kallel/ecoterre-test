"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Messages contact</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
              </span>
            )}
            {unreadCount === 0 && `${messages.length} message${messages.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Nom</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 hidden md:table-cell">Email</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 hidden lg:table-cell">Message</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Statut</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 hidden sm:table-cell">Date</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {messages.map((msg, idx) => (
                <motion.tr
                  key={msg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.03 * idx }}
                  className={`group hover:bg-gray-50/80 dark:hover:bg-slate-800/50 ${!msg.read ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {!msg.read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />}
                      <span className={`font-medium ${!msg.read ? "text-gray-900 dark:text-slate-100" : "text-gray-700 dark:text-slate-300"}`}>
                        {msg.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 hidden md:table-cell dark:text-slate-400">
                    {msg.email}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <button
                      onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                      className="text-left text-sm text-gray-600 max-w-[240px] transition hover:text-green-700 dark:text-slate-300 dark:hover:text-green-400 cursor-pointer"
                    >
                      <span className="block truncate">
                        {expanded === msg.id ? msg.message : msg.message.slice(0, 80)}
                        {msg.message.length > 80 && expanded !== msg.id ? "..." : ""}
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                        msg.read
                          ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${msg.read ? "bg-green-500" : "bg-blue-500"}`} />
                      {msg.read ? "Lu" : "Non lu"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 hidden sm:table-cell dark:text-slate-400 whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!msg.read && (
                        <button
                          onClick={() => handleMarkRead(msg.id)}
                          disabled={updating === msg.id}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-900/30 cursor-pointer"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Marquer lu
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(msg.id)}
                        disabled={updating === msg.id}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/30 cursor-pointer"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {updating === msg.id ? "..." : "Suppr."}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500 dark:text-slate-400">
                    <svg className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Aucun message.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded message detail */}
      {expanded && messages.find((m) => m.id === expanded) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">Message complet</h3>
            <button
              onClick={() => setExpanded(null)}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-slate-300">
            {messages.find((m) => m.id === expanded)?.message}
          </p>
        </motion.div>
      )}
    </div>
  );
}
