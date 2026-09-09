"use client";

import { useRouter } from "next/navigation";

/**
 * The only Client Component in the header. A native `<select>` is enough for
 * 114 options and needs no state of its own, so choosing a surah just pushes
 * the route for its first Spread.
 *
 * The server renders the option list from `listSurahs()`, so only the number
 * and English name of each surah crosses the wire — not the bundled script.
 */
export type SurahOption = {
  number: number;
  name: string;
};

export function SurahPicker({
  surahs,
  current,
}: {
  surahs: SurahOption[];
  current: number;
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Jump to surah</span>
      <select
        // Uncontrolled, keyed on the surah being read: the select shows the
        // chosen surah immediately instead of snapping back while the new
        // Spread is fetched, and resets to match the URL once it arrives.
        key={current}
        defaultValue={current}
        onChange={(event) => {
          router.push(`/surah/${event.target.value}/spread/1`);
        }}
        className="max-w-44 truncate rounded border border-rule bg-background px-2 py-1 text-xs text-foreground"
      >
        {surahs.map((surah) => (
          <option key={surah.number} value={surah.number}>
            {surah.number}. {surah.name}
          </option>
        ))}
      </select>
    </label>
  );
}
