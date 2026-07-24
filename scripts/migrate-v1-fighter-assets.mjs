#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const SOURCE_COMMIT = "842ba06ea09c4f40723226f4c4dfd35041cb3314";
const SOURCE_ROOT = `https://raw.githubusercontent.com/codyking0602/ufc-goat-rankings/${SOURCE_COMMIT}`;
const INPUT_PATH = path.resolve(
  "src/features/rankings/data/generated/canonical-ranking-inputs-842ba06e.json",
);
const FIGHTER_OUTPUT_DIR = path.resolve("public/assets/fighters");
const APP_ICON_OUTPUT = path.resolve("public/assets/app-icon.png");

function integerArg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) return fallback;
  const value = Number(process.argv[index + 1]);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`--${name} must be a non-negative integer.`);
  }
  return value;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function isWebP(buffer) {
  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

function isPng(buffer) {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer.subarray(1, 4).toString("ascii") === "PNG"
  );
}

async function download(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "octagon-hq-v2-asset-migration" },
  });
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function writeWebP(relativeSource, outputPath) {
  const sourceUrl = `${SOURCE_ROOT}/${relativeSource}`;
  const buffer = await download(sourceUrl);
  if (!isWebP(buffer)) {
    throw new Error(`${relativeSource} is not a valid WebP file.`);
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  return buffer.length;
}

async function migrateLogo() {
  const relativeSource = "assets/app-icon.png";
  const buffer = await download(`${SOURCE_ROOT}/${relativeSource}`);
  if (!isPng(buffer)) throw new Error(`${relativeSource} is not a valid PNG file.`);
  fs.mkdirSync(path.dirname(APP_ICON_OUTPUT), { recursive: true });
  fs.writeFileSync(APP_ICON_OUTPUT, buffer);
  console.log(`Copied app icon (${buffer.length} bytes).`);
}

async function migrateFighterBatch() {
  const dataset = JSON.parse(fs.readFileSync(INPUT_PATH, "utf8"));
  const slugs = dataset.fighters
    .map((fighter) => fighter.presentation.slug)
    .sort((left, right) => left.localeCompare(right));

  if (slugs.length !== 80 || new Set(slugs).size !== 80) {
    throw new Error(`Expected 80 unique fighter slugs, received ${slugs.length}.`);
  }

  const start = integerArg("start", 0);
  const count = integerArg("count", 10);
  const selected = slugs.slice(start, start + count);
  if (!selected.length) throw new Error(`No fighters selected at start index ${start}.`);

  let totalBytes = 0;
  for (const slug of selected) {
    const profileName = `${slug}.webp`;
    const thumbName = `${slug}-thumb.webp`;
    totalBytes += await writeWebP(
      `assets/fighters/${profileName}`,
      path.join(FIGHTER_OUTPUT_DIR, profileName),
    );
    totalBytes += await writeWebP(
      `assets/fighters/${thumbName}`,
      path.join(FIGHTER_OUTPUT_DIR, thumbName),
    );
    console.log(`Copied ${slug}.`);
  }

  console.log(
    `Copied ${selected.length} fighters (${selected.length * 2} files, ${totalBytes} bytes) from pinned V1 ${SOURCE_COMMIT}.`,
  );
}

if (hasFlag("logo")) await migrateLogo();
if (!hasFlag("logo-only")) await migrateFighterBatch();
