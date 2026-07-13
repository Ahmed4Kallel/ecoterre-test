"use client";

import { useState, useCallback, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import type { Article, Category } from "@/lib/types";

interface ArticleEditorProps {
  article?: Article;
  categories: Category[];
}

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const inputVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay, duration: 0.3, ease: "easeOut" as const },
  }),
};

export default function ArticleEditor({ article, categories }: ArticleEditorProps) {
  const router = useRouter();
  const isEdit = !!article;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [titleFr, setTitleFr] = useState(article?.title.fr || "");
  const [titleAr, setTitleAr] = useState(article?.title.ar || "");
  const [excerptFr, setExcerptFr] = useState(article?.excerpt.fr || "");
  const [excerptAr, setExcerptAr] = useState(article?.excerpt.ar || "");
  const [coverImage, setCoverImage] = useState(article?.coverImage || "");
  const [videoUrl, setVideoUrl] = useState(article?.videoUrl || "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    article?.categoryIds || []
  );
  const [status, setStatus] = useState<"draft" | "published">(
    article?.status || "draft"
  );
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const editorFr = useEditor({
    extensions: [
      StarterKit,
      Image,
      LinkExtension.configure({ openOnClick: false }),
    ],
    content: article?.content.fr || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
  });

  const editorAr = useEditor({
    extensions: [
      StarterKit,
      Image,
      LinkExtension.configure({ openOnClick: false }),
    ],
    content: article?.content.ar || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3 dir-rtl",
      },
    },
  });

  const handleImageUpload = useCallback(
    (editor: ReturnType<typeof useEditor>) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file || !editor) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          if (!res.ok) throw new Error("Upload failed");
          const data = await res.json();
          editor.chain().focus().setImage({ src: data.url }).run();
        } catch {
          alert("Erreur lors du téléversement de l'image");
        }
      };
      input.click();
    },
    []
  );

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setCoverImage(data.url);
    } catch {
      alert("Erreur lors du téléversement de la couverture");
    } finally {
      setUploadingCover(false);
    }
  }

  function toggleCategory(catId: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!titleFr.trim()) {
      setError("Le titre français est requis");
      return;
    }

    if (!editorFr?.getHTML()) {
      setError("Le contenu français est requis");
      return;
    }

    setSaving(true);

    const payload = {
      title: { fr: titleFr, ar: titleAr },
      content: {
        fr: editorFr?.getHTML() || "",
        ar: editorAr?.getHTML() || "",
      },
      excerpt: { fr: excerptFr, ar: excerptAr },
      coverImage: coverImage || undefined,
      videoUrl: videoUrl || undefined,
      categoryIds: selectedCategoryIds,
      status,
    };

    try {
      const url = isEdit ? `/api/articles/${article!.id}` : "/api/articles";
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

      router.push("/admin/articles");
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Modifier l'article" : "Nouvel article"}
        </h1>
        <Button
          variant="outline"
          size="sm"
          href="/admin/articles"
        >
          ← Retour
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <motion.div
          className="grid gap-6 rounded-lg border border-gray-200 bg-white p-6 lg:grid-cols-2"
          variants={inputVariants}
          custom={0}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre (Français) <span className="text-red-500">*</span>
            </label>
            <input
              value={titleFr}
              onChange={(e) => setTitleFr(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
              placeholder="Titre en français"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre (Arabe)
            </label>
            <input
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none text-right"
              placeholder="العنوان بالعربية"
              dir="rtl"
            />
          </div>
        </motion.div>

        <motion.div
          className="grid gap-6 rounded-lg border border-gray-200 bg-white p-6 lg:grid-cols-2"
          variants={inputVariants}
          custom={0.1}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extrait (Français)
            </label>
            <textarea
              value={excerptFr}
              onChange={(e) => setExcerptFr(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none resize-y"
              placeholder="Bref résumé de l'article en français"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extrait (Arabe)
            </label>
            <textarea
              value={excerptAr}
              onChange={(e) => setExcerptAr(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none resize-y text-right"
              placeholder="ملخص المقال بالعربية"
              dir="rtl"
            />
          </div>
        </motion.div>

        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-2">
            <span className="text-sm font-medium text-gray-700">
              Contenu (Français) <span className="text-red-500">*</span>
            </span>
          </div>
          <EditorToolbar
            editor={editorFr}
            onImageUpload={() => handleImageUpload(editorFr)}
          />
          <EditorContent editor={editorFr} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-2">
            <span className="text-sm font-medium text-gray-700">
              Contenu (Arabe)
            </span>
          </div>
          <EditorToolbar
            editor={editorAr}
            onImageUpload={() => handleImageUpload(editorAr)}
          />
          <EditorContent editor={editorAr} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image de couverture
          </label>
          <div className="flex items-center gap-4">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
            >
              {uploadingCover ? "Téléversement..." : "Choisir une image"}
            </Button>
            {coverImage && (
              <div className="flex items-center gap-2">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="h-12 w-12 rounded object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="text-xs text-red-600 hover:underline"
                >
                  Retirer
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vidéo YouTube
          </label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="mt-1 text-xs text-gray-400">
            Lien YouTube à afficher sur l&apos;article
          </p>
        </div>

        <div className="grid gap-6 rounded-lg border border-gray-200 bg-white p-6 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCategoryIds.includes(cat.id)
                      ? "bg-green-800 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.name.fr}
                </button>
              ))}
            </div>
            {selectedCategoryIds.length === 0 && (
              <p className="mt-2 text-xs text-gray-400">
                Sélectionnez au moins une catégorie
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus("draft")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  status === "draft"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Brouillon
              </button>
              <button
                type="button"
                onClick={() => setStatus("published")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  status === "published"
                    ? "bg-green-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Publié
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" href="/admin/articles">
            Annuler
          </Button>
          <Button type="submit" disabled={saving} size="lg">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

function EditorToolbar({
  editor,
  onImageUpload,
}: {
  editor: ReturnType<typeof useEditor>;
  onImageUpload: () => void;
}) {
  if (!editor) return null;

  const btnClass =
    "rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors";
  const activeClass = "bg-gray-200 text-green-800";

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 px-2 py-1.5 bg-gray-50">
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${btnClass} ${editor.isActive("bold") ? activeClass : ""}`}
        title="Gras"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 11h4.5a2.5 2.5 0 000-5H8v5zm8 4.5a2.5 2.5 0 00-2.5-2.5H8v5h5.5a2.5 2.5 0 002.5-2.5z" />
        </svg>
      </motion.button>
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${btnClass} ${editor.isActive("italic") ? activeClass : ""}`}
        title="Italique"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 5v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V5z" />
        </svg>
      </motion.button>
      <span className="mx-1 text-gray-300">|</span>
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${btnClass} text-xs font-bold ${
          editor.isActive("heading", { level: 2 }) ? activeClass : ""
        }`}
        title="Titre 2"
      >
        H2
      </motion.button>
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${btnClass} text-xs font-bold ${
          editor.isActive("heading", { level: 3 }) ? activeClass : ""
        }`}
        title="Titre 3"
      >
        H3
      </motion.button>
      <span className="mx-1 text-gray-300">|</span>
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${btnClass} ${editor.isActive("bulletList") ? activeClass : ""}`}
        title="Liste à puces"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.67 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
        </svg>
      </motion.button>
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${btnClass} ${editor.isActive("orderedList") ? activeClass : ""}`}
        title="Liste numérotée"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 5h2V3H3v2zm0 4h2V7H3v2zm0 4h2v-2H3v2zm0 4h2v-2H3v2zm2 2H3v2h2v-2zm17-10H7v2h15V9zm0 6H7v2h15v-2zm0-10H7v2h15V5z" />
        </svg>
      </motion.button>
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${btnClass} ${editor.isActive("blockquote") ? activeClass : ""}`}
        title="Citation"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
        </svg>
      </motion.button>
      <span className="mx-1 text-gray-300">|</span>
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onImageUpload}
        className={btnClass}
        title="Image"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </motion.button>
    </div>
  );
}
