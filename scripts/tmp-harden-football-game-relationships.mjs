import fs from "node:fs";

const importerPath = "scripts/import-football-game-relationships.mjs";
const sourceTestPath = "src/features/back-room/footballGameRelationshipsSource.test.ts";
const sourceManifestPath = "public/data/football/football-game-relationships.source-manifest.json";

for (const filePath of [importerPath, sourceTestPath]) {
  let text = fs.readFileSync(filePath, "utf8");
  text = text
    .replaceAll("nationalChampionshipGame", "explicitNationalChampionshipGame")
    .replaceAll("nationalChampion", "explicitNationalChampion");
  fs.writeFileSync(filePath, text);
}

const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, "utf8"));
sourceManifest.cfb.championshipSignal = {
  status: "explicit-source-note-only",
  method: "completed postseason game whose source notes contain 'national championship'",
  historicalCompleteness: "partial",
  knownExplicitSignalSeasons: [2023, 2024, 2025],
  warning: "Do not use this sparse source-note signal as complete CFB championship history."
};
fs.writeFileSync(sourceManifestPath, `${JSON.stringify(sourceManifest, null, 2)}\n`);

let importer = fs.readFileSync(importerPath, "utf8");
const sourceNeedle = "const cfbSource = { provider: sourceManifest.cfb.provider, repository: sourceManifest.cfb.repository, commit: sourceManifest.cfb.commit, license: sourceManifest.cfb.license };";
const sourceReplacement = "const cfbSource = { provider: sourceManifest.cfb.provider, repository: sourceManifest.cfb.repository, commit: sourceManifest.cfb.commit, license: sourceManifest.cfb.license, championshipSignal: sourceManifest.cfb.championshipSignal };";
if (!importer.includes(sourceNeedle)) throw new Error("Could not find canonical CFB relationship source object.");
importer = importer.replace(sourceNeedle, sourceReplacement);

const coverageNeedle = "  cfb: {\n    seasonStart:";
const coverageReplacement = "  cfb: {\n    championshipSignal: sourceManifest.cfb.championshipSignal,\n    seasonStart:";
if (!importer.includes(coverageNeedle)) throw new Error("Could not find canonical CFB relationship coverage block.");
importer = importer.replace(coverageNeedle, coverageReplacement);
fs.writeFileSync(importerPath, importer);
