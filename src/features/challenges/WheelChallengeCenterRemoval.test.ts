import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const center = readFileSync("src/features/challenges/ChallengeCenter.tsx", "utf8");
const challengeMigration = readFileSync(
  "supabase/migrations/202607250001_real_profile_challenges.sql",
  "utf8",
);

describe("Wheel Challenge Center pending removal", () => {
  it("lets the sender remove an unopened Wheel challenge from their own center", () => {
    expect(center).toContain('(direction === "sent" && status === "waiting")');
    expect(center).toContain("canRemoveTurnBased");
    expect(center).toContain("void dismissChallenge(challenge.code)");
  });

  it("uses the existing creator-hidden persistence instead of cancelling the recipient copy", () => {
    expect(challengeMigration).toContain("creator_hidden_at = case");
    expect(challengeMigration).toContain("when creator_id = auth.uid() then coalesce(creator_hidden_at, now())");
    expect(challengeMigration).toContain("and c.creator_hidden_at is null");
  });
});
