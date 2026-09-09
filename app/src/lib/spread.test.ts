import { describe, expect, it } from "vitest";

import { countSpreads, getSpread, listSurahs, resolveAyahAtTime } from "./spread";

describe("getSpread", () => {
  it("gives a Spread seven Reading Page rows", () => {
    const result = getSpread(2, 1);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.readingPage.rows).toHaveLength(7);
  });

  it("puts the remaining ayahs on the last Spread of a surah", () => {
    // Al-Baqarah has 286 ayahs: 40 full Spreads of seven, then six.
    const result = getSpread(2, 41);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.readingPage.rows).toHaveLength(6);
    expect(result.spread.totalSpreads).toBe(41);
    expect(result.spread.spreadIndex).toBe(41);
  });

  it("fits Al-Fatihah into exactly one Spread", () => {
    const result = getSpread(1, 1);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.totalSpreads).toBe(1);
    expect(result.spread.readingPage.rows).toHaveLength(7);
    expect(result.spread.surah.nameEnglish).toBe("Al-Fatihah");
    expect(result.spread.surah.nameArabic).toBe("الفاتحة");
  });

  it("carries the Reading Page ayah keys in order", () => {
    const result = getSpread(2, 2);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.readingPage.rows.map((row) => row.ayahKey)).toEqual([
      "2:8",
      "2:9",
      "2:10",
      "2:11",
      "2:12",
      "2:13",
      "2:14",
    ]);
    expect(result.spread.readingPage.rows[0].transliteration).toContain(
      "Wa-minan naasi mainy yaqoolu",
    );
    // "وَمِنَ النَّاس" spelled out, because the Indopak Resource's diacritic
    // codepoints do not match what a keyboard produces for the same words.
    expect(result.spread.readingPage.rows[0].arabic).toContain(
      "\u0648\u064e\u0645\u0650\u0646\u064e\u0020\u0627\u0644\u0646\u0651\u064e\u0627\u0633",
    );
  });

  it("shows the bismillah on the first Spread of an ordinary surah", () => {
    const result = getSpread(2, 1);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.readingPage.showBismillah).toBe(true);
    expect(result.spread.readingPage.bismillah).toContain(
      // "بِسْمِ" spelled out; see the note on Indopak diacritics above.
      "\u0628\u0650\u0633\u0652\u0645\u0650",
    );
  });

  it("does not repeat the bismillah on later Spreads of a surah", () => {
    const result = getSpread(2, 2);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.readingPage.showBismillah).toBe(false);
  });

  it("does not show a separate bismillah for Al-Fatihah, where it is ayah 1", () => {
    const result = getSpread(1, 1);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.readingPage.showBismillah).toBe(false);
    expect(result.spread.readingPage.rows[0].ayahKey).toBe("1:1");
  });

  it("does not show the bismillah for At-Tawbah", () => {
    const result = getSpread(9, 1);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.readingPage.showBismillah).toBe(false);
  });

  it("reports a Spread index past the last Spread, with the nearest valid one", () => {
    const result = getSpread(1, 2);

    expect(result.status).toBe("out-of-range");
    if (result.status !== "out-of-range") return;
    expect(result.totalSpreads).toBe(1);
    expect(result.nearestSpreadIndex).toBe(1);
  });

  it("reports a Spread index below one", () => {
    const result = getSpread(2, 0);

    expect(result.status).toBe("out-of-range");
    if (result.status !== "out-of-range") return;
    expect(result.nearestSpreadIndex).toBe(1);
  });

  it("reports a negative Spread index, with the first Spread as nearest", () => {
    const result = getSpread(2, -3);

    expect(result.status).toBe("out-of-range");
    if (result.status !== "out-of-range") return;
    expect(result.nearestSpreadIndex).toBe(1);
  });

  it("reports a Spread index far past the end, with the last Spread as nearest", () => {
    const result = getSpread(2, 9999);

    expect(result.status).toBe("out-of-range");
    if (result.status !== "out-of-range") return;
    expect(result.totalSpreads).toBe(41);
    expect(result.nearestSpreadIndex).toBe(41);
  });

  it("reports a Spread index that is not a number at all", () => {
    // The route parses `/spread/abc` to NaN rather than throwing.
    const result = getSpread(2, Number.NaN);

    expect(result.status).toBe("out-of-range");
    if (result.status !== "out-of-range") return;
    expect(result.nearestSpreadIndex).toBe(1);
  });

  it("reports a surah number outside 1 to 114", () => {
    expect(getSpread(115, 1).status).toBe("unknown-surah");
    expect(getSpread(0, 1).status).toBe("unknown-surah");
  });
});

