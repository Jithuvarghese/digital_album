"use client";

import { useRef, useState } from "react";
import { ExpandIcon, PauseIcon, PlayIcon, VolumeIcon } from "@/components/ui/icons";

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

/** Minimal custom video player: play, pause, seek, mute and fullscreen. */
export function VideoPlayer({ src, poster, title }: { src: string; poster: string; title: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  return (
    <div ref={wrap} className="group relative overflow-hidden rounded-2xl bg-black shadow-card">
      <video
        ref={video}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        className="aspect-video w-full"
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        aria-label={title}
      />
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
        <button onClick={toggle} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/15" aria-label={playing ? "Pause" : "Play"}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <span className="w-20 text-xs tabular-nums">
          {fmt(time)} / {fmt(duration)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(e) => {
            if (video.current) video.current.currentTime = Number(e.target.value);
          }}
          className="h-11 flex-1 accent-[rgb(var(--c-gold))]"
          aria-label="Seek"
        />
        <button
          onClick={() => {
            if (video.current) video.current.muted = !muted;
            setMuted(!muted);
          }}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/15"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          <VolumeIcon muted={muted} />
        </button>
        <button
          onClick={() => (document.fullscreenElement ? void document.exitFullscreen() : void wrap.current?.requestFullscreen?.())}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/15"
          aria-label="Fullscreen"
        >
          <ExpandIcon />
        </button>
      </div>
    </div>
  );
}
