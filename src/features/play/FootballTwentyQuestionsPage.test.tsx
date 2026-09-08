import { describe, expect, it } from "vitest";
import { resolveFootballTwentyQuestionsLeague } from "./FootballTwentyQuestionsPage";

describe("Football 20 Questions board choice", () => {
  it("locks NFL and College boards while preserving the existing 50/50 Random chooser", () => {
    expect(resolveFootballTwentyQuestionsLeague("NFL", () => 0.99)).toBe("NFL");
    expect(resolveFootballTwentyQuestionsLeague("CFB", () => 0.01)).toBe("CFB");
    expect(resolveFootballTwentyQuestionsLeague("RANDOM", () => 0.1)).toBe("NFL");
    expect(resolveFootballTwentyQuestionsLeague("RANDOM", () => 0.9)).toBe("CFB");
  });
});
