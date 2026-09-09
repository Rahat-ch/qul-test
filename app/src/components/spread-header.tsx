import Link from "next/link";

import type { Spread } from "@/lib/spread";

/**
 * PLACEHOLDER FOR TICKET 04.
 *
 * The shared header of a Spread. It carries the Spread indicator today; the
 * previous/next controls and the surah picker belong to ticket 04, which fills
 * `spread.navigation` in the data layer and swaps the two disabled buttons
 * below for links to those targets.
 */
export function SpreadHeader({ spread }: { spread: Spread }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-rule bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
      <Link
        href="/"
        className="text-sm underline underline-offset-4 hover:no-underline"
      >
        All surahs
      </Link>

      <p className="text-xs uppercase tracking-widest text-muted">
        Spread {spread.spreadIndex} of {spread.totalSpreads}
      </p>

      {/* Ticket 04 replaces these with links to spread.navigation.previous/next. */}
      <nav aria-label="Spread navigation" className="flex items-center gap-2">
        <span
          aria-disabled="true"
          className="rounded border border-rule px-2 py-1 text-xs text-muted"
        >
          Previous
        </span>
        <span
          aria-disabled="true"
          className="rounded border border-rule px-2 py-1 text-xs text-muted"
        >
          Next
        </span>
      </nav>
    </header>
  );
}
