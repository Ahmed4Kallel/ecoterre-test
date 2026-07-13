"use client";

import { useMemo } from "react";

interface YouTubeEmbedProps {
  html: string;
}

const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(?:[&?][^\s<"]*)?/g;
const YOUTUBE_SHORT_REGEX = /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/g;

const YOUTUBE_IFRAME_TEMPLATE = (videoId: string) =>
  `<div class="youtube-embed my-6"><div class="relative w-full" style="padding-bottom:56.25%"><iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/${videoId}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" style="border:0"></iframe></div></div>`;

export default function YouTubeEmbed({ html }: YouTubeEmbedProps) {
  const processedHtml = useMemo(() => {
    if (!html) return html;

    let result = html;

    const urls = new Set<string>();
    let match: RegExpExecArray | null;

    const standardRegex = new RegExp(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(?:[&?][^\s<"]*)?/g
    );

    while ((match = standardRegex.exec(result)) !== null) {
      urls.add(match[1]);
    }

    for (const videoId of urls) {
      const regex = new RegExp(
        `(?:<p>)?\\s*(?:https?:\\/\\/)?(?:www\\.)?(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/|youtube\\.com\\/embed\\/)${videoId}(?:[&?][^\\s<"]*)?\\s*(?:<\\/p>)?`,
        "gi"
      );
      result = result.replace(regex, () => YOUTUBE_IFRAME_TEMPLATE(videoId));
    }

    return result;
  }, [html]);

  return (
    <div
      className="youtube-content"
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}
