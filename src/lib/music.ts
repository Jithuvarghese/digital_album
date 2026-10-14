"use client";

import { create } from "zustand";
import { weddingConfig } from "@/config/wedding.config";

/**
 * Background music with three interchangeable sources:
 * a hidden YouTube player, an mp3 file, or a soft melody generated in the browser.
 * Music only starts from a tap (browser autoplay rules) and pauses while a film plays.
 */

interface Backend {
  play(): void;
  pause(): void;
}

declare global {
  interface Window {
    YT?: { Player: new (el: string, opts: unknown) => { playVideo(): void; pauseVideo(): void; setVolume(v: number): void } };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function youtubeBackend(id: string, start: number, volume: number): Backend {
  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  // Off-screen 1px player: display:none would stop playback in some browsers
  holder.style.cssText = "position:fixed;left:-10px;top:-10px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
  holder.innerHTML = '<div id="album-music"></div>';
  document.body.appendChild(holder);
  let player: { playVideo(): void; pauseVideo(): void; setVolume(v: number): void } | null = null;
  let ready = false;
  let want = false;
  window.onYouTubeIframeAPIReady = () => {
    player = new window.YT!.Player("album-music", {
      width: 1,
      height: 1,
      videoId: id,
      playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: id, start, playsinline: 1, disablekb: 1, rel: 0 },
      events: {
        onReady: () => {
          ready = true;
          player!.setVolume(volume);
          if (want) player!.playVideo();
        },
      },
    });
  };
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
  return {
    play() {
      want = true;
      if (ready) player!.playVideo();
    },
    pause() {
      want = false;
      if (ready) player!.pauseVideo();
    },
  };
}

function fileBackend(src: string, volume: number): Backend {
  const a = new Audio();
  a.loop = true;
  a.volume = volume / 100;
  a.preload = "none";
  a.src = src;
  return { play: () => void a.play().catch(() => {}), pause: () => a.pause() };
}

/** Gentle plucked melody in raga Mohanam (a pentatonic scale) over a soft drone, with an echo for warmth. */
function synthBackend(volume: number): Backend {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let droneNodes: OscillatorNode[] = [];
  let step = 0;
  const sa = 261.63; // C4
  const scale = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3]; // S R G P D
  const notes = [...scale.map((r) => sa * r), ...scale.map((r) => sa * 2 * r)];
  let idx = 2;

  const setup = () => {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.42;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.35;
    const wet = ctx.createGain();
    wet.gain.value = 0.3;
    master.connect(ctx.destination);
    master.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(ctx.destination);
    return true;
  };

  const pluck = (freq: number, at: number, len = 1.6, level = 0.22) => {
    if (!ctx || !master) return;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(level, at + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, at + len);
    const o1 = ctx.createOscillator();
    o1.type = "triangle";
    o1.frequency.value = freq;
    const o2 = ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.value = freq * 2;
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    o1.connect(g).connect(master);
    o2.connect(g2).connect(g);
    o1.start(at);
    o2.start(at);
    o1.stop(at + len + 0.05);
    o2.stop(at + len + 0.05);
  };

  const startDrone = () => {
    if (!ctx || !master) return;
    droneNodes = [sa / 2, (sa / 2) * 1.5, sa].map((f, i) => {
      const o = ctx!.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = ctx!.createGain();
      g.gain.value = i === 0 ? 0.05 : 0.025;
      o.connect(g).connect(master!);
      o.start();
      return o;
    });
  };

  const loop = () => {
    if (!ctx) return;
    // Wander gently up and down the scale, resting now and then
    const move = [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)];
    idx = Math.max(0, Math.min(notes.length - 1, idx + move));
    const now = ctx.currentTime + 0.02;
    if (step % 8 !== 7) pluck(notes[idx], now);
    if (step % 4 === 0) pluck(sa / 2, now, 2.4, 0.1);
    step++;
    timer = setTimeout(loop, [520, 520, 780, 1040][Math.floor(Math.random() * 4)]);
  };

  return {
    play() {
      if (!ctx && !setup()) return;
      void ctx!.resume();
      if (!droneNodes.length) startDrone();
      master!.gain.cancelScheduledValues(ctx!.currentTime);
      master!.gain.linearRampToValueAtTime((volume / 100) * 0.9, ctx!.currentTime + 1.5);
      clearTimeout(timer);
      loop();
    },
    pause() {
      clearTimeout(timer);
      if (!ctx || !master) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(() => void ctx?.suspend(), 600);
    },
  };
}

let backend: Backend | null = null;
function getBackend(): Backend {
  if (backend) return backend;
  const m = weddingConfig.music;
  backend = m.youtubeId ? youtubeBackend(m.youtubeId, m.start, m.volume) : m.file ? fileBackend(m.file, m.volume) : synthBackend(m.volume);
  return backend;
}

interface MusicState {
  on: boolean;
  started: boolean;
  held: boolean;
  start: () => void;
  toggle: () => void;
  hold: (held: boolean) => void;
}

export const useMusic = create<MusicState>((set, get) => ({
  on: false,
  started: false,
  held: false,
  start: () => {
    set({ on: true, started: true });
    if (!get().held) getBackend().play();
  },
  toggle: () => {
    const on = !get().on;
    set({ on, started: true });
    if (on && !get().held) getBackend().play();
    else getBackend().pause();
  },
  /** Pause while a film or video plays, resume afterwards if music was on. */
  hold: (held) => {
    set({ held });
    if (!get().started) return;
    if (held) getBackend().pause();
    else if (get().on) getBackend().play();
  },
}));