describe("the Facing Page of a Spread", () => {
  const spreadsUnderTest: [string, number, number][] = [
    ["Al-Fatihah, the only Spread", 1, 1],
    ["Al-Baqarah, the Spread holding the grouped 2:3/2:4 tafsir", 2, 1],
    ["Al-Baqarah, a middle Spread", 2, 20],
    ["Al-Baqarah, the last Spread", 2, 41],
    ["An-Nas, the last Spread of the Quran", 114, 1],
  ];

  it.each(spreadsUnderTest)(
    "carries the same ayah keys in the same order as the Reading Page (%s)",
    (_name, surah, spreadIndex) => {
      const result = getSpread(surah, spreadIndex);

      expect(result.status).toBe("ok");
      if (result.status !== "ok") return;
      const { readingPage, facingPage } = result.spread;
      expect(facingPage.rows.map((row) => row.ayahKey)).toEqual(
        readingPage.rows.map((row) => row.ayahKey),
      );
      expect(facingPage.rows.map((row) => row.ayahNumber)).toEqual(
        readingPage.rows.map((row) => row.ayahNumber),
      );
    },
  );
});

describe("Facing Page translation", () => {
  it("gives every row a non-empty translation", () => {
    for (const [surah, spreadIndex] of [
      [1, 1],
      [2, 1],
      [2, 20],
      [2, 41],
      [9, 1],
      [37, 24],
      [114, 1],
    ] as const) {
      const result = getSpread(surah, spreadIndex);
      expect(result.status).toBe("ok");
      if (result.status !== "ok") continue;
      for (const row of result.spread.facingPage.rows) {
        expect(row.translation.trim(), `${row.ayahKey} translation`).not.toBe(
          "",
        );
      }
    }
  });

  it("gives the Saheeh International translation for each labelled ayah", () => {
    const result = getSpread(1, 1);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    const rows = result.spread.facingPage.rows;
    expect(rows[0].ayahNumber).toBe(1);
    expect(rows[0].translation).toBe(
      "In the name of Allāh, the Entirely Merciful, the Especially Merciful.",
    );
    expect(rows[4].ayahNumber).toBe(5);
    expect(rows[4].translation).toBe(
      "It is You we worship and You we ask for help.",
    );
  });
});

describe("Facing Page tafsir", () => {
  it("gives every row a non-empty tafsir", () => {
    for (const [surah, spreadIndex] of [
      [1, 1],
      [2, 1],
      [2, 41],
      [114, 1],
    ] as const) {
      const result = getSpread(surah, spreadIndex);
      expect(result.status).toBe("ok");
      if (result.status !== "ok") continue;
      for (const row of result.spread.facingPage.rows) {
        expect(row.tafsir, `${row.ayahKey} tafsir`).not.toBeNull();
        expect(row.tafsir?.trim(), `${row.ayahKey} tafsir`).not.toBe("");
      }
    }
  });

  it("leaves an ayah with its own tafsir ungrouped", () => {
    const result = getSpread(2, 1);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    const row = result.spread.facingPage.rows[1];
    expect(row.ayahKey).toBe("2:2");
    expect(row.tafsirGroup).toBeNull();
  });

  it("repeats a grouped tafsir on every ayah of the group, labelled with the run", () => {
    // 2:3 in the Resource carries `ayah_keys: ["2:3", "2:4"]`; 2:4 is the bare
    // string "2:3" pointing back at it.
    const result = getSpread(2, 1);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    const [three, four] = result.spread.facingPage.rows.slice(2, 4);
    expect(three.ayahKey).toBe("2:3");
    expect(four.ayahKey).toBe("2:4");
    expect(three.tafsir).toContain(
      "They believe in the revelation that Allah sent down to you",
    );
    expect(four.tafsir).toBe(three.tafsir);
    expect(three.tafsirGroup).toEqual({ fromAyah: 3, toAyah: 4 });
    expect(four.tafsirGroup).toEqual({ fromAyah: 3, toAyah: 4 });
  });

  it("repeats a grouped tafsir across a Spread boundary that splits the group", () => {
    // 37:167 covers 37:167 to 37:170, but Spread 24 ends at 37:168.
    const first = getSpread(37, 24);
    const second = getSpread(37, 25);

    expect(first.status).toBe("ok");
    expect(second.status).toBe("ok");
    if (first.status !== "ok" || second.status !== "ok") return;
    const end = first.spread.facingPage.rows.at(-1);
    const start = second.spread.facingPage.rows[0];
    expect(end?.ayahKey).toBe("37:168");
    expect(start.ayahKey).toBe("37:169");
    expect(start.tafsir).toBe(end?.tafsir);
    expect(start.tafsirGroup).toEqual({ fromAyah: 167, toAyah: 170 });
  });

  it("strips the HTML that ten tafsir entries wrap their text in", () => {
    // 3:3 and 3:4 are two of the ten `<p>`-wrapped entries.
    const result = getSpread(3, 1);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    const row = result.spread.facingPage.rows[2];
    expect(row.ayahKey).toBe("3:3");
    expect(row.tafsir?.startsWith("He has revealed to you, O Prophet")).toBe(
      true,
    );
    for (const each of result.spread.facingPage.rows) {
      expect(each.tafsir).not.toContain("<");
    }
  });

  it("leaves no HTML tag anywhere in the tafsir of any Spread", () => {
    for (let surah = 1; surah <= 114; surah += 1) {
      for (let index = 1; index <= countSpreads(surah); index += 1) {
        const result = getSpread(surah, index);
        if (result.status !== "ok") continue;
        for (const row of result.spread.facingPage.rows) {
          expect(row.tafsir ?? "", row.ayahKey).not.toMatch(/<[^>]+>/);
          expect(row.translation, row.ayahKey).not.toMatch(/<[^>]+>/);
        }
      }
    }
  });
});

