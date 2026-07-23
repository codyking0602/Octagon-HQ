import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import vm from "node:vm";

function readArgument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : null;
}

function requiredArgument(name) {
  const value = readArgument(name);
  if (!value) throw new Error(`Missing required --${name} argument.`);
  return value;
}

function youtubeUrl(value, fighter) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing Watch Moment URL for ${fighter}.`);
  }
  const url = new URL(value);
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "youtube.com" && host !== "youtu.be") {
    throw new Error(`Watch Moment URL for ${fighter} is not a YouTube URL.`);
  }
  return value;
}

const inputPath = resolve(requiredArgument("input"));
const v1Directory = resolve(requiredArgument("v1-dir"));
const overrideSource = await readFile(
  resolve(v1Directory, "assets/data/display-overrides.js"),
  "utf8",
);
const watchMomentSource = await readFile(
  resolve(v1Directory, "assets/js/watch-moments.js"),
  "utf8",
);

const context = vm.createContext({});
vm.runInContext(
  `${overrideSource}\nglobalThis.__DISPLAY_OVERRIDES__ = DISPLAY_OVERRIDES;`,
  context,
);
const displayOverrides = context.__DISPLAY_OVERRIDES__;

const watchMomentMatch = watchMomentSource.match(
  /const WATCH_MOMENTS\s*=\s*(\{[\s\S]*?\})\s*;\s*const SIGNATURE_FIGHTS/,
);
if (!watchMomentMatch) throw new Error("Could not read the pinned V1 Watch Moment map.");
const watchMoments = vm.runInNewContext(`(${watchMomentMatch[1]})`);

const dataset = JSON.parse(await readFile(inputPath, "utf8"));
for (const fighter of dataset.fighters) {
  const overrideUrl = displayOverrides?.[fighter.fighter]?.watchUrl;
  const mappedUrl = watchMoments?.[fighter.fighter];
  fighter.presentation.watchUrl = youtubeUrl(overrideUrl || mappedUrl, fighter.fighter);
}

await writeFile(inputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
console.log(`Added Watch Moment URLs for ${dataset.fighters.length} fighters.`);
