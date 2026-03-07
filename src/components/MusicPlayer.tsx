"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Shuffle,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Music,
} from "lucide-react";

type PlayerState = "paused" | "playing" | "loading";
const BARS = [0, 1, 2, 3, 4];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function MusicPlayer() {
  const [state, setState] = React.useState<PlayerState>("paused");

  // Duration
  const DURATION = 3 * 60 + 45;

  // Timer
  const [currentSec, setCurrentSec] = React.useState(0);

  // currentSec
  const [progress, setProgress] = React.useState(0.33);

  const [volume, setVolume] = React.useState(0.55);
  const [volumeHover, setVolumeHover] = React.useState(false);

  // Mute toggle
  const [muted, setMuted] = React.useState(false);
  const prevVolumeRef = React.useRef(volume);

  const isPlaying = state === "playing";
  const isLoading = state === "loading";

  // volume disabled effect (aktif hanya saat playing)
  const isVolumeDisabled = state !== "playing";

  const toggleTimerRef = React.useRef<number | null>(null);
  const progressTimerRef = React.useRef<number | null>(null);

  // ref + state untuk drag volume
  const volumeTrackRef = React.useRef<HTMLDivElement | null>(null);
  const [volumeTrackWidth, setVolumeTrackWidth] = React.useState(0);

  const containerVariants = React.useMemo(
    () => ({
      paused: {
        backgroundColor: "rgba(12, 12, 14, 0.90)",
        boxShadow: "0px 24px 70px rgba(0,0,0,0.55)",
      },
      loading: {
        backgroundColor: "rgba(12, 12, 14, 0.90)",
        boxShadow: "0px 24px 70px rgba(0,0,0,0.55)",
      },
      playing: {
        backgroundColor: "rgba(12, 12, 14, 0.90)",
        boxShadow:
          "0px 24px 70px rgba(0,0,0,0.55), 0px 0px 80px rgba(168, 85, 247, 0.28)",
      },
    }),
    [],
  );

  const albumVariants = React.useMemo(
    () => ({
      paused: { scale: 0.95 },
      loading: { scale: 0.9 },
      playing: { scale: 1 },
    }),
    [],
  );

  const eqGroupVariants = React.useMemo(
    () => ({
      paused: { opacity: 1 },
      loading: { opacity: 0.5 },
      playing: { opacity: 1 },
    }),
    [],
  );

  const onToggle = React.useCallback(() => {
    if (isLoading) return;

    const next: PlayerState = state === "playing" ? "paused" : "playing";
    setState("loading");

    if (toggleTimerRef.current) window.clearTimeout(toggleTimerRef.current);
    toggleTimerRef.current = window.setTimeout(() => {
      setState(next);
    }, 500);
  }, [isLoading, state]);

  // Update currentSec + progress
  React.useEffect(() => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    if (state === "playing") {
      const stepMs = 250;
      progressTimerRef.current = window.setInterval(() => {
        setCurrentSec((t) => {
          const next = t + stepMs / 1000;
          if (next >= DURATION) return 0; // loop
          return next;
        });
      }, stepMs);
    }

    return () => {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [state, DURATION]);

  React.useEffect(() => {
    setProgress(DURATION > 0 ? clamp(currentSec / DURATION, 0, 1) : 0);
  }, [currentSec, DURATION]);

  React.useEffect(() => {
    return () => {
      if (toggleTimerRef.current) window.clearTimeout(toggleTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (volume > 0) prevVolumeRef.current = volume;
    setMuted(volume === 0);
  }, [volume]);

  const toggleMute = React.useCallback(() => {
    if (isVolumeDisabled || isLoading) return;

    setMuted((m) => {
      const next = !m;

      if (next) {
        if (volume > 0) prevVolumeRef.current = volume;
        setVolume(0);
      } else {
        setVolume(prevVolumeRef.current || 0.55);
      }

      return next;
    });
  }, [isVolumeDisabled, isLoading, volume]);

  React.useEffect(() => {
    const el = volumeTrackRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      setVolumeTrackWidth(el.getBoundingClientRect().width);
    });
    ro.observe(el);

    // initial
    setVolumeTrackWidth(el.getBoundingClientRect().width);

    return () => ro.disconnect();
  }, []);

  const progressPct = Math.round(clamp(progress, 0, 1) * 100);
  const volumePct = Math.round(clamp(volume, 0, 1) * 100);

  const purple = "var(--color-purple-500)";
  const grayTrack = "rgba(255,255,255,0.10)";
  const grayText = "rgba(255,255,255,0.55)";
  const grayTextDim = "rgba(255,255,255,0.35)";

  const progressFill = state === "playing" ? purple : "rgba(255,255,255,0.35)";
  const playBtnBg = state === "loading" ? "rgba(255,255,255,0.22)" : purple;

  const thumbX = React.useMemo(() => {
    if (!volumeTrackWidth) return 0;
    return clamp(volume, 0, 1) * volumeTrackWidth;
  }, [volume, volumeTrackWidth]);

  // apply volume
  const applyVolumeFromX = React.useCallback(
    (x: number) => {
      if (!volumeTrackWidth) return;
      const v = clamp(x / volumeTrackWidth, 0, 1);

      if (v > 0 && muted) setMuted(false);

      setVolume(v);
    },
    [volumeTrackWidth, muted],
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-500">
          <motion.div
            className="rounded-16 p-16 bg-(--color-black-alt-300)"
            variants={containerVariants}
            animate={state}
            transition={{ duration: 0.3 }}
          >
            {/* Top: Artwork + meta */}
            <div className="flex gap-10 md:gap-24 flex-col md:flex-row">
              {/* Artwork */}
              {/* Artwork */}
              <motion.div
                className="relative h-120 w-120 rounded-16 overflow-hidden shrink-0"
                variants={albumVariants}
                animate={state}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                style={{
                  background:
                    state === "loading"
                      ? "linear-gradient(145deg, rgba(168,85,247,0.95), rgba(88,28,135,0.95))"
                      : "linear-gradient(135deg, var(--color-purple-500), #ff2d96)",
                  boxShadow:
                    state === "loading"
                      ? "inset 0px 1px 0px rgba(255,255,255,0.10), inset 0px -10px 30px rgba(0,0,0,0.25)"
                      : undefined,
                  willChange: "transform",
                }}
              >
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music
                      className="w-48 h-48"
                      style={{
                        color: "rgba(0,0,0,0.45)",
                        filter: "drop-shadow(0px 6px 10px rgba(0,0,0,0.35))",
                      }}
                    />
                  </div>
                ) : (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                    transition={
                      isPlaying
                        ? { duration: 20, ease: "linear", repeat: Infinity }
                        : { duration: 0.3, ease: "easeOut" }
                    }
                    style={{ willChange: "transform" }}
                  >
                    <div className="flex items-center justify-center">
                      <Music className="w-48 h-48 text-black" />
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Text + Equalizer */}
              <div className="flex-1 min-w-0 md:mt-26 mt-0">
                <div className="text-lg font-semibold color-(--color-white-alt) truncate">
                  Awesome Song Title
                </div>
                <div
                  className="mt-8 text-sm color-(--color-gray-alt) truncate"
                  style={{ color: grayText }}
                >
                  Amazing Artist
                </div>

                {/* Equalizer  */}
                <motion.div
                  className="mt-16 flex items-end gap-4 h-32"
                  variants={eqGroupVariants}
                  animate={state}
                  transition={{ duration: 0.3 }}
                >
                  {BARS.map((i) => {
                    const delay = i * 0.1;

                    const pausedPx = 6;
                    const loadingPx = 16;

                    const ranges = [
                      { min: 10, max: 32 },
                      { min: 8, max: 24 },
                      { min: 6, max: 18 },
                      { min: 10, max: 28 },
                      { min: 8, max: 22 },
                    ];

                    const r = ranges[i] ?? { min: 8, max: 24 };

                    const isPlaying = state === "playing";
                    const isLoading = state === "loading";

                    return (
                      <motion.div
                        key={i}
                        className="w-8"
                        style={{
                          background: "var(--color-purple-700)",
                          willChange: "height",
                        }}
                        animate={
                          isPlaying
                            ? { height: [r.min, r.max] }
                            : { height: isLoading ? loadingPx : pausedPx }
                        }
                        transition={
                          isPlaying
                            ? {
                                duration: 0.5,
                                ease: "easeInOut",
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay,
                              }
                            : {
                                duration: 0.3,
                                ease: "easeOut",
                              }
                        }
                      />
                    );
                  })}
                </motion.div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-20">
              <div
                className="h-8 w-full rounded-full overflow-hidden"
                style={{ background: grayTrack }}
              >
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ background: progressFill, willChange: "width" }}
                />
              </div>

              <div className="mt-20 mb-20 flex items-center justify-between text-xs">
                <span style={{ color: grayText }}>
                  {formatTime(currentSec)}
                </span>
                <span style={{ color: grayTextDim }}>
                  {formatTime(DURATION)}
                </span>
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-center gap-32 ">
              <IconBtn disabled={isLoading} label="Shuffle">
                <Shuffle className="w-20 h-20" />
              </IconBtn>

              <IconBtn disabled={isLoading} label="Previous">
                <SkipBack className="w-20 h-20" />
              </IconBtn>

              {/* Main play/pause */}
              <motion.button
                onClick={onToggle}
                disabled={isLoading}
                className="w-56 h-56 rounded-full flex items-center justify-center"
                whileHover={!isLoading ? { scale: 1.05 } : undefined}
                whileTap={!isLoading ? { scale: 0.95 } : undefined}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                style={{
                  background: playBtnBg,

                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.85 : 1,
                  willChange: "transform",
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isPlaying ? (
                    <motion.span
                      key="pause"
                      initial={{ opacity: 0, scale: 0.9, y: 2 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -2 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      style={{ display: "inline-flex" }}
                    >
                      <Pause className="w-20 h-20 text-white/90" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="play"
                      initial={{ opacity: 0, scale: 0.9, y: 2 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -2 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      style={{ display: "inline-flex" }}
                    >
                      <Play className="w-20 h-20 text-white/90" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <IconBtn disabled={isLoading} label="Next">
                <SkipForward className="w-20 h-20" />
              </IconBtn>

              <IconBtn disabled={isLoading} label="Repeat">
                <Repeat className="w-20 h-20" />
              </IconBtn>
            </div>

            {/* Volume */}
            <div className="mt-20 flex items-center gap-8">
              {/* Volume toggle mute + disabled effect */}
              <motion.button
                type="button"
                onClick={toggleMute}
                disabled={isVolumeDisabled || isLoading}
                aria-label={muted ? "Unmute" : "Mute"}
                whileHover={
                  !isVolumeDisabled && !isLoading
                    ? { scale: 1.05, opacity: 1 }
                    : undefined
                }
                whileTap={
                  !isVolumeDisabled && !isLoading ? { scale: 0.95 } : undefined
                }
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor:
                    isVolumeDisabled || isLoading ? "not-allowed" : "pointer",
                  opacity: isVolumeDisabled || isLoading ? 0.45 : 1,
                }}
              >
                {muted ? (
                  <VolumeX
                    className="w-20 h-20"
                    style={{ color: grayTextDim }}
                  />
                ) : (
                  <Volume2
                    className="w-20 h-20"
                    style={{ color: grayTextDim }}
                  />
                )}
              </motion.button>

              {/* Track drag volume */}
              <div
                ref={volumeTrackRef}
                className="relative flex-1 h-56 flex items-center"
                onMouseEnter={() =>
                  !isVolumeDisabled && !isLoading && setVolumeHover(true)
                }
                onMouseLeave={() => setVolumeHover(false)}
                style={{
                  opacity: isVolumeDisabled || isLoading ? 0.45 : 1,
                  pointerEvents:
                    isVolumeDisabled || isLoading ? "none" : "auto",
                }}
                onPointerDown={(e) => {
                  if (isVolumeDisabled || isLoading) return;
                  const rect = (
                    e.currentTarget as HTMLDivElement
                  ).getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  applyVolumeFromX(x);
                }}
              >
                <div
                  className="absolute left-0 right-0 h-4 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                />

                <motion.div
                  className="absolute left-0 h-4 rounded-full"
                  animate={{
                    width: `${volumePct}%`,
                    backgroundColor: volumeHover
                      ? purple
                      : "rgba(255,255,255,0.30)",
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ willChange: "width, background-color" }}
                />

                {/* Thumb (invisible but draggable) */}
                <motion.div
                  drag="x"
                  dragElastic={0}
                  dragMomentum={false}
                  dragConstraints={{
                    left: 0,
                    right: Math.max(0, volumeTrackWidth),
                  }}
                  onDrag={(_, info) => {
                    const rect =
                      volumeTrackRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const x = info.point.x - rect.left;
                    applyVolumeFromX(x);
                  }}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{
                    x: thumbX,
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: "transparent",
                    cursor: "grab",
                  }}
                  whileTap={{ cursor: "grabbing" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  disabled,
  label,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      aria-label={label}
      className="flex items-center justify-center"
      whileHover={!disabled ? { scale: 1.05, opacity: 1 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      style={{
        background: "transparent",
        border: "none",
        color: disabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.70)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}
