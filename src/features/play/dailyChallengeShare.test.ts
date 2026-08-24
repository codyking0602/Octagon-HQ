import { describe, expect, it, vi } from "vitest";
import { dailyChallengeShareContent, shareDailyChallengeResult } from "./dailyChallengeShare";

describe("Daily Challenge sharing", () => {
  it("keeps the UFC share identity and canonical Play route", () => {
    expect(dailyChallengeShareContent({ sport: "ufc", score: 81, centralDay: "2026-08-23" })).toEqual({
      title: "Octagon HQ Daily · 2026-08-23",
      text: "Octagon HQ Daily 2026-08-23\n81/100 · Can you beat my official score?",
      route: "/play",
    });
  });

  it("shares Football results through the canonical native share owner and Football Today route", async () => {
    const share = vi.fn(async () => undefined);
    await expect(shareDailyChallengeResult(
      { sport: "football", score: 94, centralDay: "2026-08-23" },
      { appOrigin: "https://octagon.test", shareToken: "proof", navigator: { share } },
    )).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith({
      title: "Football Daily · 2026-08-23",
      text: "Football Daily 2026-08-23\n94/100 · Can you beat my official score?",
      url: "https://octagon.test/football/today?share=proof",
    });
  });
});
