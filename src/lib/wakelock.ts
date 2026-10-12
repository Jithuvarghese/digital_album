/** Keeps the screen awake (venue display). Re-acquires the lock when the tab becomes visible again. */
export function keepAwake(): () => void {
  if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return () => {};
  let lock: WakeLockSentinel | null = null;
  let stopped = false;

  const acquire = async () => {
    try {
      if (!stopped && document.visibilityState === "visible") lock = await navigator.wakeLock.request("screen");
    } catch {
      /* not allowed (e.g. battery saver); the screen may sleep */
    }
  };
  const onVisible = () => {
    if (document.visibilityState === "visible") void acquire();
  };

  void acquire();
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    stopped = true;
    document.removeEventListener("visibilitychange", onVisible);
    void lock?.release().catch(() => {});
  };
}

export function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.().catch(() => {});
}
