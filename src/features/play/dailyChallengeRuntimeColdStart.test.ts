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

  it("keeps the UFC runtime as the only eager generated runtime", () => {
    expect(runtime).toContain(
      'import {\n  advanceOfficialDailyRuntime,\n  buildOfficialDailySetup,\n} from "./runtime.generated.mjs";',
    );
    expect(runtime).not.toContain(
      'buildFootballTodayRuntimeSnapshot,\n  buildOfficialDailySetup,\n} from "./runtime.generated.mjs";',
    );
  });

  it("keeps Who Am I authority split by sport so UFC cold starts do not import Football research", () => {
    const ufcRuntime = readFileSync("src/features/play/todaysChallengeRuntime.ts", "utf8");
    const footballRuntime = readFileSync("src/features/play/footballTodayChallengeRuntime.ts", "utf8");
    expect(ufcRuntime).toContain('from "../games/ufcWhoAmIAuthority"');
    expect(ufcRuntime).not.toContain('from "../games/whoAmIAuthority"');
    expect(ufcRuntime).not.toContain("footballWhoAmIAuthority");
    expect(footballRuntime).toContain('from "../games/footballWhoAmIAuthority"');
  });

  it("loads the Football runtime only through the Football request path", () => {
    expect(runtime).toContain('function loadFootballRuntime()');
    expect(runtime).toContain('import("./football-runtime.generated.mjs")');
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
