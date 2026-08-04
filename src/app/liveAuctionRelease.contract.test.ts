import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const proof = readFileSync("scripts/verify-live-auction-release.mjs", "utf8");
const workflow = readFileSync(".github/workflows/verify-live-notification-flow.yml", "utf8");

describe("live Auction final-release proof", () => {
  it("requires exact canonical frontend and backend deployments", () => {
    expect(proof).toContain('waitForSuccessfulRun("Deploy Cloudflare Frontend", "push")');
    expect(proof).toContain('waitForSuccessfulRun("Verify Live Frontend Delivery", "workflow_run")');
    expect(proof).toContain('waitForSuccessfulRun("Deploy Supabase Backend", "push")');
    expect(proof).toContain("verifyLiveFrontendDelivery");
    expect(proof).toContain("currentMainSha !== expectedMainSha");
  });

  it("uses three disposable supported-auth profiles and the canonical Auction RPCs", () => {
    expect(proof).toContain('role: "A"');
    expect(proof).toContain('role: "B"');
    expect(proof).toContain('role: "OUTSIDER"');
    for (const rpc of [
      "prepare_auction",
      "send_auction_first_bid",
      "submit_auction_bid",
      "get_auction_participant_state",
      "get_notification_snapshot",
      "claim_notification_push_delivery",
      "get_rich_preview_data",
    ]) {
      expect(proof).toContain(`"${rpc}"`);
    }
    expect(proof).not.toContain("publish_notification_to_profile");
    expect(proof).not.toContain("private.auction");
  });

  it("proves safe lifecycle deep links, completed preview, push, outsider privacy, and cleanup", () => {
    expect(proof).toContain('stateA.lifecycle_state !== "prepared"');
    expect(proof).toContain('stateA.lifecycle_state !== "completed"');
    expect(proof).toContain('item?.kind === "auction_action_required"');
    expect(proof).toContain('item?.kind === "auction_result_ready"');
    expect(proof).toContain('completedCrawler.kind !== "auction-result"');
    expect(proof).toContain('name: "Sign in to open this Auction"');
    expect(proof).toContain('name: "Auction unavailable"');
    expect(proof).toContain('/auth/v1/admin/users/${profile.id}');
    expect(proof).toContain("previewAfterCleanup !== null");
    expect(proof).toContain("play_challenges");
    expect(proof).toContain("forbiddenPattern");
    expect(proof).toContain("winner_profile_id !== null");
  });

  it("extends the existing live notification verification owner instead of adding another", () => {
    expect(workflow).toContain("Prove the complete Auction release in production");
    expect(workflow).toContain("node scripts/verify-live-auction-release.mjs");
    expect(workflow).toContain("github.event_name != 'pull_request'");
    expect(workflow).toContain("live-auction-release-proof-");
  });
});
