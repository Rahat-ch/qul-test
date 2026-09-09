/**
 * The one data-layer seam of the reader. `getSpread` returns everything a
 * Spread needs — surah metadata, the Reading Page, and (from tickets 03/04/05)
 * the Facing Page, navigation targets and audio descriptor — in one call.
 *
 * How the bundled QUL Resources are read
 * --------------------------------------
 * The JSON Resources live at the repo root in `data/`, outside this Next.js
 * app, and are pulled in here as static `import`s rather than `fs` reads.
 *
 * Why static imports:
 *   - The bundler inlines the JSON into the server chunk, so a `next build`
 *     with `output: "standalone"` (ticket 06) carries the data with it. An
 *     `fs` read would need `outputFileTracingRoot` plus
 *     `outputFileTracingIncludes` and a runtime guess at where the repo root
 *     ended up inside the image.
 *   - Vitest resolves the same imports with no test-only path wiring, so the
 *     tests run against the real bundled JSON exactly as the app does.
 *
 * Nothing here is ever imported by a Client Component: pages call `getSpread`
 * on the server and pass only the current Spread down, so the ~4.6 MB of
 * script, transliteration and recitation segments never crosses the wire. The
 * Reading Page's player imports `./recitation` directly for the same reason.
 *
 * The `as unknown as Record<...>` casts keep TypeScript from inferring a
 * 6236-property literal type for every Resource, which makes `tsc` crawl.
 */
import recitationSegmentsJson from "../../../data/recitation-alafasy/segments.json";
import recitationSurahJson from "../../../data/recitation-alafasy/surah.json";
import scriptJson from "../../../data/script-indopak-nastaleeq.json";
import surahNamesJson from "../../../data/surah-names.json";
import transliterationJson from "../../../data/transliteration-en-tajweed.json";
import type { AyahKey, AyahSegment } from "./recitation";

/**
 * `resolveAyahAtTime` and the segment types live in `./recitation` so the
 * Reading Page's player can import them in the browser without dragging the
 * bundled JSON above along. They are re-exported here so callers still have one
 * data-layer seam.
 */
export { resolveAyahAtTime } from "./recitation";
export type { AyahKey, AyahSegment };

/** A Spread holds seven ayahs; the last Spread of a surah holds the remainder. */
const AYAHS_PER_SPREAD = 7;

const SURAH_COUNT = 114;

type ScriptEntry = { text: string };
type TransliterationEntry = { t: string };
/**
 * The recitation Resource's per-ayah entry. `segments` is a word-level list of
 * `[wordPosition, startMs, endMs]` triples that this reader does not use: the
 * highlight is per ayah, and the ayah's own bounds are `timestamp_from` and
 * `timestamp_to`. Every time in the file is milliseconds from the start of the
 * surah's audio file.
 */
type RecitationSegmentEntry = {
  timestamp_from: number;
  timestamp_to: number;
};
type RecitationSurahEntry = { audio_url: string };
type SurahNameEntry = {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  bismillah_pre: boolean;
};

const script = scriptJson as unknown as Record<string, ScriptEntry>;
const transliteration = transliterationJson as unknown as Record<
  string,
  TransliterationEntry
>;
const surahNames = surahNamesJson as unknown as Record<string, SurahNameEntry>;
const recitationSegments = recitationSegmentsJson as unknown as Record<
  string,
  RecitationSegmentEntry
>;
const recitationSurahs = recitationSurahJson as unknown as Record<
  string,
  RecitationSurahEntry
>;

/**
 * The recitation Resource carries no reciter field: `surah.json` holds only
 * `surah_number`, `audio_url` and `duration`, and the segments file is keyed by
 * ayah alone. The name exists only on the QUL catalog page the Resource was
 * downloaded from (`/resources/recitation/411`), so it is hard-coded here.
 */
const RECITER_NAME = "Mishari Rashid al-`Afasy";

/**
 * Every ayah in the Indopak Resource ends with an ayah-end ornament: an
 * optional U+06DF, then one or more private-use codepoints that only the
 * bundled QUL Indopak font renders (as the decorated ayah number). Nothing in
 * QUL's docs describes it. The standalone bismillah line is not an ayah, so
 * its ornament is stripped.
 */
const AYAH_END_ORNAMENT = /[\s\u06DF\uE000-\uF8FF]+$/u;

/** Taken from ayah 1:1 of the script Resource rather than hard-coded. */
const BISMILLAH = script["1:1"].text.replace(AYAH_END_ORNAMENT, "");

export type SurahMeta = {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  versesCount: number;
  /**
   * QUL's `bismillah_pre`: false only for Al-Fatihah (where the bismillah is
   * ayah 1) and At-Tawbah (which has none).
   */
  bismillahPre: boolean;
};

export type ReadingPageRow = {
  ayahKey: AyahKey;
  ayahNumber: number;
  /** Indopak Nastaleeq, ayah-end ornament included. Render right-to-left. */
  arabic: string;
  transliteration: string;
};

export type ReadingPage = {
  rows: ReadingPageRow[];
  /** True on the first Spread of every surah whose `bismillahPre` is true. */
  showBismillah: boolean;
  bismillah: string;
};

