import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200015_notification_game_challenge_delivery.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/notification_game_challenge_delivery.sql",
  "utf8",
);
const foundation = readFileSync(
  "supabase/migrations/202608200013_notification_foundation.sql",
  "utf8",
);
const contract = readFileSync(
  "docs/notification-game-challenge-delivery.md",
  "utf8",
);

describe("game challenge delivery notifications", () => {
  it("keeps the existing challenge transitions as the only producers", () => {
    expect(migration).toContain(
      "create or replace function public.create_play_challenge",
    );
    expect(migration).toContain(
      "create or replace function public.open_play_challenge",
    );
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("public.publish_notification(");
    expect(contract).toContain(
      "`public.create_play_challenge(...)` remains the only canonical profile-challenge creation transition",
    );
    expect(contract).toContain(
      "The existing `open_play_challenge(...)` transition is the app's acceptance moment",
    );
  });

  it("publishes received and accepted challenge notifications", () => {
    expect(migration).toContain("private.publish_notification_to_profile");
    expect(migration).toContain("'game_challenge_received'");
    expect(migration).toContain("'You were challenged'");
    expect(migration).toContain("'game_challenge_accepted'");
    expect(migration).toContain("'Your challenge was accepted'");
    expect(migration).toContain("'VIEW CHALLENGE'");
    expect(migration).toContain("'VIEW MATCHUP'");
    expect(foundation).toContain("'game_challenge_received'");
    expect(foundation).toContain("'game_challenge_accepted'");
  });

  it("uses exact game routes and safe fallback navigation", () => {
    expect(migration).toContain(
      "'/play/find-leader?challenge=' || v_code",
    );
    expect(migration).toContain("'/play/wavelength?match=' || v_code");
    expect(migration).toContain("'/play/blind-resume?match=' || v_code");
    expect(migration).toContain("'/play/blind-rank?match=' || v_code");
    expect(migration).toContain("'/play/keep-cut?match=' || v_code");
    expect(migration).toContain("'/play/better-than?match=' || v_code");
    expect(migration).toContain("else '/play'");
    expect(contract).toContain("Unknown future game IDs safely fall back to `/play`");
  });

  it("aggregates unread challenge activity without replay noise", () => {
    expect(migration).toContain("'play-challenges:received'");
    expect(migration).toContain("'play-challenges:accepted'");
    expect(migration).toContain("'play-challenge:received:' || v_code");
    expect(migration).toContain("'play-challenge:accepted:' || v_challenge.code");
    expect(foundation).toContain("constraint notification_events_recipient_source_unique unique");
    expect(foundation).toContain("aggregate_count = case");
    expect(integrationSql).toContain(
      "Challenge deliveries created more than one unread notification group",
    );
    expect(integrationSql).toContain(
      "Challenge acceptance notification was missing or duplicated on reopen",
    );
    expect(contract).toContain("You were challenged ×2");
  });

  it("keeps profile isolation and the private notification boundary", () => {
    expect(integrationSql).toContain(
      "Challenge acceptance notification leaked to the recipient profile",
    );
    expect(integrationSql).toContain(
      "Authenticated challenge clients can bypass the canonical notification producer",
    );
    expect(foundation).toContain(
      "revoke all on function private.publish_notification_to_profile",
    );
    expect(contract).toContain("Browser roles cannot call the private publisher");
    expect(contract).toContain(
      "No second notification center, unread store, browser subscription, polling loop, or local-storage fallback is added",
    );
  });

  it("keeps rollback proof for delivery, acceptance, aggregation, and privacy", () => {
    expect(integrationSql).toContain(
      "Received challenges did not aggregate with the latest exact deep link",
    );
    expect(integrationSql).toContain(
      "Multiple accepted challenges did not aggregate to the latest matchup",
    );
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
