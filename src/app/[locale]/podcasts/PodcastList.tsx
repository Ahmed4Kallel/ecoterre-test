"use client";

import { useState } from "react";
import type { Article } from "@/lib/types";
import PodcastCard from "@/components/podcasts/PodcastCard";
import PodcastPlayer from "@/components/podcasts/PodcastPlayer";

interface PodcastListProps {
  podcasts: Article[];
  locale: string;
}

export default function PodcastList({ podcasts, locale }: PodcastListProps) {
  const [activePodcast, setActivePodcast] = useState<Article | null>(null);

  return (
    <div className="space-y-6">
      {activePodcast && activePodcast.audioUrl && (
        <PodcastPlayer
          audioUrl={activePodcast.audioUrl}
          title={activePodcast.title[locale as "fr" | "ar"]}
          coverImage={activePodcast.coverImage}
        />
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {podcasts.map((podcast) => (
          <PodcastCard
            key={podcast.id}
            podcast={podcast}
            locale={locale}
            onPlay={setActivePodcast}
          />
        ))}
      </div>
    </div>
  );
}
