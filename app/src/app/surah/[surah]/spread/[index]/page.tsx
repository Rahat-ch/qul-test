import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { FacingPage } from "@/components/facing-page";
import { ReadingPage } from "@/components/reading-page";
import { SpreadHeader } from "@/components/spread-header";
import { getSpread } from "@/lib/spread";

/**
 * Anything that is not a run of digits becomes NaN — `-1`, `abc`, `1.5` — and
 * `getSpread` reports NaN as out-of-range, so every malformed index below takes
 * the redirect branch instead of throwing.
 */
function parse(value: string): number {
  return /^\d+$/.test(value) ? Number(value) : Number.NaN;
}

export async function generateMetadata(
  props: PageProps<"/surah/[surah]/spread/[index]">,
): Promise<Metadata> {
  const { surah, index } = await props.params;
  const result = getSpread(parse(surah), parse(index));
  if (result.status !== "ok") return { title: "QUL Reader" };
  return {
    title: `${result.spread.surah.nameEnglish} — Spread ${result.spread.spreadIndex} of ${result.spread.totalSpreads}`,
  };
}

export default async function SpreadPage(
  props: PageProps<"/surah/[surah]/spread/[index]">,
) {
  const { surah, index } = await props.params;
  const result = getSpread(parse(surah), parse(index));

  if (result.status === "unknown-surah") {
    notFound();
  }

  if (result.status === "out-of-range") {
    // A stale or hand-edited link lands on the nearest Spread of the surah it
    // named, which is the closest valid page to what was asked for. Turning
    // past a surah's end is the job of the next/previous controls, which know
    // the neighbouring surah; a URL nobody can reach by reading should not
    // silently move the reader into a different surah.
    redirect(
      `/surah/${result.surah.number}/spread/${result.nearestSpreadIndex}`,
    );
  }

  const { spread } = result;

  return (
    <div className="flex flex-1 flex-col">
      <SpreadHeader spread={spread} />

      {/* Open book: Facing Page left, Reading Page right on desktop; stacked
          with the Reading Page first on a phone. */}
      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <FacingPage content={spread.facingPage} />
        </div>
        <div className="order-1 lg:order-2">
          <ReadingPage surah={spread.surah} content={spread.readingPage} />
        </div>
      </main>
    </div>
  );
}
