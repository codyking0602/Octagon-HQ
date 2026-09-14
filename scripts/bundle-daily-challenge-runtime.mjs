import { createHash } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(repoRoot, "supabase/functions/daily-challenge-runtime");
const footballScheduleVersion = "football-daily-v7-hit-number-pool-cleanup";
const bundles = [
  {
    label: "UFC daily runtime",
    entry: resolve(repoRoot, "src/features/play/todaysChallengeRuntime.ts"),
    fileName: "runtime.generated.mjs",
    requiredExports: ["advanceOfficialDailyRuntime", "buildOfficialDailySetup"],
  },
  {
    label: "Football Daily Who Am I publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationWhoAmI.ts"),
    fileName: "football-publication-who-am-i.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    smoke: { day: "2026-09-14", gameType: "who_am_i" },
  },
  {
    label: "Football Daily Wavelength publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationWavelength.ts"),
    fileName: "football-publication-wavelength.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    smoke: { day: "2026-09-16", gameType: "wavelength" },
  },
  {
    label: "Football Daily Find the Leader publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationFindLeader.ts"),
    fileName: "football-publication-find-leader.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    smoke: { day: "2026-09-15", gameType: "find_leader" },
  },
  {
    label: "Football Daily Blind Resume publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationBlindResume.ts"),
    fileName: "football-publication-blind-resume.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    smoke: { day: "2026-09-21", gameType: "blind_resume" },
  },
  {
    label: "Football Daily Hit the Number publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationHitNumber.ts"),
    fileName: "football-publication-hit-the-number.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    smoke: { day: "2026-09-18", gameType: "hit_the_number" },
  },
  {
    label: "Football Daily comparison publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationComparison.ts"),
    fileName: "football-publication-comparison.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    smoke: { day: "2026-09-17", gameType: "keep_4_cut_4" },
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
  "./generate-football-who-am-i-daily-universes.mjs",
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

  if (bundle.smoke) {
    const generatedRuntime = await import(`${pathToFileURL(output).href}?sha256=${digest}`);
    const publication = generatedRuntime.buildFootballDailyPersistenceSetup(
      bundle.smoke.day,
      footballScheduleVersion,
      bundle.smoke.gameType,
    );
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
      throw new Error(`${bundle.label} failed its deterministic smoke proof.`);
    }
  }

  console.log(
    `Generated canonical ${bundle.label} bundle ${digest} (${Buffer.byteLength(bundled).toLocaleString("en-US")} bytes).`,
  );
}
