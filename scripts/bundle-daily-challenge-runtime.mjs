import { createHash } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(repoRoot, "supabase/functions/daily-challenge-runtime");
const bundles = [
  {
    label: "UFC daily runtime",
    entry: resolve(repoRoot, "src/features/play/todaysChallengeRuntime.ts"),
    fileName: "runtime.generated.mjs",
    requiredExports: ["advanceOfficialDailyRuntime", "buildOfficialDailySetup"],
  },
  {
    label: "Football daily publication fallback runtime",
    entry: resolve(repoRoot, "src/features/play/footballTodayChallengePublicationRuntime.ts"),
    fileName: "football-publication-fallback.generated.mjs",
    requiredExports: ["buildFootballTodayPersistenceSetup"],
  },
  {
    label: "Football daily advance runtime",
    entry: resolve(repoRoot, "src/features/play/footballTodayChallengeAdvanceRuntime.ts"),
    fileName: "football-advance.generated.mjs",
    requiredExports: ["advanceFootballOfficialDailyRuntime"],
  },
];

// The Football runtime imports generated canonical projections. Keep the
// bundle command self-contained for clean deployment checkouts instead of relying
// on pretypecheck/pretest having populated stale generated files first.
// Order matches the canonical source generation dependency chain used by validation.
for (const generator of [
  "./generate-football-recognizability.mjs",
  "./generate-football-cfb-player-season-recognition.mjs",
  "./generate-football-career-media-context.mjs",
  "./generate-football-factual-universe.mjs",
  "./enrich-football-hit-number-peak-seasons.mjs",
]) {
  await import(generator);
}

for (const bundle of bundles) {
  const output = resolve(outDir, bundle.fileName);
  await rm(output, { force: true });

  await build({
    configFile: false,
    root: repoRoot,
    publicDir: false,
    logLevel: "warn",
    build: {
      target: "es2022",
      minify: false,
      sourcemap: false,
      emptyOutDir: false,
      copyPublicDir: false,
      outDir,
      lib: {
        entry: bundle.entry,
        formats: ["es"],
        fileName: () => bundle.fileName,
      },
      rollupOptions: {
        output: {
          entryFileNames: bundle.fileName,
          inlineDynamicImports: true,
        },
      },
    },
  });

  const bundled = await readFile(output, "utf8");
  for (const requiredExport of bundle.requiredExports) {
    if (!bundled.includes(requiredExport)) {
      throw new Error(`${bundle.label} bundle is missing ${requiredExport}.`);
    }
  }
  if (/(?:from\s*|import\s*\()\s*["']\.{1,2}\//.test(bundled)) {
    throw new Error(`${bundle.label} bundle still contains a relative source import.`);
  }

  const digest = createHash("sha256").update(bundled).digest("hex");

  console.log(`Generated canonical ${bundle.label} bundle ${digest}.`);
}


await import("./generate-football-daily-publication-cache.mjs");

const footballPublicationOutput = resolve(outDir, "football-publication.generated.mjs");
const footballPublicationRegistry = await readFile(footballPublicationOutput, "utf8");
if (footballPublicationRegistry.includes("footballWhoAmIAuthority")) {
  throw new Error("Football Daily publication registry unexpectedly contains heavyweight Who Am I authority code.");
}
const footballPublicationDigest = createHash("sha256").update(footballPublicationRegistry).digest("hex");
const generatedFootballPublicationRuntime = await import(
  `${pathToFileURL(footballPublicationOutput).href}?sha256=${footballPublicationDigest}`
);

for (const day of ["2026-09-13", "2026-09-14"]) {
  const publication = await generatedFootballPublicationRuntime.buildFootballTodayPersistenceSetup(day);
  if (
    !publication
    || typeof publication !== "object"
    || typeof publication.setupKey !== "string"
    || !publication.setupKey
    || typeof publication.scheduleVersion !== "string"
    || !publication.scheduleVersion
    || typeof publication.gameType !== "string"
    || !publication.gameType
    || !publication.publicSetup
    || typeof publication.publicSetup !== "object"
    || !publication.privateSetupEvidence
    || typeof publication.privateSetupEvidence !== "object"
  ) {
    throw new Error(`Football daily publication cache failed its deterministic smoke proof for ${day}.`);
  }
}
console.log(`Generated canonical Football daily publication registry ${footballPublicationDigest}.`);
