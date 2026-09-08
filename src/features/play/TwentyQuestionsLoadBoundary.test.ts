import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("20 Questions lazy-load boundary", () => {
  it("keeps heavy Football factual authority out of both browser game routes", () => {
    const sharedPage = source("src/features/play/TwentyQuestionsPage.tsx");
    const runtime = source("src/features/games/twentyQuestionsRuntime.ts");
    const footballRuntime = source("src/features/games/twentyQuestionsFootballRuntimeAuthority.ts");
    const ufcRoute = source("src/features/play/UfcTwentyQuestionsPage.tsx");
    const footballRoute = source("src/features/play/FootballTwentyQuestionsPage.tsx");
    const router = source("src/app/router.tsx");

    expect(sharedPage).not.toContain("twentyQuestionsFootballAuthority");
    expect(runtime).not.toContain("twentyQuestionsFootballAuthority");
    expect(runtime).not.toContain("twentyQuestionsUfcAuthority");
    expect(footballRuntime).not.toContain("twentyQuestionsFootballAuthority");
    expect(ufcRoute).toContain("twentyQuestionsUfcAuthority");
    expect(ufcRoute).not.toContain("twentyQuestionsFootballAuthority");
    expect(footballRoute).toContain("twentyQuestionsFootballRuntimeAuthority");
    expect(footballRoute).not.toContain("twentyQuestionsFootballAuthority");
    expect(router).toContain('import("../features/play/UfcTwentyQuestionsPage")');
    expect(router).toContain('import("../features/play/FootballTwentyQuestionsPage")');
  });
});
