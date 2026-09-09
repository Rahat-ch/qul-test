import type { ReadingPage as ReadingPageContent, SurahMeta } from "@/lib/spread";

/**
 * The Reading Page of a Spread: each ayah in Indopak script with its
 * transliteration on the line directly beneath.
 *
 * Tapping a row to seek recitation, and the ayah highlight, arrive with
 * ticket 05.
 */
export function ReadingPage({
  surah,
  content,
}: {
  surah: SurahMeta;
  content: ReadingPageContent;
}) {
  return (
    <section
      aria-label={`Reading Page, Surah ${surah.nameEnglish}`}
      className="flex flex-col gap-8 px-6 py-10 sm:px-10"
    >
      <header className="flex flex-col items-center gap-1 border-b border-rule pb-6 text-center">
        <h1
          dir="rtl"
          lang="ar"
          className="font-arabic text-4xl leading-[1.9] sm:text-5xl"
        >
          {surah.nameArabic}
        </h1>
        <p className="text-lg font-medium tracking-tight">
          {surah.nameEnglish}
        </p>
        <p className="text-xs uppercase tracking-widest text-muted">
          Surah {surah.number} &middot; {surah.versesCount} ayahs
        </p>
      </header>

      {content.showBismillah ? (
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-center text-3xl leading-[2.4] sm:text-4xl"
        >
          {content.bismillah}
        </p>
      ) : null}

      <ol className="flex flex-col gap-9">
        {content.rows.map((row) => (
          <li
            key={row.ayahKey}
            id={`ayah-${row.ayahKey}`}
            data-ayah-key={row.ayahKey}
            className="flex flex-col gap-3"
          >
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-3xl leading-[2.6] sm:text-[2.1rem] sm:leading-[2.6]"
            >
              {row.arabic}
            </p>
            <p
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
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
