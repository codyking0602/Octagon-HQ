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

  it("keeps both generated game runtimes off the eager cold-start path", () => {
    expect(runtime).not.toContain('from "./runtime.generated.mjs"');
    expect(runtime).not.toContain('from "./football-runtime.generated.mjs"');
    expect(runtime).toContain('function loadUfcRuntime()');
    expect(runtime).toContain('import("./runtime.generated.mjs")');
    expect(runtime).toContain('function loadFootballRuntime()');
    expect(runtime).toContain('import("./football-runtime.generated.mjs")');
  });

  it("does not load the UFC engine when today's persisted setup already exists", () => {
    const materializeStart = runtime.indexOf("async function materializeToday");
    const materializeEnd = runtime.indexOf("async function materializeFootballToday");
    const materialize = runtime.slice(materializeStart, materializeEnd);

    expect(materialize.indexOf("if (request.required !== true)")).toBeGreaterThan(-1);
    expect(materialize.indexOf("const ufcRuntime = await loadUfcRuntime();")).toBeGreaterThan(
      materialize.indexOf("if (request.required !== true)"),
    );
  });

  it("keeps normal UFC get-today reads engine-free and loads the engine only for advance", () => {
    const ufcRequest = runtime.slice(runtime.lastIndexOf("const materialized = await materializeToday(admin);"));

    expect(ufcRequest.indexOf('if (body.mode === "get-today" || body.mode === undefined)')).toBeGreaterThan(-1);
    expect(ufcRequest.indexOf("const ufcRuntime = await loadUfcRuntime();")).toBeGreaterThan(
      ufcRequest.indexOf('if (body.mode === "get-today" || body.mode === undefined)'),
    );
  });

  it("loads the Football runtime only through the Football request path", () => {
    expect(runtime).toContain('if (body.sport === "football") {\n      const footballRuntime = await loadFootballRuntime();');
  });

  it("builds separate standalone UFC and Football artifacts under the canonical function owner", () => {
    expect(bundler).toContain('src/features/play/todaysChallengeRuntime.ts');
    expect(bundler).toContain('src/features/play/footballTodayChallengeSession.ts');
    expect(bundler).toContain('fileName: "runtime.generated.mjs"');
    expect(bundler).toContain('fileName: "football-runtime.generated.mjs"');
    expect(bundler).not.toContain('src/features/play/dailyRuntimeBundle.ts');
    expect(bundler).toContain('inlineDynamicImports: true');
  });

  it("keeps GitHub Actions as the single deployment owner", () => {
    expect(backendWorkflow).toContain('node scripts/bundle-daily-challenge-runtime.mjs');
    expect(backendWorkflow).toContain('supabase functions deploy daily-challenge-runtime');
  });
});