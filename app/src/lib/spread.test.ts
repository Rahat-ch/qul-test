import { describe, expect, it } from "vitest";

import { getSpread, listSurahs } from "./spread";

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
