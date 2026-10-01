#!/usr/bin/env node
/**
 * Fails when a top-level URL segment served by src/app is not in
 * src/lib/reservedSlugs.ts. Route groups "(x)" are flattened, dynamic
 * "[x]" and private "_x" folders are ignored.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const APP_DIR = "src/app";
const source = readFileSync("src/lib/reservedSlugs.ts", "utf8");
const listBody = source.match(/RESERVED_SLUGS[^=]*=\s*\[([\s\S]*?)\];/)?.[1] ?? "";
const reserved = new Set([...listBody.matchAll(/"([^"]+)"/g)].map((m) => m[1]));

const segments = new Set();
function walk(dir, depth) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (name.startsWith("_") || name.startsWith("[") || name.startsWith("@")) continue;
    if (name.startsWith("(")) { walk(full, depth); continue; } // route group
    segments.add(name);
    // Only the FIRST segment matters for tenant collisions.
  }
}
walk(APP_DIR, 0);

const missing = [...segments].filter((s) => !reserved.has(s)).sort();
if (missing.length) {
  console.error(
    `Route segments missing from src/lib/reservedSlugs.ts:\n  ${missing.join("\n  ")}\n` +
      "Add them (and to the backend's reserved list) so a business can't claim them."
  );
  process.exit(1);
}
console.log(`reserved slugs OK (${segments.size} route segments checked)`);
