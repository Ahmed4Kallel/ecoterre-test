"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";

interface PodcastPlayerProps {
  audioUrl: string;
  title: string;
  coverImage?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function PodcastPlayer({
  audioUrl,
  title,
  coverImage,
}: PodcastPlayerProps) {
  const { t } = useLocale();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [error, setError] = useState(false);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => setError(true));
    }
    setPlaying(!playing);
  }, [playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      setDuration(audio.duration);
      setError(false);
    };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnd = () => setPlaying(false);
    const onProgress = () => {
      if (audio.buffered.length > 0) {
        setBuffered(
          audio.buffered.end(audio.buffered.length - 1) / audio.duration
        );
      }
    };
    const onAudioError = () => setError(true);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("progress", onProgress);
    audio.addEventListener("error", onAudioError);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("progress", onProgress);
      audio.removeEventListener("error", onAudioError);
    };
  }, []);

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = v;
    setVolume(v);
    setMuted(v === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 shadow-sm dark:border-green-800 dark:from-green-900/30 dark:to-emerald-900/30">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {coverImage && (
          <div className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-xl bg-green-100 shadow dark:bg-green-900/50">
            <motion.img
              src={coverImage}
              alt={title}
              className="h-full w-full object-cover"
              animate={playing ? { scale: [1, 1.02, 1] } : { scale: 1 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0 w-full">
          <p className="mb-3 text-sm font-semibold text-gray-800 truncate dark:text-slate-200">
            {title}
          </p>

          {error ? (
            <p className="text-xs text-red-600 mb-2 dark:text-red-400">
              {t("error_loading_audio")}.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <motion.button
                  onClick={toggle}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-700 text-white shadow transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 cursor-pointer"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  <motion.span
                    animate={{ rotate: playing ? 360 : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    {playing ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </motion.span>
                </motion.button>

                <div className="flex-1 min-w-0">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={currentTime}
                    onChange={seek}
                    className="w-full h-2 rounded-full appearance-none bg-green-200 cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-700 [&::-webkit-slider-thumb]:shadow
                      [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-green-700 [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:border-0"
                    style={{
                      background: `linear-gradient(to right, #15803d 0%, #15803d ${progress}%, #dcfce7 ${progress}%, #dcfce7 100%)`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={toggleMute}
                    whileHover={{ scale: 1.1 }}
                    className="hover:text-green-700 cursor-pointer"
                    aria-label={muted ? "Unmute" : "Mute"}
                  >
                    {muted ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L6.586 15z" />
                      </svg>
                    )}
                  </motion.button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={changeVolume}
                    className="w-16 sm:w-20 h-1.5 rounded-full appearance-none bg-green-200 cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-700"
                  />
                </div>
                <span>{formatTime(duration)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
