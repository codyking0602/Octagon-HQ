import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("daily challenge runtime cold-start isolation", () => {
  const runtime = readFileSync(
    "supabase/functions/daily-challenge-runtime/index.ts",
    "utf8",
  );
  const bundler = readFileSync(
    "scripts/bundle-daily-challenge-runtime.mjs",
    "utf8",
  );
  const backendWorkflow = readFileSync(
    ".github/workflows/deploy-supabase.yml",
    "utf8",
  );
  const footballGenerationRuntime = readFileSync(
    "src/features/play/footballTodayChallengeRuntime.ts",
    "utf8",
  );
  const footballAdvanceRuntime = readFileSync(
    "src/features/play/footballTodayChallengeAdvanceRuntime.ts",
    "utf8",
  );
  const footballSchedulerMigration = readFileSync(
    "supabase/migrations/202612310122_football_daily_scheduler_prematerialization.sql",
    "utf8",
  );

  it("serves published UFC Daily reads before loading the generated UFC runtime", () => {
    expect(runtime).not.toContain('from "./runtime.generated.mjs";');
    expect(runtime).toContain('function loadUfcRuntime()');
    expect(runtime).toContain('import("./runtime.generated.mjs")');

    const materializationGuard = runtime.indexOf('if (request.required !== true)');
    const materializationLoad = runtime.indexOf('const ufcRuntime = await loadUfcRuntime();');
    expect(materializationGuard).toBeGreaterThan(-1);
    expect(materializationLoad).toBeGreaterThan(materializationGuard);

    const ufcReadReturn = runtime.lastIndexOf(
      'if (body.mode === "get-today" || body.mode === undefined) {\n      return json(publicPayload(context));',
    );
    const ufcAdvanceLoad = runtime.lastIndexOf('const ufcRuntime = await loadUfcRuntime();');
    expect(ufcReadReturn).toBeGreaterThan(-1);
    expect(ufcAdvanceLoad).toBeGreaterThan(ufcReadReturn);
  });

  it("keeps Who Am I authority split by sport so UFC cold starts do not import Football research", () => {
    const ufcRuntime = readFileSync("src/features/play/todaysChallengeRuntime.ts", "utf8");
    const footballRuntime = readFileSync("src/features/play/footballTodayChallengeRuntime.ts", "utf8");
    expect(ufcRuntime).toContain('from "../games/ufcWhoAmIAuthority"');
    expect(ufcRuntime).not.toContain('from "../games/whoAmIAuthority"');
    expect(ufcRuntime).not.toContain("footballWhoAmIAuthority");
    expect(footballRuntime).toContain('from "../games/footballWhoAmIDailyAuthority"');
    expect(footballRuntime).not.toContain('from "../games/footballWhoAmIAuthority"');
  });

  it("precompiles Football Who Am I research into a compact Daily universe", () => {
    const dailyAuthority = readFileSync("src/features/games/footballWhoAmIDailyAuthority.ts", "utf8");
    const generator = readFileSync("scripts/generate-football-who-am-i-daily-universes.mjs", "utf8");
    expect(dailyAuthority).toContain("who-am-i-daily-universes.json");
    expect(dailyAuthority).not.toContain("footballPersonIdentityKnowledge");
    expect(dailyAuthority).not.toContain("footballSubjectRegistry");
    expect(generator).toContain("getFootballWhoAmIUniverse");
    expect(bundler).toContain("./generate-football-who-am-i-daily-universes.mjs");
  });

  it("serves published Football Daily reads before loading only the active game publication runtime", () => {
    expect(runtime).toContain('function loadFootballPublicationRuntime(gameType: OfficialDailyGameType)');
    expect(runtime).toContain('function loadFootballAdvanceRuntime()');
    expect(runtime).toContain('import("./football-publication-who-am-i.generated.mjs")');
    expect(runtime).toContain('import("./football-publication-wavelength.generated.mjs")');
    expect(runtime).toContain('import("./football-publication-find-leader.generated.mjs")');
    expect(runtime).toContain('import("./football-publication-blind-resume.generated.mjs")');
    expect(runtime).toContain('import("./football-publication-hit-the-number.generated.mjs")');
    expect(runtime).toContain('import("./football-publication-comparison.generated.mjs")');
    expect(runtime).toContain('import("./football-advance.generated.mjs")');
    expect(runtime).not.toContain('import("./football-publication.generated.mjs")');
    const footballBranch = runtime.indexOf('if (body.sport === "football") {');
    const weeklyGate = runtime.indexOf('football_weekly_auction_daily_gate', footballBranch);
    const footballMaterialization = runtime.indexOf('const materialized = await materializeFootballToday(admin);', footballBranch);
    expect(footballBranch).toBeGreaterThan(-1);
    expect(weeklyGate).toBeGreaterThan(footballBranch);
    expect(footballMaterialization).toBeGreaterThan(weeklyGate);
    expect(runtime).toContain('if (request.required !== true)');
    expect(runtime).toContain('loadFootballPublicationRuntime(expectedGame as OfficialDailyGameType)');
    expect(runtime).toContain('buildFootballDailyPersistenceSetup(');
    expect(runtime).toContain('const footballRuntime = await loadFootballAdvanceRuntime();');
    expect(runtime).not.toContain('import("./football-runtime.generated.mjs")');
  });

  it("pre-materializes UFC and Football Daily in separate scheduled invocations", () => {
    expect(runtime).toContain('const scheduledSport = body.sport == null ? "ufc" : body.sport;');
    expect(runtime).toContain('scheduledSport === "football"');
    expect(runtime).toContain("await materializeFootballToday(admin)");
    expect(runtime).toContain("await materializeToday(admin)");
    expect(footballSchedulerMigration).toContain('{"mode":"scheduled","sport":"ufc"}');
    expect(footballSchedulerMigration).toContain('{"mode":"scheduled","sport":"football"}');
    expect(footballSchedulerMigration.match(/functions\/v1\/daily-challenge-runtime/g)).toHaveLength(2);
    expect(footballSchedulerMigration).toContain("active := true");
  });

  it("keeps Football Hit the Number generation and quality work out of ordinary Daily actions", () => {
    expect(footballGenerationRuntime).toContain("createFootballHitTheNumberPlan");
    expect(footballGenerationRuntime).toContain("footballHitTheNumberProgressionSlotSubjectIds");
    expect(footballGenerationRuntime).toContain("progression_slot_subject_ids");
    expect(footballAdvanceRuntime).toContain("progression_slot_subject_ids");
    expect(footballAdvanceRuntime).not.toContain("footballHitTheNumberModel");
    expect(footballAdvanceRuntime).not.toContain("createFootballHitTheNumberPlan");
    expect(footballAdvanceRuntime).not.toContain("footballHitTheNumberPlanQuality");
    expect(footballAdvanceRuntime).not.toContain('from "./footballTodayChallengeRuntime"');
  });

  it("builds one Football publication artifact per active game family", () => {
    expect(bundler).toContain('src/features/play/todaysChallengeRuntime.ts');
    expect(bundler).toContain('src/features/play/footballDailyPublicationWhoAmI.ts');
    expect(bundler).toContain('src/features/play/footballDailyPublicationWavelength.ts');
    expect(bundler).toContain('src/features/play/footballDailyPublicationFindLeader.ts');
    expect(bundler).toContain('src/features/play/footballDailyPublicationBlindResume.ts');
    expect(bundler).toContain('src/features/play/footballDailyPublicationHitNumber.ts');
    expect(bundler).toContain('src/features/play/footballDailyPublicationComparison.ts');
    expect(bundler).toContain('src/features/play/footballTodayChallengeAdvanceRuntime.ts');
    expect(bundler).toContain('fileName: "runtime.generated.mjs"');
    expect(bundler).toContain('fileName: "football-publication-who-am-i.generated.mjs"');
    expect(bundler).toContain('fileName: "football-publication-hit-the-number.generated.mjs"');
    expect(bundler).toContain('fileName: "football-publication-comparison.generated.mjs"');
    expect(bundler).not.toContain('fileName: "football-publication.generated.mjs"');
    expect(bundler).toContain('fileName: "football-advance.generated.mjs"');
    expect(bundler).not.toContain('fileName: "football-runtime.generated.mjs"');
    expect(bundler).not.toContain('src/features/play/dailyRuntimeBundle.ts');
    expect(bundler).toContain('inlineDynamicImports: true');
  });

  it("keeps GitHub Actions as the single deployment owner", () => {
    expect(backendWorkflow).toContain('node scripts/bundle-daily-challenge-runtime.mjs');
    expect(backendWorkflow).toContain('test -f supabase/functions/daily-challenge-runtime/football-publication-who-am-i.generated.mjs');
    expect(backendWorkflow).toContain('test -f supabase/functions/daily-challenge-runtime/football-publication-wavelength.generated.mjs');
    expect(backendWorkflow).toContain('test -f supabase/functions/daily-challenge-runtime/football-publication-find-leader.generated.mjs');
    expect(backendWorkflow).toContain('test -f supabase/functions/daily-challenge-runtime/football-publication-blind-resume.generated.mjs');
    expect(backendWorkflow).toContain('test -f supabase/functions/daily-challenge-runtime/football-publication-hit-the-number.generated.mjs');
    expect(backendWorkflow).toContain('test -f supabase/functions/daily-challenge-runtime/football-publication-comparison.generated.mjs');
    expect(backendWorkflow).not.toContain('test -f supabase/functions/daily-challenge-runtime/football-publication.generated.mjs');
    expect(backendWorkflow).toContain('test -f supabase/functions/daily-challenge-runtime/football-advance.generated.mjs');
    expect(backendWorkflow).toContain('supabase functions deploy daily-challenge-runtime');
  });
});
