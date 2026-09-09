import { catalogUrl, RESOURCES } from "@/lib/resources";

/**
 * Credits every QUL Resource the reader is built from, on every page.
 *
 * A Server Component with no state: the list comes from `@/lib/resources`, the
 * same list `data/README.md` documents, so a Builder reading the page can find
 * each Resource's catalog entry and see what this app actually took from QUL.
 *
 * The two sentences below the list are the honest part. No catalog page for any
 * of these Resources carries a license, and the audio is hotlinked from
 * Tarteel's CDN, which QUL's own recitation tutorial tells production apps not
 * to do. Both are stated here rather than only in the README, because the
 * deployed page is what most people will see.
 */
export function AttributionFooter() {
  return (
    <footer className="border-t border-rule px-4 py-6 text-xs leading-5 text-muted sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
        <p>
          Text, font and recitation from the{" "}
          <a
            href="https://qul.tarteel.ai"
            className="underline underline-offset-2 hover:no-underline"
          >
            Quranic Universal Library
          </a>
          . Not affiliated with Tarteel.
        </p>

        <ul className="flex flex-col gap-1">
          {RESOURCES.map((resource) => (
            <li key={resource.catalogPath}>
              <span className="text-foreground/70">{resource.role}: </span>
              <a
                href={catalogUrl(resource)}
                className="underline underline-offset-2 hover:no-underline"
              >
                {resource.name}
              </a>{" "}
              <span className="tabular-nums">({resource.catalogPath})</span>
            </li>
          ))}
        </ul>

        <p>
          Licensing for every Resource above is unstated on QUL: no catalog page
          shows a license, copyright notice, or permission statement. Recitation
          audio streams from Tarteel&rsquo;s CDN, which QUL&rsquo;s own guidance
          says production apps must not do — this is a prototype, so it does.
        </p>
      </div>
    </footer>
  );
}
