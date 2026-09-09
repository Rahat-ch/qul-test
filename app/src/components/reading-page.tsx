import { Recitation } from "@/components/recitation";
import type {
  AudioDescriptor,
  ReadingPage as ReadingPageContent,
  SurahMeta,
} from "@/lib/spread";

/**
 * The Reading Page of a Spread: each ayah in Indopak script with its
 * transliteration on the line directly beneath.
 *
 * The surah heading and the bismillah are static, so they stay on the server.
 * The ayah list is handed to `Recitation`, the Client Component that owns the
 * play control, this Spread's audio element and the highlight.
 */
export function ReadingPage({
  surah,
  content,
  audio,
}: {
  surah: SurahMeta;
  content: ReadingPageContent;
  audio: AudioDescriptor;
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

      <Recitation rows={content.rows} audio={audio} />
    </section>
  );
}
