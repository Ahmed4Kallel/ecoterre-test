export function formatDate(
  dateStr: string | undefined | null,
  locale: "fr" | "ar"
): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(
    locale === "ar" ? "ar-TN" : "fr-TN",
    { year: "numeric", month: "long", day: "numeric" }
  );
}
