# QUL Book-Spread Reader

A one-day spike: a reference Quran reader built the way a new Builder would build
it, on Resources downloaded from the [Quranic Universal Library](https://qul.tarteel.ai)
(QUL). It exists for two reasons — to be a starting point someone can fork, and to
produce [`docs/friction-log.md`](docs/friction-log.md), an evidence base for a
developer-relations plan. Every place QUL slowed the build down is a row in that log.

MIT licensed (see [`LICENSE`](LICENSE)). Not affiliated with Tarteel or QUL.

## The book-spread model

The reader presents the Quran as an open book: a **Spread** is one screen holding
seven ayahs, with the **Reading Page** (Indopak Arabic, transliteration beneath
each ayah, one play control) on the right and the **Facing Page** (English
translation and tafsir for the same ayahs) on the left. Turning past the last
Spread of a surah opens the first Spread of the next one, so reading is continuous;
on a phone the two pages stack with the Reading Page first.

Everything the UI needs comes from one function, `getSpread(surah, spreadIndex)` in
[`app/src/lib/spread.ts`](app/src/lib/spread.ts) — that is the seam the tests
exercise.

## Resources used

All text and audio metadata is downloaded from the QUL catalog and committed to
`data/`, so reading works offline and no undocumented API is involved.

| Role | QUL Resource | Catalog page |
|---|---|---|
| Script | Indopak Nastaleeq script | `/resources/quran-script/89` |
| Font | Indopak Nastaleeq font | `/resources/font/242` |
| Transliteration | English Transliteration (Tajweed) | `/resources/transliteration/469` |
| Translation | Saheeh International | `/resources/translation/193` |
| Tafsir | English Al-Mukhtasar | `/resources/tafsir/266` |
| Recitation | Mishari Rashid al-`Afasy, surah by surah, with segments | `/resources/recitation/411` |
| Metadata | Surah names | `/resources/quran-metadata/70` |

[`data/README.md`](data/README.md) is the full table: which variant was chosen from
each catalog page and why, the exact file each became, its size, and the shape notes
the data layer depends on. Swapping a Resource means replacing a file in `data/` and
adjusting the entry parsing in `app/src/lib/spread.ts`; the list the attribution
footer renders lives in `app/src/lib/resources.ts`.

## Licensing of the data

**Unstated.** No catalog page for any Resource above shows a license, a copyright
notice, or a permission statement. QUL's FAQ says to check "dataset-specific
licensing details before production use", and those details do not exist on the
dataset pages. Ask Tarteel before shipping any of this data beyond a prototype. The
MIT license on this repo covers the code, not the Resources in `data/`.

## Audio is hotlinked, and should not be

Recitation streams from `audio-cdn.tarteel.ai` at runtime. QUL's own
[recitation tutorial](https://qul.tarteel.ai/docs/tutorial-recitation-end-to-end)
says not to do that:

> These URLs are provided so the exported files can be located and validated, but
> the CDN is shared infrastructure that QUL does not guarantee for third-party
> production traffic. Download the files and self-host them (own storage or CDN)
> before wiring them into a production app; do not hotlink audio-cdn.tarteel.ai at
> runtime.

**This prototype hotlinks anyway.** Self-hosting the surah files was out of scope for
a one-day spike — Al-Baqarah alone is 116 MB — and the recitation Resource hands you
an `audio_url` pointing straight at the CDN, which is the path of least resistance.
A production app must download the files and serve them itself. The CDN also sends no
CORS header, so the Web Audio API cannot read these files even if you accept the
hotlink; see rows 26, 27 and 34 of the Friction log.

## Running locally

Requires Node 24+ and pnpm (`corepack enable`).

```bash
cd app
pnpm install
pnpm dev      # http://localhost:3000
pnpm test     # Vitest, against the real bundled JSON
pnpm lint
pnpm build
```

`pnpm typecheck` needs `next build` or `next dev` to have run at least once in this
checkout: Next generates the route types (`PageProps`, `LayoutProps`) into
`.next/types`, and `tsc` cannot resolve them before they exist.

## Docker

The Dockerfile is at the repo root and **the build context must be the repo root**,
not `app/`. The bundled Resources in `data/` sit outside the Next.js app and are
statically imported by the data layer, so a context of `app/` cannot build.

```bash
docker build -t qul-reader .
docker run --rm -p 3000:3000 qul-reader
```

It is a multi-stage build on `node:24-alpine` using Next.js `output: "standalone"`.
Because `outputFileTracingRoot` is the repo root, the standalone output nests under
`app/`, so the runner stage starts `node app/server.js`. The JSON is inlined into
the server bundle at build time, so `data/` is not copied into the final image.

## Deployment

Coolify on a Hetzner server, using the Dockerfile build pack:

- Dockerfile: `Dockerfile` (repo root)
- Build context / base directory: the repo root
- Exposed port: `3000`
- Public URL: https://quran.rahatcodes.com

No environment variables are needed. `NODE_ENV`, `HOSTNAME` and `PORT` are set in
the image.

## Friction log

[`docs/friction-log.md`](docs/friction-log.md) — one row per moment the build got
stuck or slowed on QUL, with severity, time lost, and the objective it bears on.
It is the point of the exercise; the app is the excuse for producing it.
