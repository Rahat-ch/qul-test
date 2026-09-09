import Link from "next/link";

import { listSurahs } from "@/lib/spread";

export default function SurahIndexPage() {
  const surahs = listSurahs();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Simple Quran</h1>
      <p className="mt-2 text-sm text-muted">
        All 114 surahs, read as book Spreads of seven ayahs. Text from the
        Quranic Universal Library.
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-2">
        {surahs.map((surah) => (
          <li key={surah.number} className="bg-background">
            <Link
              href={`/surah/${surah.number}/spread/1`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-rule/40"
            >
              <span className="w-7 shrink-0 text-xs tabular-nums text-muted">
                {surah.number}
              </span>
              <span className="flex-1 text-sm font-medium">
                {surah.nameEnglish}
                <span className="ml-2 text-xs font-normal text-muted">
                  {surah.versesCount} ayahs
                </span>
              </span>
              <span
                dir="rtl"
                lang="ar"
                className="font-arabic text-xl leading-[2]"
              >
                {surah.nameArabic}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