/** Filled in by ticket 03. One entry per ayah on the Reading Page. */
export type FacingPageRow = {
  ayahKey: AyahKey;
  ayahNumber: number;
  translation: string;
  tafsir: string | null;
};

/** Filled in by ticket 03. */
export type FacingPage = {
  rows: FacingPageRow[];
};

/** Filled in by ticket 04. `null` at the first and last Spread of the Quran. */
export type SpreadNavigation = {
  previous: SpreadRef | null;
  next: SpreadRef | null;
};

export type SpreadRef = {
  surah: number;
  spreadIndex: number;
};

/**
 * Everything the Reading Page needs to recite this Spread: one surah-long audio
 * file, the reciter's name, and where each ayah on the Spread sits inside it.
 *
 * `startMs` is the first ayah's start and `endMs` the last ayah's end, so a
 * player starts at `startMs` and pauses at `endMs` rather than running on into
 * the next Spread. The audio for surahs 2 to 114 contains no bismillah, so
 * ayah 1 of every surah starts at 0 ms.
 */
export type AudioDescriptor = {
  audioUrl: string;
  reciterName: string;
  /** One entry per Reading Page row, in the same order. */
  segments: AyahSegment[];
  startMs: number;
  endMs: number;
};

export type Spread = {
  surah: SurahMeta;
  spreadIndex: number;
  totalSpreads: number;
  readingPage: ReadingPage;
  facingPage: FacingPage;
  navigation: SpreadNavigation;
  audio: AudioDescriptor;
};

/**
 * Out-of-range and unknown-surah are reported rather than thrown so the route
 * can redirect to the nearest valid Spread (ticket 04) or show a 404.
 */
export type GetSpreadResult =
  | { status: "ok"; spread: Spread }
  | {
      status: "out-of-range";
      surah: SurahMeta;
      totalSpreads: number;
      nearestSpreadIndex: number;
    }
  | { status: "unknown-surah"; surah: number };

function toSurahMeta(entry: SurahNameEntry): SurahMeta {
  return {
    number: entry.id,
    nameArabic: entry.name_arabic,
    nameEnglish: entry.name_simple,
    versesCount: entry.verses_count,
    bismillahPre: entry.bismillah_pre,
  };
}

function isKnownSurah(surah: number): boolean {
  return Number.isInteger(surah) && surah >= 1 && surah <= SURAH_COUNT;
}

/** How many Spreads a surah is paginated into. */
export function countSpreads(surah: number): number {
  return Math.ceil(surahNames[String(surah)].verses_count / AYAHS_PER_SPREAD);
}

/** Every surah, in order, for the surah index page. */
export function listSurahs(): SurahMeta[] {
  const surahs: SurahMeta[] = [];
  for (let surah = 1; surah <= SURAH_COUNT; surah += 1) {
    surahs.push(toSurahMeta(surahNames[String(surah)]));
  }
  return surahs;
}

function buildAudioDescriptor(
  surah: number,
  rows: ReadingPageRow[],
): AudioDescriptor {
  const segments: AyahSegment[] = rows.map((row) => {
    const entry = recitationSegments[row.ayahKey];
    return {
      ayahKey: row.ayahKey,
      startMs: entry.timestamp_from,
      endMs: entry.timestamp_to,
    };
  });

  return {
    audioUrl: recitationSurahs[String(surah)].audio_url,
    reciterName: RECITER_NAME,
    segments,
    startMs: segments[0].startMs,
    endMs: segments[segments.length - 1].endMs,
  };
}

export function getSpread(
  surah: number,
  spreadIndex: number,
): GetSpreadResult {
  if (!isKnownSurah(surah)) {
    return { status: "unknown-surah", surah };
  }

  const meta = toSurahMeta(surahNames[String(surah)]);
  const totalSpreads = countSpreads(surah);

  if (!Number.isInteger(spreadIndex) || spreadIndex < 1 || spreadIndex > totalSpreads) {
    return {
      status: "out-of-range",
      surah: meta,
      totalSpreads,
      nearestSpreadIndex: Math.min(Math.max(1, spreadIndex || 1), totalSpreads),
    };
  }

  const firstAyah = (spreadIndex - 1) * AYAHS_PER_SPREAD + 1;
  const lastAyah = Math.min(firstAyah + AYAHS_PER_SPREAD - 1, meta.versesCount);

  const rows: ReadingPageRow[] = [];
  for (let ayah = firstAyah; ayah <= lastAyah; ayah += 1) {
    const ayahKey = `${surah}:${ayah}`;
    rows.push({
      ayahKey,
      ayahNumber: ayah,
      arabic: script[ayahKey].text,
      transliteration: transliteration[ayahKey].t,
    });
  }

  return {
    status: "ok",
    spread: {
      surah: meta,
      spreadIndex,
      totalSpreads,
      readingPage: {
        rows,
        showBismillah: meta.bismillahPre && spreadIndex === 1,
        bismillah: BISMILLAH,
      },
      // Ticket 03 fills the Facing Page, ticket 04 the navigation targets and
      // ticket 05 the audio descriptor. The shapes are here so the UI and the
      // tests can be written against the finished seam.
      facingPage: { rows: [] },
      navigation: { previous: null, next: null },
      audio: buildAudioDescriptor(surah, rows),
    },
  };
}
