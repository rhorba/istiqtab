#!/usr/bin/env node
/**
 * Merge Playwright video recordings into a single file.
 *
 * Usage (run from apps/web):
 *   node e2e/merge-videos.mjs
 *
 * Outputs: ../../docs/e2e-recording.webm
 *
 * Strategy:
 *   1. Collect all .webm files from test-results/
 *   2. If ffmpeg is available → concatenate them using concat demuxer
 *   3. Fallback → copy the single largest video (best single-test coverage)
 */

import { execSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_DIR = resolve(__dirname, "..");
const TEST_RESULTS = join(WEB_DIR, "test-results");
const DOCS_DIR = resolve(WEB_DIR, "../../docs");
const OUTPUT = join(DOCS_DIR, "e2e-recording.webm");

function findWebmFiles(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findWebmFiles(fullPath));
    } else if (entry.name.endsWith(".webm")) {
      results.push(fullPath);
    }
  }
  return results;
}

function hasFfmpeg() {
  try {
    const r = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
    return r.status === 0;
  } catch {
    return false;
  }
}

mkdirSync(DOCS_DIR, { recursive: true });

const videos = findWebmFiles(TEST_RESULTS).sort((a, b) => {
  return statSync(b).size - statSync(a).size; // largest first
});

if (videos.length === 0) {
  console.error("No .webm files found in", TEST_RESULTS);
  process.exit(1);
}

console.log(`Found ${videos.length} video(s)`);
videos.forEach((v, i) => {
  const size = (statSync(v).size / 1024).toFixed(0);
  console.log(`  [${i + 1}] ${v} (${size} KB)`);
});

if (videos.length === 1 || !hasFfmpeg()) {
  if (videos.length > 1) {
    console.warn("ffmpeg not found — copying largest video only (install ffmpeg for full merge)");
  }
  copyFileSync(videos[0], OUTPUT);
  console.log(`\n✓ Saved to ${OUTPUT} (${(statSync(OUTPUT).size / 1024).toFixed(0)} KB)`);
  process.exit(0);
}

// ffmpeg concat
const listFile = join(DOCS_DIR, "_concat_list.txt");
writeFileSync(
  listFile,
  videos.map((v) => `file '${v.replace(/\\/g, "/")}'`).join("\n"),
  "utf8",
);

console.log("\nRunning ffmpeg concat...");
try {
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${OUTPUT}"`,
    { stdio: "inherit" },
  );
  console.log(`\n✓ Merged ${videos.length} clips → ${OUTPUT}`);
} catch {
  // ffmpeg failed (e.g., codec mismatch) — fall back to largest video
  console.warn("ffmpeg concat failed — falling back to largest video");
  copyFileSync(videos[0], OUTPUT);
  console.log(`✓ Saved largest video to ${OUTPUT}`);
}

// Cleanup temp file
try {
  const { unlinkSync } = await import("node:fs");
  unlinkSync(listFile);
} catch {}
