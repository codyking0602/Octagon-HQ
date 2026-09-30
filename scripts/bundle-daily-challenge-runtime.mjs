import { createHash } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(repoRoot, "supabase/functions/daily-challenge-runtime");
const footballScheduleVersion = "football-daily-v18-average-fan-oct1";
const bundles = [
  {
    label: "UFC daily runtime",
    entry: resolve(repoRoot, "src/features/play/todaysChallengeRuntime.ts"),
    fileName: "runtime.generated.mjs",
    requiredExports: ["advanceOfficialDailyRuntime", "buildOfficialDailySetup"],
  },
  {
    label: "Football Daily publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationAll.ts"),
    fileName: "football-publication.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    smokes: [
      { day: "2026-09-27", gameType: "who_am_i" },
      { day: "2026-09-16", gameType: "wavelength" },
      { day: "2026-09-15", gameType: "find_leader" },
      { day: "2026-09-21", gameType: "blind_resume" },
      { day: "2026-09-18", gameType: "hit_the_number" },
      { day: "2026-09-24", gameType: "millionaire" },
      { day: "2026-09-23", gameType: "sports_feud" },
      { day: "2026-09-29", gameType: "bar_trivia" },
      { day: "2026-10-01", gameType: "average_fan" },
      { day: "2026-09-17", gameType: "keep_4_cut_4" },
    ],
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
      // Keep deployment artifacts below the Supabase Edge Function request-size ceiling.
      // These generated bundles are runtime-only build outputs, so minification does not
      // change authored content or scoring behavior.
      minify: "oxc",
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

  const smokes = bundle.smokes ?? (bundle.smoke ? [bundle.smoke] : []);
  if (smokes.length) {
    const generatedRuntime = await import(`${pathToFileURL(output).href}?sha256=${digest}`);
    for (const smoke of smokes) {
      const publication = generatedRuntime.buildFootballDailyPersistenceSetup(
        smoke.day,
        footballScheduleVersion,
        smoke.gameType,
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
        throw new Error(`${bundle.label} failed its deterministic smoke proof for ${smoke.gameType}.`);
      }
    }
  }

  console.log(
    `Generated canonical ${bundle.label} bundle ${digest} (${Buffer.byteLength(bundled).toLocaleString("en-US")} bytes).`,
  );
}
