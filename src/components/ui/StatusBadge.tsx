interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  published: { bg: "bg-green-100", text: "text-green-800", label: "Publié" },
  draft: { bg: "bg-amber-100", text: "text-amber-800", label: "Brouillon" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "En attente" },
  approved: { bg: "bg-blue-100", text: "text-blue-800", label: "Approuvé" },
  rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejeté" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
