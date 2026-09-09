import Link from "next/link";

import { SurahPicker } from "@/components/surah-picker";
import { listSurahs, type Spread, type SpreadRef } from "@/lib/spread";

/**
 * The header shared by both pages of a Spread: the way back to the surah
 * index, a surah picker, the Spread indicator, and the page-turning controls.
 *
 * Previous and next come straight from `spread.navigation`, which already runs
 * off the end of one surah into the next, so this component never has to know
 * where a surah ends. A `null` target is an end of the Quran and renders as a
 * disabled control rather than disappearing, so the pair keeps its place.
 *
 * This is a Server Component: `listSurahs()` runs here and only the 114 surah
 * numbers and English names are serialised for the picker.
 */
export function SpreadHeader({ spread }: { spread: Spread }) {
  const surahs = listSurahs().map((surah) => ({
    number: surah.number,
    name: surah.nameEnglish,
  }));

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rule bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-sm underline underline-offset-4 hover:no-underline"
        >
          All surahs
        </Link>
        <SurahPicker surahs={surahs} current={spread.surah.number} />
      </div>

      <p className="text-xs uppercase tracking-widest text-muted">
        Spread {spread.spreadIndex} of {spread.totalSpreads}
      </p>

      <nav aria-label="Spread navigation" className="flex items-center gap-2">
        <TurnPageControl
          target={spread.navigation.previous}
          label="Previous"
          endLabel="Start of the Quran"
        />
        <TurnPageControl
          target={spread.navigation.next}
          label="Next"
          endLabel="End of the Quran"
        />
      </nav>
    </header>
  );
}

const CONTROL_CLASS =
  "whitespace-nowrap rounded border border-rule px-2 py-1 text-xs";

function TurnPageControl({
  target,
  label,
  endLabel,
}: {
  target: SpreadRef | null;
  label: string;
  endLabel: string;
}) {
  if (!target) {
    return (
      <span
        aria-disabled="true"
        title={endLabel}
        className={`${CONTROL_CLASS} cursor-not-allowed text-muted opacity-60`}
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={`/surah/${target.surah}/spread/${target.spreadIndex}`}
      className={`${CONTROL_CLASS} hover:bg-rule/40`}
    >
      {label}
    </Link>
  );
}
