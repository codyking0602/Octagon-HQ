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
    expect(footballRuntime).toContain('from "../games/footballWhoAmIAuthority"');
  });

  it("serves published Football Daily reads before loading a generated Football runtime", () => {
    expect(runtime).toContain('function loadFootballPublicationRuntime()');
    expect(runtime).toContain('function loadFootballAdvanceRuntime()');
    expect(runtime).toContain('import("./football-publication.generated.mjs")');
    expect(runtime).toContain('import("./football-advance.generated.mjs")');
    expect(runtime).toContain('if (body.sport === "football") {\n      const materialized = await materializeFootballToday(admin);');
    expect(runtime).toContain('if (request.required !== true)');
    expect(runtime).toContain('const footballRuntime = await loadFootballPublicationRuntime();');
    expect(runtime).toContain('const footballRuntime = await loadFootballAdvanceRuntime();');
    expect(runtime).not.toContain('import("./football-runtime.generated.mjs")');
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

  it("builds separate UFC, Football publication, and Football advance artifacts under one function owner", () => {
    expect(bundler).toContain('src/features/play/todaysChallengeRuntime.ts');
    expect(bundler).toContain('src/features/play/footballTodayChallengePublicationRuntime.ts');
    expect(bundler).toContain('src/features/play/footballTodayChallengeAdvanceRuntime.ts');
    expect(bundler).toContain('fileName: "runtime.generated.mjs"');
    expect(bundler).toContain('fileName: "football-publication.generated.mjs"');
    expect(bundler).toContain('fileName: "football-advance.generated.mjs"');
    expect(bundler).not.toContain('fileName: "football-runtime.generated.mjs"');
    expect(bundler).not.toContain('src/features/play/dailyRuntimeBundle.ts');
    expect(bundler).toContain('inlineDynamicImports: true');
  });

  it("keeps GitHub Actions as the single deployment owner", () => {
    expect(backendWorkflow).toContain('node scripts/bundle-daily-challenge-runtime.mjs');
    expect(backendWorkflow).toContain('test -f supabase/functions/daily-challenge-runtime/football-publication.generated.mjs');
    expect(backendWorkflow).toContain('test -f supabase/functions/daily-challenge-runtime/football-advance.generated.mjs');
    expect(backendWorkflow).toContain('supabase functions deploy daily-challenge-runtime');
  });
});
