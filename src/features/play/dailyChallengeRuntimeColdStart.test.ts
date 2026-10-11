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
    const averageFanBranch = runtime.indexOf('if (gameType === "average_fan") {', materializationGuard);
    const averageFanLoad = runtime.indexOf('const averageFanRuntime = await loadAverageFanRuntime();', averageFanBranch);
    expect(materializationGuard).toBeGreaterThan(-1);
    expect(averageFanBranch).toBeGreaterThan(materializationGuard);
    expect(averageFanLoad).toBeGreaterThan(averageFanBranch);

    const ufcReadReturn = runtime.lastIndexOf(
      'if (body.mode === "get-today" || body.mode === undefined) {\n      return json(publicPayload(context));',
    );
    const ufcAdvanceLoad = runtime.lastIndexOf('const advanceUfcRuntime = context.gameType === "average_fan"');
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

  it("serves published Football Daily reads before loading the shared publication runtime", () => {
    expect(runtime).toContain('function loadFootballPublicationRuntime(_gameType: OfficialDailyGameType)');
    expect(runtime).toContain('function loadFootballAdvanceRuntime()');
    expect(runtime).toContain('function loadAverageFanRuntime()');
    expect(runtime).toContain('import("./average-fan.generated.mjs")');
    expect(runtime).toContain('import("./football-publication.generated.mjs")');
    expect(runtime).toContain('import("./football-advance.generated.mjs")');
    expect(runtime).not.toContain('import("./football-publication-who-am-i.generated.mjs")');
    expect(runtime).not.toContain('import("./football-publication-wavelength.generated.mjs")');
    expect(runtime).not.toContain('import("./football-publication-find-leader.generated.mjs")');
    expect(runtime).not.toContain('import("./football-publication-blind-resume.generated.mjs")');
    expect(runtime).not.toContain('import("./football-publication-hit-the-number.generated.mjs")');
    expect(runtime).not.toContain('import("./football-publication-comparison.generated.mjs")');
    const footballBranch = runtime.indexOf('if (body.sport === "football") {');
    const weeklyGate = runtime.indexOf('football_weekly_auction_daily_gate', footballBranch);
    const footballMaterialization = runtime.indexOf('const materialized = await materializeFootballToday(admin);', footballBranch);
    const footballContext = runtime.indexOf('let context = await getContext(admin, materialized.dailyChallengeId, profileId);', footballBranch);
    const continuingDaily = runtime.indexOf('const continuingFootballDaily = Number(context.progress_revision ?? 0) > 0', footballBranch);
    expect(footballBranch).toBeGreaterThan(-1);
    expect(footballMaterialization).toBeGreaterThan(footballBranch);
    expect(footballContext).toBeGreaterThan(footballMaterialization);
    expect(continuingDaily).toBeGreaterThan(footballContext);
    expect(weeklyGate).toBeGreaterThan(continuingDaily);
    expect(runtime).toContain('if (request.required !== true)');
    expect(runtime).toContain('loadFootballPublicationRuntime(expectedGame as OfficialDailyGameType)');
    expect(runtime).toContain('buildFootballDailyPersistenceSetup(');
    expect(runtime).toContain('const advanceFootballRuntime = context.gameType === "average_fan"');
    expect(runtime).toContain('(await loadAverageFanRuntime()).advanceAverageFanDailyRuntime');
    expect(runtime).not.toContain('import("./football-runtime.generated.mjs")');
  });

  it("fast-paths active Average Fan actions without repeating Daily materialization", () => {
    const start = runtime.indexOf("async function advanceExistingAverageFan(");
    const end = runtime.indexOf("async function continueTwoGameWithoutIntermission(", start);
    const fastPath = runtime.slice(start, end);

    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(fastPath).toContain('body.game_type !== "average_fan"');
    expect(fastPath).toContain('"get_daily_challenge_materialization_request"');
    expect(fastPath).not.toContain("materializeToday(");
    expect(fastPath).not.toContain("materializeFootballToday(");
    expect(fastPath).toContain("if (advanced.complete)");
    expect(fastPath).toContain('requiredRecord(saved.data, "Saved Average Fan Daily progress")');
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

  it("prepublishes both sports ahead of midnight and automatically recovers transient read failures", () => {
    const hook = readFileSync("src/features/play/useTodayChallengeRuntime.ts", "utf8");
    const play = readFileSync("src/features/play/PlayV2Page.tsx", "utf8");
    const footballPage = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");

    // The same canonical publisher handles today and the upcoming Central day.
    expect(runtime).toContain("async function materializeToday(admin: SupabaseClient, at?: string)");
    expect(runtime).toContain("async function materializeFootballToday(admin: SupabaseClient, at?: string)");
    expect(runtime).toContain('at ? { p_at: at } : {}');
    expect(runtime).toContain("...(at ? { p_at: at } : {})");
    expect(runtime).toContain('timeZone: "America/Chicago"');
    expect(runtime).toContain("now.getTime() + 30 * 60 * 1000");
    expect(runtime).toContain("centralDay(now) !== centralDay(soon)");
    expect(runtime).toContain("await materializeFootballToday(admin, soon.toISOString())");
    expect(runtime).toContain("await materializeToday(admin, soon.toISOString())");
    expect(runtime.indexOf('if (centralDay(now) !== centralDay(soon))')).toBeGreaterThan(
      runtime.indexOf('const materialized = scheduledSport === "football"'),
    );

    // No new server polling during normal play. Transient failures self-heal,
    // including the moment when a new day appears in an already-open browser tab.
    expect(hook).toContain("failureCount < 5");
    expect(hook).toContain("refetchInterval:");
    expect(hook).toContain("activeQuery.state.error && !isPermanentDailyLoadError");
    expect(hook).toContain("queryClient.invalidateQueries({");
    expect(hook).toContain("seenDay = nextDay;");
    expect(hook).toContain('error.code === "WEEKLY_AUCTION_REQUIRED"');
    expect(play).toContain("FINISH WEEKLY AUCTION →");
    expect(footballPage).toContain("setWeeklyRetryKey((value) => value + 1)");
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

  it("builds one shared Football publication artifact with smoke coverage for every active game family", () => {
    expect(bundler).toContain('src/features/play/todaysChallengeRuntime.ts');
    expect(bundler).toContain('src/features/play/footballDailyPublicationAll.ts');
    expect(bundler).toContain('src/features/play/footballTodayChallengeAdvanceRuntime.ts');
    expect(bundler).toContain('fileName: "runtime.generated.mjs"');
    expect(bundler).toContain('fileName: "average-fan.generated.mjs"');
    expect(bundler).toContain('src/features/play/averageFanDailyRuntime.ts');
    expect(bundler).toContain('fileName: "football-publication.generated.mjs"');
    expect(bundler).toContain('fileName: "football-advance.generated.mjs"');
    expect(bundler).not.toContain('fileName: "football-publication-who-am-i.generated.mjs"');
    expect(bundler).not.toContain('fileName: "football-publication-hit-the-number.generated.mjs"');
    expect(bundler).not.toContain('fileName: "football-publication-comparison.generated.mjs"');
    for (const gameType of [
      "who_am_i",
      "wavelength",
      "find_leader",
      "blind_resume",
      "hit_the_number",
      "millionaire",
      "sports_feud",
      "bar_trivia",
      "average_fan",
      "keep_4_cut_4",
    ]) {
      expect(bundler).toContain(`gameType: "${gameType}"`);
    }
    expect(bundler).not.toContain('fileName: "football-runtime.generated.mjs"');
    expect(bundler).not.toContain('src/features/play/dailyRuntimeBundle.ts');
    expect(bundler).toContain('inlineDynamicImports: true');
  });

  it("keeps GitHub Actions as the single deployment owner", () => {
    expect(backendWorkflow).toContain('node scripts/bundle-daily-challenge-runtime.mjs');
    expect(backendWorkflow).toContain('test -f supabase/functions/daily-challenge-runtime/average-fan.generated.mjs');
    expect(backendWorkflow).toContain('test -f supabase/functions/daily-challenge-runtime/football-publication.generated.mjs');
    expect(backendWorkflow).not.toContain('test -f supabase/functions/daily-challenge-runtime/football-publication-who-am-i.generated.mjs');
    expect(backendWorkflow).not.toContain('test -f supabase/functions/daily-challenge-runtime/football-publication-wavelength.generated.mjs');
    expect(backendWorkflow).not.toContain('test -f supabase/functions/daily-challenge-runtime/football-publication-find-leader.generated.mjs');
    expect(backendWorkflow).not.toContain('test -f supabase/functions/daily-challenge-runtime/football-publication-blind-resume.generated.mjs');
    expect(backendWorkflow).not.toContain('test -f supabase/functions/daily-challenge-runtime/football-publication-hit-the-number.generated.mjs');
    expect(backendWorkflow).not.toContain('test -f supabase/functions/daily-challenge-runtime/football-publication-comparison.generated.mjs');
    expect(backendWorkflow).toContain('test -f supabase/functions/daily-challenge-runtime/football-advance.generated.mjs');
    expect(backendWorkflow).toContain(
      'supabase functions deploy daily-challenge-runtime --project-ref "$SUPABASE_PROJECT_ID" --no-verify-jwt --use-docker',
    );
    expect(backendWorkflow).toContain('SUPABASE_INTERNAL_IMAGE_REGISTRY: ghcr.io');
    expect(backendWorkflow).toContain(
      'supabase functions deploy deliver-notification-push --project-ref "$SUPABASE_PROJECT_ID" --no-verify-jwt --use-api',
    );
  });
});
