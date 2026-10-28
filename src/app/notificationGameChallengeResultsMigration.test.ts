import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200016_notification_game_challenge_results.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/notification_game_challenge_results.sql",
  "utf8",
);
const foundation = readFileSync(
  "supabase/migrations/202608200013_notification_foundation.sql",
  "utf8",
);
const contract = readFileSync(
  "docs/notification-game-challenge-results.md",
  "utf8",
);

describe("game challenge result notifications", () => {
  it("keeps the existing completion transition as the only producer", () => {
    expect(migration).toContain(
      "create or replace function public.complete_play_challenge",
    );
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("public.publish_notification(");
    expect(contract).toContain(
      "`public.complete_play_challenge(...)` remains the only canonical completion transition",
    );
  });

  it("publishes one result-ready notification instead of overlapping messages", () => {
    expect(migration).toContain("private.publish_notification_to_profile");
    expect(migration).toContain("'game_challenge_result_ready'");
    expect(migration).toContain("'Challenge result is ready'");
    expect(migration).toContain("'VIEW RESULT'");
    expect(migration).not.toContain("'game_opponent_finished'");
    expect(foundation).toContain("'game_challenge_result_ready'");
    expect(foundation).toContain("'game_opponent_finished'");
    expect(contract).toContain(
      "It does not also publish **Your opponent finished** for the same event",
    );
  });

  it("uses exact completed-matchup routes and a safe fallback", () => {
    expect(migration).toContain(
      "'/play/find-leader?challenge=' || v_challenge.code",
    );
    expect(migration).toContain(
      "'/play/wavelength?match=' || v_challenge.code",
    );
    expect(migration).toContain(
      "'/play/blind-resume?match=' || v_challenge.code",
    );
    expect(migration).toContain(
      "'/play/blind-rank?match=' || v_challenge.code",
    );
    expect(migration).toContain(
      "'/play/keep-cut?match=' || v_challenge.code",
    );
    expect(migration).toContain(
      "'/play/better-than?match=' || v_challenge.code",
    );
    expect(migration).toContain("else '/play'");
  });

  it("aggregates unread results without replay noise", () => {
    expect(migration).toContain("'play-challenges:results-ready'");
    expect(migration).toContain(
      "'play-challenge:result-ready:' || v_challenge.code",
    );
    expect(migration).toContain("and challenge.completed_at is null");
    expect(migration).toContain("if not found then");
    expect(integrationSql).toContain(
      "Challenge result-ready notification was missing or duplicated on replay",
    );
    expect(integrationSql).toContain(
      "Multiple completed challenges did not aggregate to the latest exact result",
    );
    expect(contract).toContain("Challenge result is ready ×2");
  });

  it("notifies only the waiting creator and preserves the unlocked result", () => {
    expect(migration).toContain("v_challenge.creator_id");
    expect(integrationSql).toContain(
      "Result-ready notification leaked to the player already completing the challenge",
    );
    expect(integrationSql).toContain(
      "Completing the challenge did not preserve the canonical unlocked result",
    );
    expect(contract).toContain(
      "The app does not create a redundant result-ready notification for that same player",
    );
  });

  it("keeps the private notification boundary and rollback proof", () => {
    expect(foundation).toContain(
      "revoke all on function private.publish_notification_to_profile",
    );
    expect(integrationSql).toContain(
      "Authenticated challenge clients can bypass the canonical result notification producer",
    );
    expect(contract).toContain("Browser roles cannot call the private publisher");
    expect(contract).toContain(
      "No second notification center, provider, repository, subscription, polling loop, or local-storage fallback is added",
    );
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
