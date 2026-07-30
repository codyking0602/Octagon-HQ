import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const proof = readFileSync("scripts/verify-live-notification-flow.mjs", "utf8");
const workflow = readFileSync(".github/workflows/verify-live-notification-flow.yml", "utf8");

describe("live notification flow proof", () => {
  it("requires exact frontend deployment evidence before testing notifications", () => {
    expect(proof).toContain('requireSuccessfulRun(runs, "Deploy Cloudflare Frontend", "push")');
    expect(proof).toContain('requireSuccessfulRun(runs, "Verify Live Frontend Delivery", "workflow_run")');
    expect(proof).toContain("verifyLiveFrontendDelivery");
    expect(proof).toContain("currentMainSha !== expectedMainSha");
    expect(workflow).toContain("actions: read");
  });

  it("creates the event only through the canonical challenge transition", () => {
    expect(proof).toContain('/rest/v1/rpc/create_play_challenge');
    expect(proof).toContain('p_game_id: "find-leader"');
    expect(proof).not.toContain("publish_notification_to_profile");
    expect(proof).not.toContain("notification_groups");
    expect(proof).not.toContain("localStorage");
  });

  it("proves persistence eligibility unread retrieval and the exact deep link", () => {
    expect(proof).toContain('item?.kind === "game_challenge_received"');
    expect(proof).toContain('item?.title === "You were challenged"');
    expect(proof).toContain("item?.is_read === false");
    expect(proof).toContain('Number(recipientSnapshot.unread_count) !== 1');
    expect(proof).toContain('page.locator("article.notification-item")');
    expect(proof).toContain('url.pathname === "/play/find-leader"');
    expect(proof).toContain('url.searchParams.get("challenge") === code');
  });

  it("proves the open action marks read and uses the existing acceptance producer", () => {
    expect(proof).toContain('item?.kind === "game_challenge_received" && item?.is_read === true');
    expect(proof).toContain('item?.kind === "game_challenge_accepted"');
    expect(proof).toContain('item?.title === "Your challenge was accepted"');
    expect(proof).not.toContain("setInterval");
  });

  it("runs after exact live delivery and cleans disposable profiles", () => {
    expect(workflow).toContain("Verify Live Frontend Delivery");
    expect(workflow).toContain("Prove one real notification end to end");
    expect(workflow).toContain("live-notification-proof");
    expect(proof).toContain('/auth/v1/admin/users/${userId}');
  });
});
