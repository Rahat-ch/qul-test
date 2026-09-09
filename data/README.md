# Bundled QUL Resources

Every text Resource the reader needs, downloaded from the Quranic Universal Library (QUL) catalog on 2026-09-08 and committed here so the app works offline. Total size: 7.7 MB.

## How each file was obtained

All downloads went through the catalog at https://qul.tarteel.ai/resources while signed in. Every catalog "Download" link redirects to a public zip on Wasabi S3 (`s3.us-east-1.wasabisys.com/static-cdn.tarteel.ai/qul-exports/...`); signed out, the same links redirect to the sign-in page. Each zip was unpacked and the JSON inside renamed to the file below. No undocumented `api/v1` endpoints were used.

| File | QUL Resource (catalog page) | Variant chosen | Format | Size |
|---|---|---|---|---|
| `script-indopak-nastaleeq.json` | Indopak Nastaleeq script - Ayah by Ayah (`/resources/quran-script/89`) | one of three ayah-by-ayah Indopak variants; picked because it links its own font | json | 1.8 MB |
| `fonts/indopak-nastaleeq.woff2`, `.ttf` | Indopak Nastaleeq font (`/resources/font/242`), listed under the script's Related Resources | "with waqf lazmi" build v4.2.2 | woff2, ttf | 79 KB, 304 KB |
| `transliteration-en-tajweed.json` | English Transliteration(Tajweed) (`/resources/transliteration/469`) | `simple.json` (no HTML markup) | json | 720 KB |
| `translation-en-saheeh-international.json` | Saheeh International (`/resources/translation/193`) | `simple.json` (footnotes stripped) of eight offered variants | json | 964 KB |
| `tafsir-en-al-mukhtasar.json` | English Al-Mukhtasar (`/resources/tafsir/266`) | only json variant | json | 1.8 MB |
| `recitation-alafasy/surah.json`, `segments.json` | Mishari Rashid al-`Afasy, Surah by Surah, with segments (`/resources/recitation/411`) | surah-by-surah (gapless) rather than ayah-by-ayah (118) or "Streaming" (414) | json | 14 KB, 2.1 MB |
| `surah-names.json` | Surah names (`/resources/quran-metadata/70`) | only json variant | json | 20 KB |

The font files here are byte-identical to the ones on `static-cdn.tarteel.ai/qul/fonts/nastaleeq/Hanafi/normal-v4.2.2/with-waqf-lazmi/` that the font page's own snippet points at.

Also downloaded but not bundled: Ayah metadata (`/resources/quran-metadata/69`, 1.9 MB). It duplicates the ayah keys and adds Uthmani text, which the reader does not need.

## License position

No catalog page for any of these Resources shows a license, a copyright notice, or a permission statement. The QUL FAQ says to "check repository license terms and dataset-specific licensing details before production use", but the dataset pages carry no such details. The position for every Resource above is therefore **unstated**. Tarteel should be asked before any of this ships beyond a prototype.

## Shape notes for the data layer

- All ayah-level files are objects keyed by ayah key `surah:ayah` with 6236 entries.
- Script entries: `{ id, verse_key, surah, ayah, text }`. Every `text` ends with a private-use-area character (ayah marker) that only renders in the bundled font.
- Transliteration and translation entries: `{ t }`.
- Tafsir entries are mixed: most are `{ text }`; 18 grouped entries add `ayah_keys: [...]`, and the 20 ayahs they cover are plain strings pointing at the group's key (for example `"2:4": "2:3"`). Ten entries contain HTML.
- How the reader handles those two: a **grouped tafsir is repeated in full on every ayah of its run**, labelled "Tafsir for ayahs N-M", rather than shown once on the run's first ayah. A run can straddle a Spread boundary (37:167-170 splits across two Spreads), and showing it once would leave the following ayahs blank on a page that never shows the first. The **HTML is stripped to plain text** (`stripHtml` in `app/src/lib/spread.ts`): the only markup in the Resource is a `<p>` wrapper on ten entries, with no inline tags and no HTML entities, so the Facing Page renders text and needs neither a sanitiser nor `dangerouslySetInnerHTML`.
- `surah-names.json` is keyed by surah number: `{ id, name, name_simple, name_arabic, revelation_order, revelation_place, verses_count, bismillah_pre }`.
- `recitation-alafasy/surah.json` is keyed by surah number: `{ surah_number, audio_url, duration }` with duration in seconds. `segments.json` is keyed by ayah key: `{ segments: [[wordPosition, startMs, endMs], ...], duration_sec, duration_ms, timestamp_from, timestamp_to }`, all in milliseconds within the surah file. The audio files contain no bismillah before surahs 2 to 114; the first ayah starts at 0 ms. Thirty ayahs start slightly before the previous ayah ends.
- Audio streams from `audio-cdn.tarteel.ai`. QUL's recitation tutorial says production apps must download and self-host the files rather than hotlink that CDN.
