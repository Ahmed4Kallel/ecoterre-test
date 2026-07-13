"use client";

import type { Metadata } from "next";
import ErrorMessage from "@/components/ui/ErrorMessage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "خطأ" : "Erreur",
    description:
      locale === "ar" ? "حدث خطأ غير متوقع" : "Une erreur inattendue s'est produite",
  };
}

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <ErrorMessage
        message={
          error.message && error.message !== "undefined"
            ? error.message
            : undefined
        }
        onRetry={reset}
      />
    </div>
  );
}
