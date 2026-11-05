import { createHash } from "node:crypto";
import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(repoRoot, "supabase/functions/daily-challenge-runtime");
const footballScheduleVersion = "football-daily-v18-average-fan-oct1";
const bundles = [
  {
    label: "UFC Blind Rank and Keep/Cut action-only runtime",
    entry: resolve(repoRoot, "src/features/play/leanDaily/UfcComparisonAdvance.ts"),
    fileName: "ufc-comparison-advance.generated.mjs",
    requiredExports: ["advanceOfficialDailyGameRuntime"],
  },
  {
    label: "UFC Find the Leader action-only runtime",
    entry: resolve(repoRoot, "src/features/play/leanDaily/UfcFindLeaderAdvance.ts"),
    fileName: "ufc-find-leader-advance.generated.mjs",
    requiredExports: ["advanceOfficialDailyGameRuntime"],
  },
  {
    label: "UFC Wavelength action-only runtime",
    entry: resolve(repoRoot, "src/features/play/leanDaily/UfcWavelengthAdvance.ts"),
    fileName: "ufc-wavelength-advance.generated.mjs",
    requiredExports: ["advanceOfficialDailyGameRuntime"],
  },
  {
    label: "Football comparison action-only runtime",
    entry: resolve(repoRoot, "src/features/play/leanDaily/FootballComparisonAdvance.ts"),
    fileName: "football-comparison-advance.generated.mjs",
    requiredExports: ["advanceOfficialDailyGameRuntime"],
  },
  {
    label: "legacy-feud action-only Daily runtime",
    entry: resolve(repoRoot, "src/features/play/leanDaily/LegacyFeudAdvance.ts"),
    fileName: "legacy-feud-advance.generated.mjs",
    requiredExports: ["advanceOfficialDailyGameRuntime"],
  },
  {
    label: "bar-trivia action-only Daily runtime",
    entry: resolve(repoRoot, "src/features/play/leanDaily/BarTriviaAdvance.ts"),
    fileName: "bar-trivia-advance.generated.mjs",
    requiredExports: ["advanceOfficialDailyGameRuntime"],
  },
  {
    label: "ufc-higher-lower action-only Daily runtime",
    entry: resolve(repoRoot, "src/features/play/leanDaily/UfcHigherLowerAdvance.ts"),
    fileName: "ufc-higher-lower-advance.generated.mjs",
    requiredExports: ["advanceOfficialDailyGameRuntime"],
  },
  {
    label: "football-higher-lower action-only Daily runtime",
    entry: resolve(repoRoot, "src/features/play/leanDaily/FootballHigherLowerAdvance.ts"),
    fileName: "football-higher-lower-advance.generated.mjs",
    requiredExports: ["advanceOfficialDailyGameRuntime"],
  },
  {
    label: "ufc-hit-number action-only Daily runtime",
    entry: resolve(repoRoot, "src/features/play/leanDaily/UfcHitNumberAdvance.ts"),
    fileName: "ufc-hit-number-advance.generated.mjs",
    requiredExports: ["advanceOfficialDailyGameRuntime"],
  },
  {
    label: "football-find-leader action-only Daily runtime",
    entry: resolve(repoRoot, "src/features/play/leanDaily/FootballFindLeaderAdvance.ts"),
    fileName: "football-find-leader-advance.generated.mjs",
    requiredExports: ["advanceOfficialDailyGameRuntime"],
  },
  {
    label: "UFC daily runtime",
    entry: resolve(repoRoot, "src/features/play/todaysChallengeRuntime.ts"),
    fileName: "runtime.generated.mjs",
    requiredExports: ["advanceOfficialDailyRuntime", "buildOfficialDailySetup"],
  },
  {
    label: "Football Hit the Number Daily answer-only runtime",
    entry: resolve(repoRoot, "src/features/play/footballHitNumberDailyAdvance.ts"),
    fileName: "football-hit-number-advance.generated.mjs",
    requiredExports: ["advanceFootballHitNumberDailyRuntime"],
  },
  {
    label: "Football Wavelength Daily answer-only runtime",
    entry: resolve(repoRoot, "src/features/play/footballWavelengthDailyAdvance.ts"),
    fileName: "football-wavelength-advance.generated.mjs",
    requiredExports: ["advanceFootballWavelengthDailyRuntime"],
  },
  {
    label: "Millionaire Daily answer-only runtime",
    entry: resolve(repoRoot, "src/features/play/millionaireDailyAdvance.ts"),
    fileName: "millionaire-advance.generated.mjs",
    requiredExports: ["advanceMillionaireDailyRuntime"],
  },
  {
    label: "Average Fan Daily edge runtime",
    entry: resolve(repoRoot, "src/features/play/averageFanDailyRuntime.ts"),
    fileName: "average-fan.generated.mjs",
    requiredExports: ["advanceAverageFanDailyRuntime", "buildAverageFanDailySetup"],
  },
  {
    label: "Football Average Fan lean publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationAverageFan.ts"),
    fileName: "football-average-fan-publication.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    smokes: [{ day: "2026-11-02", gameType: "average_fan", scheduleVersion: "football-daily-v22-higher-lower-oct27" }],
  },
  {
    // The October 27 Wavelength board requires two canonical rounds; importing
    // unrelated Football question banks can exceed the Edge CPU allocation.
    label: "Football Wavelength Daily lean publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationWavelength.ts"),
    fileName: "football-wavelength-publication.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    smokes: [
      { day: "2026-10-27", gameType: "wavelength", scheduleVersion: "football-daily-v22-higher-lower-oct27" },
    ],
  },
  {
    // October 26 Football Millionaire and all later Millionaire boards must
    // publish without evaluating unrelated large Football question banks.
    label: "Football Millionaire Daily lean publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationMillionaire.ts"),
    fileName: "football-millionaire-publication.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    smokes: [
      { day: "2026-10-26", gameType: "millionaire", scheduleVersion: "football-daily-v21-locked-oct25" },
    ],
  },
  {
    label: "Football Bar Trivia lean publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationBarTrivia.ts"),
    fileName: "football-bar-trivia-publication.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    // Publish the actual locked future schedule, including the incident date.
    smokes: [{ day: "2026-10-29", gameType: "bar_trivia", scheduleVersion: "football-daily-v22-higher-lower-oct27" }],
  },
  {
    label: "Football Sports Feud lean publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationSportsFeud.ts"),
    fileName: "football-sports-feud-publication.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    // Publish the actual locked future schedule, including the incident date.
    smokes: [{ day: "2026-10-30", gameType: "sports_feud", scheduleVersion: "football-daily-v22-higher-lower-oct27" }],
  },
  {
    label: "Football Who Am I lean publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationWhoAmI.ts"),
    fileName: "football-who-am-i-publication.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    // Publish the actual locked future schedule, including the incident date.
    smokes: [{ day: "2026-11-01", gameType: "who_am_i", scheduleVersion: "football-daily-v22-higher-lower-oct27" }],
  },
  {
    label: "Football Find the Leader lean publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationFindLeader.ts"),
    fileName: "football-find-leader-publication.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    // Publish the actual locked future schedule, including the incident date.
    smokes: [{ day: "2026-11-03", gameType: "find_leader", scheduleVersion: "football-daily-v22-higher-lower-oct27" }],
  },
  {
    label: "Football Hit the Number lean publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationHitNumber.ts"),
    fileName: "football-hit-the-number-publication.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    // Publish the actual locked future schedule, including the incident date.
    smokes: [{ day: "2026-11-08", gameType: "hit_the_number", scheduleVersion: "football-daily-v22-higher-lower-oct27" }],
  },
  {
    label: "Football Higher or Lower lean publication runtime",
    entry: resolve(repoRoot, "src/features/play/footballDailyPublicationHigherLower.ts"),
    fileName: "football-higher-lower-publication.generated.mjs",
    requiredExports: ["buildFootballDailyPersistenceSetup"],
    // Publish the actual locked future schedule, including the incident date.
    smokes: [{ day: "2026-11-05", gameType: "higher_lower", scheduleVersion: "football-daily-v22-higher-lower-oct27" }],
  },
  {
    label: "Football daily advance runtime",
    entry: resolve(repoRoot, "src/features/play/footballTodayChallengeAdvanceRuntime.ts"),
    fileName: "football-advance.generated.mjs",
    requiredExports: ["advanceFootballOfficialDailyRuntime"],
  },
  {
    label: "NBA daily publication runtime",
    entry: resolve(repoRoot, "src/features/nba/nbaDailyServerPublication.ts"),
    fileName: "nba-publication.generated.mjs",
    requiredExports: ["buildNbaServerDailyPublication", "nbaDailyGameAppearance"],
    nbaSmokes: [
      { day: "2026-11-15", gameType: "average_fan" },
      { day: "2026-11-01", gameType: "sports_feud" },
      { day: "2026-11-03", gameType: "who_am_i" },
      { day: "2026-11-05", gameType: "millionaire" },
      { day: "2026-11-07", gameType: "hit_the_number" },
      { day: "2026-11-09", gameType: "find_leader" },
      { day: "2026-11-11", gameType: "wavelength" },
      { day: "2026-11-19", gameType: "bar_trivia" },
      { day: "2026-11-17", gameType: "higher_lower" },
    ],
  },
  {
    label: "NBA Who Am I lean publication runtime",
    entry: resolve(repoRoot, "src/features/nba/nbaWhoAmIDailyPublicationLean.ts"),
    fileName: "nba-who-am-i-publication.generated.mjs",
    requiredExports: ["buildNbaWhoAmIDailyLeanPublication"],
  },
  {
    label: "NBA Sports Feud lean advance runtime",
    entry: resolve(repoRoot, "src/features/play/familyFeudDailyCore.ts"),
    fileName: "nba-feud-advance.generated.mjs",
    requiredExports: ["advanceFamilyFeudDailyCore"],
  },
  {
    label: "NBA Who Am I canonical lean answer runtime",
    entry: resolve(repoRoot, "src/features/play/whoAmITwoRoundDailyRuntime.ts"),
    fileName: "who-am-i-advance.generated.mjs",
    requiredExports: ["advanceCanonicalWhoAmIDailyRuntime"],
  },
  {
    label: "NBA AverageFan lean publication",
    entry: resolve(repoRoot, "src/features/nba/lean/AverageFanPublication.ts"),
    fileName: "nba-average-fan-publication.generated.mjs",
    requiredExports: ["buildNbaServerDailyPublication"],
    nbaSmokes: [{ day: "2026-11-15", gameType: "average_fan" }],
  },
  {
    label: "NBA SportsFeud lean publication",
    entry: resolve(repoRoot, "src/features/nba/lean/SportsFeudPublication.ts"),
    fileName: "nba-sports-feud-publication.generated.mjs",
    requiredExports: ["buildNbaServerDailyPublication"],
    nbaSmokes: [{ day: "2026-11-01", gameType: "sports_feud" }],
  },
  {
    label: "NBA Millionaire lean publication",
    entry: resolve(repoRoot, "src/features/nba/lean/MillionairePublication.ts"),
    fileName: "nba-millionaire-publication.generated.mjs",
    requiredExports: ["buildNbaServerDailyPublication"],
    nbaSmokes: [{ day: "2026-11-05", gameType: "millionaire" }],
  },
  {
    label: "NBA HitNumber lean publication",
    entry: resolve(repoRoot, "src/features/nba/lean/HitNumberPublication.ts"),
    fileName: "nba-hit-the-number-publication.generated.mjs",
    requiredExports: ["buildNbaServerDailyPublication"],
    nbaSmokes: [{ day: "2026-11-07", gameType: "hit_the_number" }],
  },
  {
    label: "NBA FindLeader lean publication",
    entry: resolve(repoRoot, "src/features/nba/lean/FindLeaderPublication.ts"),
    fileName: "nba-find-leader-publication.generated.mjs",
    requiredExports: ["buildNbaServerDailyPublication"],
    nbaSmokes: [{ day: "2026-11-09", gameType: "find_leader" }],
  },
  {
    label: "NBA Wavelength lean publication",
    entry: resolve(repoRoot, "src/features/nba/lean/WavelengthPublication.ts"),
    fileName: "nba-wavelength-publication.generated.mjs",
    requiredExports: ["buildNbaServerDailyPublication"],
    nbaSmokes: [{ day: "2026-11-11", gameType: "wavelength" }],
  },
  {
    label: "NBA HigherLower lean publication",
    entry: resolve(repoRoot, "src/features/nba/lean/HigherLowerPublication.ts"),
    fileName: "nba-higher-lower-publication.generated.mjs",
    requiredExports: ["buildNbaServerDailyPublication"],
    nbaSmokes: [{ day: "2026-11-17", gameType: "higher_lower" }],
  },
  {
    label: "NBA BarTrivia lean publication",
    entry: resolve(repoRoot, "src/features/nba/lean/BarTriviaPublication.ts"),
    fileName: "nba-bar-trivia-publication.generated.mjs",
    requiredExports: ["buildNbaServerDailyPublication"],
    nbaSmokes: [{ day: "2026-11-19", gameType: "bar_trivia" }],
  },
  {
    label: "NBA BarTrivia lean answer",
    entry: resolve(repoRoot, "src/features/nba/lean/BarTriviaAdvance.ts"),
    fileName: "nba-bar-trivia-advance.generated.mjs",
    requiredExports: ["advanceNbaOfficialDailyRuntime"],
  },
  {
    label: "NBA FindLeader lean answer",
    entry: resolve(repoRoot, "src/features/nba/lean/FindLeaderAdvance.ts"),
    fileName: "nba-find-leader-advance.generated.mjs",
    requiredExports: ["advanceNbaOfficialDailyRuntime"],
  },
  {
    label: "NBA Wavelength lean answer",
    entry: resolve(repoRoot, "src/features/nba/lean/WavelengthAdvance.ts"),
    fileName: "nba-wavelength-advance.generated.mjs",
    requiredExports: ["advanceNbaOfficialDailyRuntime"],
  },
  {
    label: "NBA HitNumber lean answer",
    entry: resolve(repoRoot, "src/features/nba/lean/HitNumberAdvance.ts"),
    fileName: "nba-hit-the-number-advance.generated.mjs",
    requiredExports: ["advanceNbaOfficialDailyRuntime"],
  },
  {
    label: "NBA HigherLower lean answer",
    entry: resolve(repoRoot, "src/features/nba/lean/HigherLowerAdvance.ts"),
    fileName: "nba-higher-lower-advance.generated.mjs",
    requiredExports: ["advanceNbaOfficialDailyRuntime"],
  },
  {
    label: "NBA daily advance runtime",
    entry: resolve(repoRoot, "src/features/nba/nbaDailyServerAdvance.ts"),
    fileName: "nba-advance.generated.mjs",
    requiredExports: ["advanceNbaOfficialDailyRuntime"],
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

// Explicitly discard obsolete all-game bundle left by prior local builds.
await rm(resolve(outDir, "football-publication.generated.mjs"), { force: true });

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

  const smokes = bundle.smokes ?? bundle.nbaSmokes ?? (bundle.smoke ? [bundle.smoke] : []);
  if (smokes.length) {
    const generatedRuntime = await import(`${pathToFileURL(output).href}?sha256=${digest}`);
    for (const smoke of smokes) {
      const publication = bundle.nbaSmokes
        ? generatedRuntime.buildNbaServerDailyPublication(
            smoke.day,
            "nba-daily-regular-v3-oct30-public",
            smoke.gameType,
          )
        : generatedRuntime.buildFootballDailyPersistenceSetup(
            smoke.day,
            smoke.scheduleVersion ?? footballScheduleVersion,
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

    // The canonical Higher or Lower generator builds a large factual pair pool.
    // It is safe to run during CI, but exceeds the Supabase Edge CPU budget on
    // first publication. Compile the ENTIRE locked six-month calendar at build
    // time, carrying the same prior-board exclusion history across appearances.
    // Edge imports only frozen JSON data, not the expensive question generator.
    if (bundle.fileName === "football-higher-lower-publication.generated.mjs") {
      const scheduleVersion = "football-daily-v22-higher-lower-oct27";
      const anchorUtc = Date.UTC(2026, 9, 27);
      const lastUtc = Date.UTC(2027, 3, 24);
      const cycleLength = 28;
      const higherLowerOffsets = [9, 24]; // Canonical V22 cycle, anchored Oct 27.
      const frozenPublications = {};
      let previousQuestions = [];
      for (let cycle = 0; anchorUtc + cycle * cycleLength * 86_400_000 <= lastUtc; cycle += 1) {
        for (const offset of higherLowerOffsets) {
          const at = anchorUtc + (cycle * cycleLength + offset) * 86_400_000;
          if (at > lastUtc) continue;
          const day = new Date(at).toISOString().slice(0, 10);
          const publication = generatedRuntime.buildFootballDailyPersistenceSetup(
            day, scheduleVersion, "higher_lower", previousQuestions,
          );
          const questions = publication.privateSetupEvidence?.rounds?.flatMap(
            (round) => round.private_setup_evidence?.board?.questions ?? [],
          );
          if (!Array.isArray(questions) || questions.length !== 20) {
            throw new Error(`Higher or Lower prepublication ${day} did not produce 20 verified questions.`);
          }
          frozenPublications[day] = publication;
          previousQuestions = [...previousQuestions, ...questions];
        }
      }
      if (!frozenPublications["2026-11-05"]) {
        throw new Error("The November 5 Football Daily Higher or Lower recovery board is missing.");
      }
      const lightweight = [
        "// Canonical Higher or Lower boards compiled and validated during deployment.",
        "// This private Edge module contains answers. Never serve it as a public asset.",
        `const SCHEDULE_VERSION = ${JSON.stringify(scheduleVersion)};`,
        `const FROZEN_PUBLICATIONS = ${JSON.stringify(frozenPublications)};`,
        "export function buildFootballDailyPersistenceSetup(day, scheduleVersion, gameType) {",
        '  if (gameType !== "higher_lower" || scheduleVersion !== SCHEDULE_VERSION) {',
        '    throw new Error("Football Higher or Lower schedule identity does not match the compiled release.");',
        "  }",
        "  const publication = FROZEN_PUBLICATIONS[day];",
        '  if (!publication) throw new Error("Football Higher or Lower day is not certified for this release.");',
        "  return publication;",
        "}",
        "",
      ].join("\n");
      await writeFile(output, lightweight, "utf8");
      const compiled = await import(
        `${pathToFileURL(output).href}?compiled=${createHash("sha256").update(lightweight).digest("hex")}`
      );
      const restored = compiled.buildFootballDailyPersistenceSetup(
        "2026-11-05", scheduleVersion, "higher_lower",
      );
      if (JSON.stringify(restored) !== JSON.stringify(frozenPublications["2026-11-05"])) {
        throw new Error("The private Higher or Lower Edge artifact changed its canonical board.");
      }
      console.log(
        `Compiled ${Object.keys(frozenPublications).length} locked Football Higher or Lower dates without Edge CPU generation.`,
      );
    }
  }

  const deployedBundle = await readFile(output, "utf8");
  const deployedDigest = createHash("sha256").update(deployedBundle).digest("hex");
  console.log(
    `Generated canonical ${bundle.label} bundle ${deployedDigest} (${Buffer.byteLength(deployedBundle).toLocaleString("en-US")} bytes).`,
  );
}
