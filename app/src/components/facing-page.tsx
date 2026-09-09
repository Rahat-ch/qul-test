import type {
  FacingPage as FacingPageContent,
  FacingPageRow,
} from "@/lib/spread";

/**
 * The Facing Page of a Spread: the English translation of each ayah on the
 * Reading Page, followed by its brief tafsir, in the same order and labelled
 * with the same ayah numbers.
 *
 * Both Resources are plain text by the time they arrive here — `getSpread`
 * strips the HTML that ten tafsir entries carry — so nothing on this page uses
 * `dangerouslySetInnerHTML`.
 *
 * Eighteen tafsir entries cover a run of ayahs rather than one. `getSpread`
 * repeats such a commentary on every ayah of its run and reports the run in
 * `tafsirGroup`; the label below tells the reader the text is shared, so the
 * repetition reads as intentional rather than as a data bug.
 */
function tafsirLabel(row: FacingPageRow): string {
  if (!row.tafsirGroup) return "Tafsir";
  const { fromAyah, toAyah } = row.tafsirGroup;
  return `Tafsir for ayahs ${fromAyah}–${toAyah}`;
}

export function FacingPage({ content }: { content: FacingPageContent }) {
  return (
    <section
      aria-label="Facing Page"
      dir="ltr"
      lang="en"
      className="flex h-full flex-col gap-8 border-b border-rule px-6 py-10 sm:px-10 lg:border-b-0 lg:border-r"
    >
      <header className="flex flex-col items-center gap-1 border-b border-rule pb-6 text-center">
        <h2 className="text-lg font-medium tracking-tight">
          Translation and tafsir
        </h2>
        <p className="text-xs uppercase tracking-widest text-muted">
          Saheeh International &middot; Al-Mukhtasar
        </p>
      </header>

      <ol className="flex flex-col gap-9">
        {content.rows.map((row) => (
          <li
            key={row.ayahKey}
            id={`translation-${row.ayahKey}`}
            data-ayah-key={row.ayahKey}
            className="flex flex-col gap-3 break-words"
          >
            <h3 className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-rule px-1.5 text-xs tabular-nums">
                {row.ayahNumber}
              </span>
              Ayah {row.ayahNumber}
            </h3>

            <p className="text-base leading-7 sm:text-[1.05rem] sm:leading-8">
              {row.translation}
            </p>

            {row.tafsir ? (
              <div className="flex flex-col gap-1 border-l-2 border-rule pl-4">
                <p className="text-[0.7rem] uppercase tracking-widest text-muted">
                  {tafsirLabel(row)}
                </p>
                <p className="text-sm leading-6 text-muted">{row.tafsir}</p>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
