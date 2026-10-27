import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildFootballDailyPersistenceSetup as fullPublication } from "../features/play/footballDailyPublicationAll";
import { buildFootballDailyPersistenceSetup as leanWavelength } from "../features/play/footballDailyPublicationWavelength";

const day = "2026-10-27";
const schedule = "football-daily-v22-higher-lower-oct27";

describe("October 27 Football Daily rollover CPU-limit regression", () => {
  it("publishes the exact canonical two-game Wavelength board from the isolated builder", () => {
    const actual = leanWavelength(day, schedule, "wavelength");
    expect(actual).toEqual(fullPublication(day, schedule, "wavelength"));
    expect(actual.gameType).toBe("wavelength");
    expect(actual.scheduleVersion).toBe(schedule);
    expect(actual.publicSetup).toHaveProperty("initial_state");
  });

  it("never loads the all-game Football publication bundle for Wavelength", () => {
    const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
    const bundler = readFileSync("scripts/bundle-daily-challenge-runtime.mjs", "utf8");
    const deploy = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");
    const lean = "football-wavelength-publication.generated.mjs";
    expect(edge).toContain('if (gameType === "wavelength")');
    expect(edge).toContain('import("./' + lean + '")');
    expect(bundler).toContain('fileName: "' + lean + '"');
    expect(bundler).toContain('day: "2026-10-27", gameType: "wavelength"');
    expect(deploy).toContain("test -f supabase/functions/daily-challenge-runtime/" + lean);
  });
  it("uses a separately bundled canonical Wavelength scorer for answers", () => {
    const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
    const bundler = readFileSync("scripts/bundle-daily-challenge-runtime.mjs", "utf8");
    const deploy = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");
    const lean = "football-wavelength-advance.generated.mjs";
    expect(edge).toContain('import("./' + lean + '")');
    expect(edge).toContain('context.gameType === "wavelength" && !isDailyCombo(context)');
    expect(edge).toContain('advanceFootballWavelengthDailyRuntime');
    expect(bundler).toContain('entry: resolve(repoRoot, "src/features/play/footballWavelengthDailyAdvance.ts")');
    expect(bundler).toContain('fileName: "' + lean + '"');
    expect(deploy).toContain("test -f supabase/functions/daily-challenge-runtime/" + lean);
  });

});