describe("listSurahs", () => {
  it("lists all 114 surahs in order with Arabic and English names", () => {
    const surahs = listSurahs();

    expect(surahs).toHaveLength(114);
    expect(surahs[0].number).toBe(1);
    expect(surahs[0].nameEnglish).toBe("Al-Fatihah");
    expect(surahs[113].number).toBe(114);
    expect(surahs[113].nameEnglish).toBe("An-Nas");
    expect(surahs.every((surah) => surah.nameArabic.length > 0)).toBe(true);
    expect(surahs.every((surah) => surah.versesCount > 0)).toBe(true);
  });
});

describe("getSpread navigation", () => {
  it("turns to the next and previous Spread inside a surah", () => {
    const result = getSpread(2, 2);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.navigation.previous).toEqual({
      surah: 2,
      spreadIndex: 1,
    });
    expect(result.spread.navigation.next).toEqual({
      surah: 2,
      spreadIndex: 3,
    });
  });

  it("turns forward off the end of a surah into the next surah", () => {
    // Al-Baqarah's last Spread is 41; the next page is Aal-Imran 1.
    const result = getSpread(2, 41);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.navigation.next).toEqual({
      surah: 3,
      spreadIndex: 1,
    });
  });

  it("turns back from the first Spread of a surah into the previous surah", () => {
    const result = getSpread(3, 1);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.navigation.previous).toEqual({
      surah: 2,
      spreadIndex: 41,
    });
  });

  it("has no previous at the first Spread of the Quran", () => {
    const result = getSpread(1, 1);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.navigation.previous).toBeNull();
    expect(result.spread.navigation.next).toEqual({
      surah: 2,
      spreadIndex: 1,
    });
  });

  it("has no next at the last Spread of the Quran", () => {
    // An-Nas has six ayahs, so surah 114 is a single Spread.
    const result = getSpread(114, 1);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.totalSpreads).toBe(1);
    expect(result.spread.navigation.next).toBeNull();
    expect(result.spread.navigation.previous).toEqual({
      surah: 113,
      spreadIndex: 1,
    });
  });
});

