/**
 * The pure part of recitation: ayah segments and the rule that turns a
 * playback time into the ayah being recited.
 *
 * It lives apart from `spread.ts` because the Reading Page's player is a
 * Client Component and needs this rule in the browser, while `spread.ts`
 * statically imports megabytes of bundled JSON that must never cross the wire.
 * `spread.ts` re-exports everything here, so the data layer still has one
 * public seam.
 */

export type AyahKey = string;

/**
 * One ayah's slice of the surah's audio file. Times are milliseconds from the
 * start of that file, taken from the recitation Resource's `timestamp_from`
 * and `timestamp_to`.
 */
export type AyahSegment = {
  ayahKey: AyahKey;
  startMs: number;
  endMs: number;
};

/**
 * Which ayah of a Spread is being recited at `timeMs` (milliseconds into the
 * surah audio file), or `null` if the playhead is outside the Spread.
 *
 * The rule, in order:
 *   1. The first segment, scanning the Spread in ayah order, whose
 *      `[startMs, endMs]` range contains `timeMs`. Both bounds are inclusive.
 *      This settles the two kinds of boundary in the Resource: where one ayah
 *      ends exactly as the next begins (two pairs), and where the next ayah
 *      starts a little before the previous one ends (30 pairs). In both, the
 *      earlier ayah keeps the highlight until its own end.
 *   2. Otherwise, if `timeMs` falls in a gap between two segments (the
 *      Resource leaves 200 ms between ayahs almost everywhere), the ayah just
 *      recited keeps the highlight, rather than the page going blank between
 *      every pair of ayahs.
 *   3. Otherwise `null`: before the Spread's first ayah starts, or after its
 *      last ayah ends.
 *
 * Segments are assumed to be in ayah order, which is how `getSpread` builds
 * them. A Spread is at most seven segments, so a linear scan is the whole cost.
 */
export function resolveAyahAtTime(
  segments: AyahSegment[],
  timeMs: number,
): AyahKey | null {
  let held: AyahKey | null = null;

  for (const segment of segments) {
    if (timeMs < segment.startMs) break;
    if (timeMs <= segment.endMs) return segment.ayahKey;
    held = segment.ayahKey;
  }

  const last = segments[segments.length - 1];
  if (held === null || last === undefined || timeMs > last.endMs) return null;
  return held;
}
