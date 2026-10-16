"use client";

import { useEffect, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding.config";
import { useMusic } from "@/lib/music";
import { PlayIcon } from "@/components/ui/icons";

export function StoryFilm() {
  const src = weddingConfig.storyMusic; // reuses the video path set in config
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  // Pause background music while video plays; resume when done/paused
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onPlay  = () => useMusic.getState().hold(true);
    const onPause = () => useMusic.getState().hold(false);
    const onEnded = () => { useMusic.getState().hold(false); setStarted(false); };
    el.addEventListener("play",  onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("play",  onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      useMusic.getState().hold(false);
    };
  }, []);

  const play = () => {
    setStarted(true);
    videoRef.current?.play();
  };

  if (!src) return null;

  return (
    <div ref={wrapRef} className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#1b1210] shadow-card">
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-cover"
        controls
        playsInline
        preload="metadata"
        poster={weddingConfig.story[0]?.photo}
      />
      {!started && (
        <button
          onClick={play}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/45 text-white"
          aria-label="Play love story video"
        >
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-jasmine/90 text-maroon shadow-xl">
            <PlayIcon size={34} />
          </span>
          <span className="font-serif text-2xl">Our Love Story</span>
          <span className="text-xs text-white/70">Background music resumes when done</span>
        </button>
      )}
    </div>
  );
}
