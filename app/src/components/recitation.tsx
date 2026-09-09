"use client";

import { useRef, useState } from "react";

import { resolveAyahAtTime } from "@/lib/recitation";
import type { AudioDescriptor, AyahKey, ReadingPageRow } from "@/lib/spread";

/**
 * The interactive half of the Reading Page: the play control, the one audio
 * element for this Spread, and the ayah list whose rows are tappable.
 *
 * It owns play state and the currently recited ayah. The highlight is derived
 * from the audio element's own `currentTime` on every `timeupdate` (about four
 * a second) against the Spread's segment list, so there is no second clock to
 * drift against the recitation.
 *
 * The audio file is one whole surah on Tarteel's CDN — up to 90 MB for
 * Al-Baqarah — so it is never fetched until the reader asks for it:
 * `preload="metadata"` fetches only the header the browser needs to seek. There
 * is deliberately no `crossOrigin` attribute, because the CDN sends no CORS
 * headers and setting one makes the request fail outright.
 */
export function Recitation({
  rows,
  audio,
}: {
  rows: ReadingPageRow[];
  audio: AudioDescriptor;
}) {
  const elementRef = useRef<HTMLAudioElement>(null);
  /**
   * A seek asked for before the browser has the file's metadata. Setting
   * `currentTime` at `readyState === 0` is ignored, so it is replayed on
   * `loadedmetadata`.
   */
  const pendingSeekMsRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahKey, setCurrentAyahKey] = useState<AyahKey | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  function seekTo(element: HTMLAudioElement, timeMs: number) {
    if (element.readyState === HTMLMediaElement.HAVE_NOTHING) {
      pendingSeekMsRef.current = timeMs;
    } else {
      pendingSeekMsRef.current = null;
      element.currentTime = timeMs / 1000;
    }
    setCurrentAyahKey(resolveAyahAtTime(audio.segments, timeMs));
  }

  function play(element: HTMLAudioElement) {
    void element.play().catch(() => {
      // A rejected play() is an autoplay block or a load failure; either way
      // the reader gets the quiet message rather than a stuck control.
      setIsPlaying(false);
      setHasFailed(true);
    });
  }

  function togglePlayback() {
    const element = elementRef.current;
    if (!element) return;

    if (isPlaying) {
      element.pause();
      return;
    }

    // Playback always starts inside this Spread: from wherever it was paused,
    // or from the Spread's first ayah when the playhead sits outside it (a
    // fresh page, or the end reached on the last run).
    const timeMs = element.currentTime * 1000;
    if (
      pendingSeekMsRef.current === null &&
      (timeMs < audio.startMs || timeMs >= audio.endMs)
    ) {
      seekTo(element, audio.startMs);
    }
    play(element);
  }

  function playFromAyah(ayahKey: AyahKey) {
    const element = elementRef.current;
    if (!element) return;

    const segment = audio.segments.find((each) => each.ayahKey === ayahKey);
    if (!segment) return;

    seekTo(element, segment.startMs);
    play(element);
  }

  function handleTimeUpdate() {
    const element = elementRef.current;
    if (!element) return;
    // Times before a pending seek lands describe the wrong part of the surah.
    if (pendingSeekMsRef.current !== null) return;

    const timeMs = element.currentTime * 1000;
    if (timeMs >= audio.endMs) {
      // The Spread ends here even though the surah runs on.
      element.pause();
      setCurrentAyahKey(null);
      return;
    }
    setCurrentAyahKey(resolveAyahAtTime(audio.segments, timeMs));
  }

  function handleLoadedMetadata() {
    const element = elementRef.current;
    const pendingSeekMs = pendingSeekMsRef.current;
    if (!element || pendingSeekMs === null) return;

    pendingSeekMsRef.current = null;
    element.currentTime = pendingSeekMs / 1000;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={
            isPlaying
              ? "Pause recitation"
              : "Play recitation of this spread"
          }
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rule transition-colors hover:bg-rule/40"
        >
          {isPlaying ? (
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="h-4 w-4 fill-current"
            >
              <rect x="3" y="2" width="4" height="12" rx="1" />
              <rect x="9" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="ml-0.5 h-4 w-4 fill-current"
            >
              <path d="M4 2.5v11l9.5-5.5z" />
            </svg>
          )}
        </button>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-muted">
            Recitation
          </span>
          <span className="text-sm font-medium tracking-tight">
            {audio.reciterName}
          </span>
        </div>
      </div>

      {hasFailed ? (
        <p role="status" className="text-xs leading-5 text-muted">
          The recitation could not be loaded. The text is unaffected.
        </p>
      ) : null}

      {/* No caption track: the recitation is of the Arabic already on the
          page, and the transliteration under each ayah is its text
          alternative. The Resource ships no captions. */}
      <audio
        ref={elementRef}
        src={audio.audioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => {
          setIsPlaying(true);
          setHasFailed(false);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentAyahKey(null);
        }}
        onError={() => {
          setIsPlaying(false);
          setHasFailed(true);
        }}
      />

      <ol className="flex flex-col gap-4">
        {rows.map((row) => {
          const isCurrent = row.ayahKey === currentAyahKey;
          return (
            <li key={row.ayahKey} id={`ayah-${row.ayahKey}`} data-ayah-key={row.ayahKey}>
              <button
                type="button"
                onClick={() => playFromAyah(row.ayahKey)}
                aria-current={isCurrent ? "true" : undefined}
                className={`flex w-full flex-col gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                  isCurrent ? "bg-rule/60" : "hover:bg-rule/25"
                }`}
              >
                <span
                  dir="rtl"
                  lang="ar"
                  className="block font-arabic text-3xl leading-[2.6] sm:text-[2.1rem] sm:leading-[2.6]"
                >
                  {row.arabic}
                </span>
                <span
                  dir="ltr"
                  lang="en"
                  className="flex gap-3 text-base leading-8 text-muted"
                >
                  <span
                    aria-label={`Ayah ${row.ayahNumber}`}
                    className="mt-1 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border border-rule px-1.5 text-xs tabular-nums"
                  >
                    {row.ayahNumber}
                  </span>
                  <span>{row.transliteration}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
