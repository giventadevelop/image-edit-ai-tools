'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Ambient hero MP4. Chrome often mishandles video-only MP4s; re-encode with silent AAC.
 * Loops via `ended` → seek 0 + play; recovers stuck playback.
 * @see documentation/r-and-b-productions/HERO_VIDEO_GEMINI_VEO3_PROMPT_AND_WEB_ENCODING.html
 */
type Props = {
  src: string;
  poster: string;
  className?: string;
};

export function CircleHome6HeroVideo({ src, poster, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  const playIfPaused = useCallback((video: HTMLVideoElement) => {
    video.muted = true;
    video.defaultMuted = true;
    if (video.paused) {
      const p = video.play();
      if (p !== undefined) void p.catch(() => {});
    }
  }, []);

  const restartFromStart = useCallback((video: HTMLVideoElement) => {
    video.muted = true;
    video.defaultMuted = true;
    video.currentTime = 0;
    const p = video.play();
    if (p !== undefined) void p.catch(() => {});
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    playIfPaused(v);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') playIfPaused(v);
    };

    const onEnded = () => restartFromStart(v);

    document.addEventListener('visibilitychange', onVisibility);
    v.addEventListener('ended', onEnded);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      v.removeEventListener('ended', onEnded);
    };
  }, [playIfPaused, restartFromStart]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    let lastT = -1;
    let stuckMs = 0;
    const tickMs = 400;

    const iv = window.setInterval(() => {
      if (v.paused || v.seeking) {
        lastT = v.currentTime;
        stuckMs = 0;
        return;
      }
      if (v.ended) {
        lastT = -1;
        stuckMs = 0;
        return;
      }

      const t = v.currentTime;
      const dur = v.duration;
      if (!Number.isFinite(dur) || dur <= 0) return;

      if (lastT >= 0 && Math.abs(t - lastT) < 0.002) {
        stuckMs += tickMs;
        if (stuckMs >= 1200) {
          stuckMs = 0;
          if (t >= dur - 0.3) {
            restartFromStart(v);
          } else {
            v.currentTime = Math.min(t + 0.05, dur - 0.02);
            void v.play().catch(() => {});
          }
        }
      } else {
        stuckMs = 0;
      }
      lastT = t;
    }, tickMs);

    return () => window.clearInterval(iv);
  }, [restartFromStart]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      poster={poster}
      aria-hidden
    />
  );
}
