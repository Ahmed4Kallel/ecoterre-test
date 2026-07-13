import "server-only";

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function isValidPassword(
  password: string
): { valid: boolean; message?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required" };
  }
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true };
}

export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

export function sanitizeFilename(name: string): string {
  if (!name || typeof name !== "string") return "file";
  let sanitized = name
    .replace(/\.\./g, "")
    .replace(/[\\/]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  if (!sanitized || sanitized === ".") sanitized = "file";
  if (sanitized.length > 200) sanitized = sanitized.slice(0, 200);
  return sanitized;
}

export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const BLOCKED_EXTENSIONS = [
  ".php", ".phtml", ".pht", ".php3", ".php4", ".php5", ".php7", ".php8",
  ".asp", ".aspx", ".ashx", ".asmx", ".ascx", ".asmx",
  ".jsp", ".jspx", ".jspf",
  ".cgi", ".pl", ".py", ".rb",
  ".exe", ".dll", ".bat", ".cmd", ".sh", ".ps1",
  ".htaccess", ".htpasswd",
];

export function isSafeFileExtension(filename: string): boolean {
  if (!filename) return false;
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return !BLOCKED_EXTENSIONS.includes(ext);
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

export function sanitizeHtmlInput(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").trim();
}