describe("getSpread audio descriptor", () => {
  it("covers exactly the Spread's ayahs, in order", () => {
    const result = getSpread(2, 2);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.audio.segments.map((segment) => segment.ayahKey)).toEqual(
      result.spread.readingPage.rows.map((row) => row.ayahKey),
    );
    expect(result.spread.audio.segments.map((segment) => segment.ayahKey)).toEqual([
      "2:8",
      "2:9",
      "2:10",
      "2:11",
      "2:12",
      "2:13",
      "2:14",
    ]);
  });

  it("takes each segment's bounds from the Resource's ayah timestamps", () => {
    const result = getSpread(2, 2);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    // 2:8 and 2:9 in data/recitation-alafasy/segments.json, milliseconds.
    expect(result.spread.audio.segments[0]).toEqual({
      ayahKey: "2:8",
      startMs: 81038,
      endMs: 92900,
    });
    expect(result.spread.audio.segments[1]).toEqual({
      ayahKey: "2:9",
      startMs: 93100,
      endMs: 105504,
    });
  });

  it("starts at the first ayah's segment and ends at the last ayah's segment end", () => {
    const result = getSpread(2, 2);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    // 2:8 timestamp_from and 2:14 timestamp_to.
    expect(result.spread.audio.startMs).toBe(81038);
    expect(result.spread.audio.endMs).toBe(187645);
    expect(result.spread.audio.endMs).toBe(
      result.spread.audio.segments.at(-1)?.endMs,
    );
  });

  it("uses the surah's own audio file and names the reciter", () => {
    const result = getSpread(2, 1);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.spread.audio.audioUrl).toBe(
      "https://audio-cdn.tarteel.ai/quran/surah/alafasy/murattal/mp3/002.mp3",
    );
    expect(result.spread.audio.reciterName).toBe("Mishari Rashid al-`Afasy");
  });
});

function segmentsOf(surah: number, spreadIndex: number) {
  const result = getSpread(surah, spreadIndex);
  if (result.status !== "ok") throw new Error("expected an in-range Spread");
  return result.spread.audio.segments;
}

describe("resolveAyahAtTime", () => {
  it("resolves a time inside an ayah to that ayah", () => {
    // Spread 2 of Al-Baqarah, ayahs 2:8 to 2:14.
    const segments = segmentsOf(2, 2);

    // 2:9 runs 93100 to 105504 ms.
    expect(resolveAyahAtTime(segments, 93100)).toBe("2:9");
    expect(resolveAyahAtTime(segments, 99000)).toBe("2:9");
    expect(resolveAyahAtTime(segments, 105503)).toBe("2:9");
  });

  it("gives the earlier ayah where one ends exactly as the next begins", () => {
    // Surah Al-Haqqah: 69:1 ends at 5128 ms and 69:2 starts at 5128 ms, one of
    // only two exactly abutting pairs in the Resource.
    const segments = segmentsOf(69, 1);

    expect(resolveAyahAtTime(segments, 5127)).toBe("69:1");
    expect(resolveAyahAtTime(segments, 5128)).toBe("69:1");
    expect(resolveAyahAtTime(segments, 5129)).toBe("69:2");
  });

  it("gives the earlier ayah where the next one starts before it ends", () => {
    // Spread 29 of Al-Baqarah, ayahs 2:197 to 2:203. 2:199 starts at 4536975,
    // 156 ms before 2:198 ends at 4537131 — one of the 30 overlaps in the
    // Resource.
    const segments = segmentsOf(2, 29);

    expect(resolveAyahAtTime(segments, 4536974)).toBe("2:198");
    expect(resolveAyahAtTime(segments, 4537000)).toBe("2:198");
    expect(resolveAyahAtTime(segments, 4537131)).toBe("2:198");
    expect(resolveAyahAtTime(segments, 4537132)).toBe("2:199");
  });

  it("holds the ayah just recited through the gap before the next one", () => {
    // 2:8 ends at 92900 and 2:9 starts at 93100: the 200 ms gap between ayahs
    // that the Resource uses almost everywhere.
    const segments = segmentsOf(2, 2);

    expect(resolveAyahAtTime(segments, 92901)).toBe("2:8");
    expect(resolveAyahAtTime(segments, 93099)).toBe("2:8");
  });

  it("resolves to nothing before the first ayah of the Spread", () => {
    // Spread 2 of Al-Baqarah opens at 81038 ms, deep into the surah audio.
    const segments = segmentsOf(2, 2);

    expect(resolveAyahAtTime(segments, 0)).toBeNull();
    expect(resolveAyahAtTime(segments, 81037)).toBeNull();
    expect(resolveAyahAtTime(segments, 81038)).toBe("2:8");
  });

  it("resolves to nothing after the last ayah of the Spread", () => {
    // 2:14, the Spread's last ayah, ends at 187645 ms.
    const segments = segmentsOf(2, 2);

    expect(resolveAyahAtTime(segments, 187645)).toBe("2:14");
    expect(resolveAyahAtTime(segments, 187646)).toBeNull();
    expect(resolveAyahAtTime(segments, 9_999_999)).toBeNull();
  });
});
