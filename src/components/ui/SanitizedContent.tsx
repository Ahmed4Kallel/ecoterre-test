"use client";

import DOMPurify from "dompurify";

interface SanitizedContentProps {
  html: string;
  className?: string;
}

const ALLOWED_TAGS = [
  "a", "abbr", "acronym", "b", "blockquote", "br", "caption", "cite",
  "code", "col", "colgroup", "dd", "del", "div", "dl", "dt", "em",
  "figure", "figcaption", "h1", "h2", "h3", "h4", "h5", "h6", "hr",
  "i", "img", "ins", "li", "mark", "ol", "p", "picture", "pre", "q",
  "s", "small", "source", "span", "strike", "strong", "sub", "sup",
  "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul", "video",
];

export default function SanitizedContent({ html, className }: SanitizedContentProps) {
  const clean = html ? DOMPurify.sanitize(html, { ALLOWED_TAGS }) : "";

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
