import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="mb-2 text-6xl font-bold text-green-800">404</h1>
      <p className="mb-1 text-xl font-semibold text-gray-900">
        Page non trouvée
      </p>
      <p className="mb-8 text-lg text-gray-600">الصفحة غير موجودة</p>
      <div className="flex gap-4">
        <Link
          href="/fr"
          className="rounded-md bg-green-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/ar"
          className="rounded-md bg-blue-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-800"
        >
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
}
