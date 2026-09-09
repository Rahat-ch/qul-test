import { ImageResponse } from "next/og";

/**
 * One Open Graph card for the whole site, generated at build time. Lives at
 * the root segment so every route (surah index and Spread pages) shares it.
 * Colours match the dark palette in globals.css.
 */
export const alt = "Simple Quran, an open-book reader built on the Quranic Universal Library";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 72,
          background: "#0c0a09",
          color: "#ede9e2",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="260" height="260" viewBox="0 0 64 64">
          <path
            d="M32 18 C 26 13, 16 13, 11 16 V 48 C 16 45, 26 45, 32 50 Z"
            fill="#fbf9f4"
          />
          <path
            d="M32 18 C 38 13, 48 13, 53 16 V 48 C 48 45, 38 45, 32 50 Z"
            fill="#ede9e2"
          />
          <path d="M32 18 V 50" stroke="#0c0a09" strokeWidth="2" />
          <g stroke="#78716c" strokeWidth="2" strokeLinecap="round">
            <path d="M16 24 H 27 M16 30 H 27 M16 36 H 24" />
            <path d="M37 24 H 48 M37 30 H 48 M40 36 H 48" />
          </g>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 108, fontWeight: 600, letterSpacing: -3 }}>
            Simple Quran
          </div>
          <div style={{ fontSize: 36, color: "#a8a29e" }}>
            Read the Quran as an open book
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#78716c",
              letterSpacing: 4,
              textTransform: "uppercase",
              marginTop: 24,
            }}
          >
            quran.rahatcodes.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
