import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationPath = "supabase/migrations/202609030003_auction_launch_notification.sql";
const sqlTestPath = "supabase/tests/auction_launch_notification.sql";
const migration = readFileSync(migrationPath, "utf8");
const sqlTest = readFileSync(sqlTestPath, "utf8");
const deployWorkflow = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");
const verifyWorkflow = readFileSync(".github/workflows/verify-supabase-backend.yml", "utf8");

describe("Auction launch notification migration", () => {
  it("delegates every member notification to the canonical publisher", () => {
    expect(migration).toContain("perform private.publish_notification_to_profile(");
    expect(migration).toContain("from public.profiles profile");
    expect(migration).not.toMatch(/insert\s+into\s+private\.notification_(?:groups|events|push_)/i);
    expect(migration).not.toContain("net.http_post");
    expect(migration).not.toContain("deliver-notification-push");
  });

  it("uses the stable one-time Auction campaign contract", () => {
    expect(migration).toContain("'new-game:auction'");
    expect(migration).toContain("'new_game_available'");
    expect(migration).toContain("'Auction is live'");
    expect(migration).toContain("'Build your collection through sealed bids and challenge another Octagon HQ member.'");
    expect(migration).toContain("'/play/auction'");
    expect(migration).toContain("'PLAY NOW'");
    expect(migration).toContain("where event.source_key = 'new-game:auction'");
    expect(migration).toContain("'new_game_available'\n    )");
    expect(migration).toContain("return 'push_candidate'");
  });

  it("proves exact recipients, rerun safety, future-profile exclusion, and the existing push owner", () => {
    expect(sqlTest).toContain("exactly one source event per existing profile");
    expect(sqlTest).toContain("Auction launch rerun was not globally idempotent");
    expect(sqlTest).toContain("profile created after the one-time campaign incorrectly received the launch");
    expect(sqlTest).toContain("notification_groups_push_delivery");
    expect(sqlTest).toContain("enqueue_notification_push_delivery");
    expect(sqlTest).toContain("deliver-notification-push");
    expect(sqlTest).toContain("jsonb_array_length(v_claim->'deliveries') <> 1");
    expect(sqlTest).toContain("jsonb_array_length(v_claim->'deliveries') <> 0");
  });

  it("requires the exact migration and fresh-database proof in canonical backend workflows", () => {
    expect(deployWorkflow).toContain(migrationPath);
    expect(deployWorkflow).toContain('require_remote_migration "202609030003"');
    expect(verifyWorkflow).toContain(sqlTestPath);
    expect(verifyWorkflow).toContain('require_remote_migration "202609030003"');
  });
});
