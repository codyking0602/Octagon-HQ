import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const center = readFileSync("src/features/challenges/ChallengeCenter.tsx", "utf8");
const challengeMigration = readFileSync(
  "supabase/migrations/202607250001_real_profile_challenges.sql",
  "utf8",
);

describe("Wheel Challenge Center pending removal", () => {
  it("lets the sender cancel a waiting multiplayer Wheel lobby for everyone", () => {
    expect(center).toContain('canCancelTurnBased = turnBased && direction === "sent" && status === "waiting"');
    expect(center).toContain("endWaitingTurnBasedChallenge");
    expect(center).toContain("wheelRepository.decline(challenge.code)");
  });


  it("lets a sent unopened GM challenge be removed from Challenge Center without treating it as a forfeit", () => {
    expect(center).toContain('challenge.gameId === "gm-football" ? "REMOVE" : "CANCEL"');
    expect(center).toContain("gmRepository.cancel(challenge.code)");
  });

  it("uses the existing creator-hidden persistence instead of cancelling the recipient copy", () => {
    expect(challengeMigration).toContain("creator_hidden_at = case");
    expect(challengeMigration).toContain("when creator_id = auth.uid() then coalesce(creator_hidden_at, now())");
    expect(challengeMigration).toContain("and c.creator_hidden_at is null");
  });
});
