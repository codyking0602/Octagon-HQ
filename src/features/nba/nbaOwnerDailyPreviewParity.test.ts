import { describe, expect, it } from "vitest";
import { nbaWhoAmIDailyPreviewRounds } from "../play/nbaWhoAmIDailyPreview";
import nbaWhoSource from "../play/NbaWhoAmIPage.tsx?raw";
import sharedWhoSource from "../play/WhoAmIPage.tsx?raw";
import nbaHitSource from "./NbaHitTheNumberPage.tsx?raw";
import nbaHubSource from "./NbaPlayPage.tsx?raw";
import { NBA_OFFICIAL_GAMES_RELEASE_READY } from "./nbaDailySchedule";
import { dailyLineupIdentity } from "../play/lineupModel";
import { createNbaHitTheNumberPlan, NBA_HIT_THE_NUMBER_GAME_ID } from "./nbaHitTheNumberModel";

describe("NBA Daily owner previews — no official submissions", () => {
  it("generates two deterministic, distinct authored Who Am I rounds for any owner preview date", () => {
    for (const day of ["2026-10-26", "2026-11-01", "2027-01-15"]) {
      const a = nbaWhoAmIDailyPreviewRounds(day);
      const b = nbaWhoAmIDailyPreviewRounds(day);
      expect(a).toHaveLength(2);
      expect(a[0].hiddenSubject.id).not.toBe(a[1].hiddenSubject.id);
      expect(a.map(round => round.hiddenSubject.id)).toEqual(b.map(round => round.hiddenSubject.id));
      expect(a.map(round => round.clues.map(clue => clue.id))).toEqual(b.map(round => round.clues.map(clue => clue.id)));
      expect(a.every(round => round.clues.length === 10)).toBe(true);
    }
    expect(() => nbaWhoAmIDailyPreviewRounds("2026-02-30")).toThrow();
  });

  it("reuses the same four/five-pick Hit the Number board on a given day, without writing local histories", () => {
    const identity = dailyLineupIdentity(NBA_HIT_THE_NUMBER_GAME_ID, "2026-10-30", "owner-preview");
    const a = createNbaHitTheNumberPlan(identity.seed);
    const b = createNbaHitTheNumberPlan(identity.seed);
    expect(a).toEqual(b);
    expect([4, 5]).toContain(a.pickCount);
    expect(nbaHitSource).toContain('params.get("mode")==="daily"');
    expect(nbaHitSource).toContain("setRun(dailyRun??createNbaHitTheNumberRun())");
    expect(nbaHitSource).toContain("if (!daily) recordLineupCompletion");
    expect(nbaHitSource).toContain("NBA DAILY · OWNER PREVIEW · NOT RANKED");
  });

  it("connects all nine preview routes, while preserving Casual and official-release safety", () => {
    expect(nbaHubSource).toContain('NBA_GAME_ROUTES[game] + "?mode=daily"');
    expect(nbaWhoSource).toContain("NEXT GAME →");
    expect(nbaWhoSource).toContain("TWO-GAME PREVIEW AVERAGE");
    expect(nbaWhoSource).toContain("disableReplay={daily}");
    expect(sharedWhoSource).toContain("disableReplay = false");
    expect(NBA_OFFICIAL_GAMES_RELEASE_READY).toBe(false);
    expect(nbaHitSource).not.toContain("submitOfficialDaily");
  });
});
