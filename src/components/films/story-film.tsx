"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding.config";
import { useLoc } from "@/state/ui";
import { useMusic } from "@/lib/music";
import { ExpandIcon, PauseIcon, PlayIcon, VolumeIcon } from "@/components/ui/icons";

const SLIDE_MS = 5500;

/** Soft tanpura-style drone generated in the browser, so the preview has music without any audio file. */
function createDrone(): { ctx: AudioContext; gain: GainNode; stop: () => void } | null {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  const base = 138.59; // C#3 as Sa
  const notes = [base, base * 1.5, base * 2, base * 0.5];
  const nodes: OscillatorNode[] = [];
  notes.forEach((f, i) => {
    const osc = ctx.createOscillator();
    osc.type = i === 3 ? "sine" : "triangle";
    osc.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = i === 3 ? 0.35 : 0.12;
    // Slow swell, like plucked tanpura strings
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.18 + i * 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain).connect(g.gain);
    osc.connect(g).connect(master);
    osc.start();
    lfo.start();
    nodes.push(osc, lfo);
  });
  master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2);
  return {
    ctx,
    gain: master,
    stop: () => {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      setTimeout(() => {
        nodes.forEach((n) => n.stop());
        void ctx.close();
      }, 700);
    },
  };
}

export function StoryFilm() {
  const loc = useLoc();
  const reduce = useReducedMotion();
  const slides = useMemo(
    () => [
      { photo: weddingConfig.groom.photo!, title: weddingConfig.groom.name, text: loc(weddingConfig.groom.bio) },
      { photo: weddingConfig.bride.photo!, title: weddingConfig.bride.name, text: loc(weddingConfig.bride.bio) },
      ...weddingConfig.story.map((s) => ({ photo: s.photo, title: loc(s.title), text: s.date })),
      { photo: "/demo/photos/p24.svg", title: "Forever begins", text: weddingConfig.hashtag },
    ],
    [loc],
  );
  const wrap = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const drone = useRef<ReturnType<typeof createDrone>>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [i, setI] = useState(0);
  const [started, setStarted] = useState(false);

  const stopAudio = useCallback(() => {
    audio.current?.pause();
    drone.current?.stop();
    drone.current = null;
  }, []);

  const startAudio = useCallback(() => {
    if (muted) return;
    if (weddingConfig.storyMusic) {
      audio.current ??= new Audio(weddingConfig.storyMusic);
      audio.current.loop = true;
      void audio.current.play().catch(() => setMuted(true));
    } else if (!drone.current) {
      drone.current = createDrone();
    }
  }, [muted]);

  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => {
      if (i + 1 >= slides.length) {
        setPlaying(false);
        stopAudio();
        setI(0);
        setStarted(false);
      } else setI(i + 1);
    }, SLIDE_MS);
    return () => clearTimeout(id);
  }, [playing, i, slides.length, stopAudio]);

  useEffect(() => stopAudio, [stopAudio]);

  useEffect(() => {
    useMusic.getState().hold(playing);
    return () => useMusic.getState().hold(false);
  }, [playing]);

  const toggle = () => {
    // Audio only starts from a tap, which respects browser autoplay rules.
    if (playing) {
      setPlaying(false);
      stopAudio();
    } else {
      setStarted(true);
      setPlaying(true);
      startAudio();
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (next) stopAudio();
    else if (playing) {
      if (weddingConfig.storyMusic) {
        audio.current ??= new Audio(weddingConfig.storyMusic);
        void audio.current.play();
      } else drone.current = createDrone();
    }
  };

  const s = slides[i];
  return (
    <div ref={wrap} className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#1b1210] shadow-card">
      <AnimatePresence mode="sync">
        <motion.div key={i} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
          <motion.img
            src={s.photo}
            alt=""
            className="h-full w-full object-cover"
            initial={{ scale: 1.02, x: 0, y: 0 }}
            animate={playing && !reduce ? { scale: 1.16, x: i % 2 ? -20 : 20, y: i % 3 ? -10 : 10 } : { scale: 1.02 }}
            transition={{ duration: SLIDE_MS / 1000 + 1.2, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          {started && (
            <motion.div className="absolute bottom-16 left-6 right-6 text-white sm:bottom-20 sm:left-10" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
              <p className="font-serif text-3xl sm:text-5xl">{s.title}</p>
              <p className="mt-1 max-w-xl text-sm text-white/85 sm:text-lg">{s.text}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {!started && (
        <button onClick={toggle} className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 text-white" aria-label="Play story film">
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-jasmine/90 text-maroon shadow-xl">
            <PlayIcon size={34} />
          </span>
          <span className="font-serif text-2xl">Our story · {Math.round((slides.length * SLIDE_MS) / 1000)} seconds</span>
          <span className="text-xs text-white/70">Sound on for music</span>
        </button>
      )}

      {started && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3 text-white">
          <button onClick={toggle} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/15" aria-label={playing ? "Pause" : "Play"}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <div className="flex flex-1 gap-1" aria-hidden>
            {slides.map((_, n) => (
              <span key={n} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                <motion.span
                  className="block h-full bg-white"
                  initial={false}
                  animate={{ width: n < i ? "100%" : n === i && playing ? "100%" : n === i ? "50%" : "0%" }}
                  transition={{ duration: n === i && playing ? SLIDE_MS / 1000 : 0.2, ease: "linear" }}
                />
              </span>
            ))}
          </div>
          <button onClick={toggleMute} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/15" aria-label={muted ? "Unmute" : "Mute"}>
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
      )}
    </div>
  );
}
