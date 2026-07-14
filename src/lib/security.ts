import "server-only";

import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "a",
  "abbr",
  "acronym",
  "b",
  "blockquote",
  "br",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "dd",
  "del",
  "div",
  "dl",
  "dt",
  "em",
  "figure",
  "figcaption",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "ins",
  "li",
  "mark",
  "ol",
  "p",
  "picture",
  "pre",
  "q",
  "s",
  "small",
  "source",
  "span",
  "strike",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
  "video",
];

const ALLOWED_ATTR = [
  "accept",
  "action",
  "align",
  "alt",
  "bgcolor",
  "border",
  "cellpadding",
  "cellspacing",
  "cite",
  "class",
  "color",
  "cols",
  "colspan",
  "controls",
  "coords",
  "data-*",
  "datetime",
  "dir",
  "disabled",
  "download",
  "height",
  "href",
  "hreflang",
  "id",
  "lang",
  "loading",
  "media",
  "method",
  "name",
  "poster",
  "preload",
  "rel",
  "reversed",
  "rows",
  "rowspan",
  "scope",
  "shape",
  "sizes",
  "span",
  "src",
  "srcset",
  "start",
  "style",
  "tabindex",
  "target",
  "title",
  "type",
  "width",
];

const FORBID_ATTR = ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"];

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_ATTR,
    ALLOW_DATA_ATTR: true,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    KEEP_CONTENT: true,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false,
  });
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const URL_RE = /^https?:\/\/.+/;

export function validateInput(input: string, type: "email" | "text" | "url" | "slug"): boolean {
  if (!input || typeof input !== "string") return false;

  switch (type) {
    case "email":
      return EMAIL_RE.test(input) && input.length <= 254;
    case "url":
      return URL_RE.test(input) && input.length <= 2048;
    case "slug":
      return SLUG_RE.test(input) && input.length <= 200;
    case "text":
      return input.trim().length > 0 && input.length <= 50000;
    default:
      return false;
  }
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function generateCsrfToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const values = new Uint32Array(32);
  crypto.getRandomValues(values);
  for (let i = 0; i < 32; i++) {
    result += chars[values[i] % chars.length];
  }
  return result;
}

export function validateCsrfToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  if (token.length !== storedToken.length) return false;

  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  return result === 0;
}
