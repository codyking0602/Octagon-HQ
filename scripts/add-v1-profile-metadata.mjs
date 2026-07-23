import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

function readArgument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : null;
}

function requiredArgument(name) {
  const value = readArgument(name);
  if (!value) throw new Error(`Missing required --${name} argument.`);
  return value;
}

const v1Directory = resolve(requiredArgument("v1-dir"));
const inputPath = resolve(requiredArgument("input"));

const displaySource = await readFile(resolve(v1Directory, "assets/data/display-overrides.js"), "utf8");
const rankingSource = await readFile(resolve(v1Directory, "assets/data/ranking-data.js"), "utf8");

const displayOverrides = new Function(`${displaySource}\nreturn typeof DISPLAY_OVERRIDES === "undefined" ? {} : DISPLAY_OVERRIDES;`)();
const rankingWindow = {};
const rankingData = new Function("window", `${rankingSource}\nreturn window.RANKING_DATA || {};`)(rankingWindow);

function normalizedName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, " ");
}

function firstValue(...values) {
  return values.find((value) => typeof value === "string" && value.trim())?.trim() ?? null;
}

function findPresentationCandidate(root, fighter) {
  const target = normalizedName(fighter);
  let best = null;

  function visit(value, parentKey = "") {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((entry) => visit(entry, parentKey));
      return;
    }

    const ownedName = normalizedName(value.fighter || value.name || parentKey);
    if (ownedName === target) {
      const candidate = {
        nickname: firstValue(value.nickname, value.nickName),
        signatureFightUrl: firstValue(value.signatureFightUrl, value.signatureFightURL),
      };
      if (candidate.nickname || candidate.signatureFightUrl) {
        best = { ...best, ...candidate };
      }
    }

    Object.entries(value).forEach(([key, entry]) => visit(entry, key));
  }

  visit(root);
  return best || {};
}

const dataset = JSON.parse(await readFile(inputPath, "utf8"));
for (const fighter of dataset.fighters) {
  const override = displayOverrides?.[fighter.fighter] || {};
  const captured = findPresentationCandidate(rankingData, fighter.fighter);
  fighter.presentation.nickname = firstValue(captured.nickname, override.nickname, override.nickName);
  fighter.presentation.signatureFightUrl = firstValue(
    captured.signatureFightUrl,
    override.signatureFightUrl,
    override.signatureFightURL,
  );
}

await writeFile(inputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
console.log(`Added optional V1 nickname and signature-fight metadata for ${dataset.fighters.length} fighters.`);
