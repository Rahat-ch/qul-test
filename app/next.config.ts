import path from "node:path";

import type { NextConfig } from "next";

const repoRoot = path.join(import.meta.dirname, "..");

const nextConfig: NextConfig = {
  // Emits `.next/standalone`: a self-contained server plus only the
  // node_modules it traced, which is what the repo-root Dockerfile's runner
  // stage copies. Because `outputFileTracingRoot` below is the repo root, the
  // standalone tree mirrors the repo and the server lands at
  // `.next/standalone/app/server.js`.
  output: "standalone",
  // The bundled QUL Resources live in `data/` at the repo root, one level above
  // this app. Turbopack refuses to resolve modules outside its inferred root
  // (this directory, because the pnpm lockfile is here), so the root is widened
  // to the repo. See the header comment in src/lib/spread.ts for why the data
  // is imported rather than read with `fs`.
  turbopack: {
    root: repoRoot,
  },
  // Keeps `next build` tracing (and the ticket-06 standalone output) anchored
  // at the repo root now that modules are resolved from there.
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
