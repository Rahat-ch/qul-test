import type { FacingPage as FacingPageContent } from "@/lib/spread";

/**
 * PLACEHOLDER FOR TICKET 03.
 *
 * The Facing Page shows the English translation and a brief tafsir for exactly
 * the ayahs on the Reading Page. `getSpread` already returns `facingPage.rows`;
 * ticket 03 fills that array from the translation and tafsir Resources and
 * replaces the body of this component. The slot, the aria-label and the
 * left-hand grid column are here so nothing else has to move.
 */
export function FacingPage({ content }: { content: FacingPageContent }) {
  if (content.rows.length === 0) {
    return (
      <section
        aria-label="Facing Page"
        className="flex items-center justify-center border-b border-rule px-6 py-10 text-sm text-muted lg:border-b-0 lg:border-r"
      >
        <p className="max-w-xs text-center">
          Facing Page: translation and tafsir land here in ticket 03.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Facing Page"
      className="flex flex-col gap-8 border-b border-rule px-6 py-10 sm:px-10 lg:border-b-0 lg:border-r"
    >
      {content.rows.map((row) => (
        <article key={row.ayahKey} className="flex flex-col gap-2">
          <h2 className="text-xs uppercase tracking-widest text-muted">
            Ayah {row.ayahNumber}
          </h2>
          <p className="text-base leading-7">{row.translation}</p>
          {row.tafsir ? (
            <p className="text-sm leading-6 text-muted">{row.tafsir}</p>
          ) : null}
        </article>
      ))}
    </section>
  );
}
