/**
 * The QUL Resources this reader is built from, in one list.
 *
 * Every Resource here was downloaded from the QUL catalog and committed to
 * `data/` (see `data/README.md` for the variant chosen, the file it became, and
 * how it was obtained). This module exists so the attribution footer, and
 * anything else that has to credit the data, reads the same list rather than
 * repeating catalog names and paths in JSX where they can drift out of sync
 * with `data/README.md`.
 *
 * `catalogPath` is the path under https://qul.tarteel.ai/resources — the page
 * the Resource was taken from, and the only place its licensing (or lack of it)
 * could be stated.
 */

export type Resource = {
  /** What the Resource supplies to the reader, e.g. "Translation". */
  role: string;
  /** The Resource's name on its QUL catalog page, verbatim. */
  name: string;
  /** Path under /resources, e.g. "quran-script/89". */
  catalogPath: string;
};

const CATALOG_BASE = "https://qul.tarteel.ai/resources";

export function catalogUrl(resource: Resource): string {
  return `${CATALOG_BASE}/${resource.catalogPath}`;
}

/**
 * Listed in the order a Builder meets them: the Arabic and the font that
 * renders it, then the two English pages, then the recitation, then metadata.
 */
export const RESOURCES: Resource[] = [
  {
    role: "Script",
    name: "Indopak Nastaleeq script",
    catalogPath: "quran-script/89",
  },
  {
    role: "Font",
    name: "Indopak Nastaleeq font",
    catalogPath: "font/242",
  },
  {
    role: "Transliteration",
    name: "English Transliteration (Tajweed)",
    catalogPath: "transliteration/469",
  },
  {
    role: "Translation",
    name: "Saheeh International",
    catalogPath: "translation/193",
  },
  {
    role: "Tafsir",
    name: "English Al-Mukhtasar",
    catalogPath: "tafsir/266",
  },
  {
    role: "Recitation",
    name: "Mishari Rashid al-`Afasy surah recitation with segments",
    catalogPath: "recitation/411",
  },
  {
    role: "Metadata",
    name: "Surah names",
    catalogPath: "quran-metadata/70",
  },
];
