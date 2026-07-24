#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requestedOutput = process.argv[2] || "artifacts/octagon-verdict";
const outputDir = path.resolve(root, requestedOutput);
const fightersDir = path.join(outputDir, "fighters");
const matchupsDir = path.join(outputDir, "matchups");

function writeJson(filePath, value) {
  return fs.writeFile(filePath, `${JSON.stringify(value)}\n`, "utf8");
}

const vite = await createServer({
  root,
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const [{ buildOctagonVerdictExport }, rankingModel, rankingInputs, rankingControls] = await Promise.all([
    vite.ssrLoadModule("/src/features/intelligence/octagonVerdictExport.ts"),
    vite.ssrLoadModule("/src/features/rankings/rankingModel.ts"),
    vite.ssrLoadModule("/src/features/rankings/data/rankingInputs.ts"),
    vite.ssrLoadModule("/src/features/rankings/rankingControls.ts"),
  ]);

  const exported = buildOctagonVerdictExport({
    fighters: rankingModel.allTime,
    inputs: rankingInputs.canonicalRankingInputs,
    divisionReport: rankingControls.divisionRankingReport,
  });

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(fightersDir, { recursive: true });
  await fs.mkdir(matchupsDir, { recursive: true });

  await Promise.all([
    writeJson(path.join(outputDir, "octagon-verdict-data.json"), exported.feed),
    writeJson(path.join(outputDir, "index.json"), exported.index),
    fs.writeFile(path.join(outputDir, "octagon-verdict-knowledge.md"), exported.knowledgeMarkdown, "utf8"),
    ...exported.fighters.map((fighter) => writeJson(path.join(fightersDir, `${fighter.slug}.json`), fighter)),
    ...exported.matchups.map((matchup) => writeJson(path.join(matchupsDir, `${matchup.pairKey}.json`), matchup)),
  ]);

  console.log(
    `Built Octagon Verdict V2 package: ${exported.fighters.length} fighters, ${Object.keys(exported.feed.divisionBoards).length} division boards, ${exported.matchups.length} direct ranked-fighter matchups.`,
  );
  console.log(`Output: ${path.relative(root, outputDir)}`);
} finally {
  await vite.close();
}
