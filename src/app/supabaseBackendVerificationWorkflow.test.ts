import workflow from "../../.github/workflows/verify-supabase-backend.yml?raw";
import deployWorkflow from "../../.github/workflows/deploy-supabase.yml?raw";
import eventSetupPreviewVerification from "../../scripts/verify-event-setup-preview-live.mjs?raw";
import pinAuthVerification from "../../scripts/verify-pin-auth-live.mjs?raw";
import { describe, expect, it } from "vitest";

const auctionSqlProofs = [
  "supabase/tests/auction_private_lifecycle.sql",
  "supabase/tests/auction_private_lifecycle_hardening.sql",
  "supabase/tests/auction_playable_server_engine.sql",
  "supabase/tests/auction_notifications_share_release.sql",
  "supabase/tests/auction_launch_notification.sql",
  "supabase/tests/auction_catalog_expansion.sql",
  "supabase/tests/pick_monitoring_truthful_decisions.sql",
];

const requiredAuctionMigrations = [
  "202608220001",
  "202608220002",
  "202608220003",
  "202608220004",
];

describe("Supabase backend verification release boundary", () => {
  it("resolves the last genuinely deployed frontend ancestor for non-runtime main commits", () => {
    expect(workflow).toContain("findSuccessfulRuns");
    expect(workflow).toContain("let candidateSha = expectedSha;");
    expect(workflow).toContain("for (let depth = 0; depth < 20; depth += 1)");
    expect(workflow).toContain("No runtime-owned paths changed");
    expect(workflow).toContain("checking parent ${parentSha} for the live frontend proof");
  });

  it("fails closed when a runtime owner changed without exact deployment proof", () => {
    expect(workflow).toContain("const runtimePathPatterns = [");
    expect(workflow).toContain("/^src\\//");
    expect(workflow).toContain("/^public\\//");
    expect(workflow).toContain("/^package\\.json$/");
    expect(workflow).toContain("/^package-lock\\.json$/");
    expect(workflow).toContain("has no successful exact-SHA run for runtime-changing commit");
  });

  it("executes every Auction SQL suite against a fresh local database", () => {
    expect(workflow).toContain("supabase db start");
    for (const proof of auctionSqlProofs) {
      expect(workflow).toContain(proof);
    }
  });

  it("requires the Auction lifecycle foundation in linked production history", () => {
    expect(workflow).toContain(
      'require_remote_migration "202609030001" "Auction PR 6 notifications and share release migration not deployed"',
    );
    expect(workflow).toContain(
      'require_remote_migration "202609030003" "Auction launch notification migration not deployed"',
    );
    expect(workflow).toContain(
      'require_remote_migration "202609040001" "Auction catalog expansion migration not deployed"',
    );
    expect(workflow).toContain(
      'require_remote_migration "202609040002" "Auction v2 grader migration not deployed"',
    );
  });

  it("keeps playable Auction migration proof in both release owners", () => {
    for (const migration of requiredAuctionMigrations) {
      expect(deployWorkflow).toContain(migration);
    }
  });

  it("retries only transient Event Setup compute failures and still fails closed", () => {
    expect(eventSetupPreviewVerification).toContain("[200, 502],");
    expect(eventSetupPreviewVerification).not.toContain("[200, 502, 546]");
    expect(eventSetupPreviewVerification).toContain(
      "retrying the same canonical request",
    );
  });

  it("waits for WebKit to settle on the canonical single detail panel", () => {
    expect(pinAuthVerification).toContain("async function waitForSingleExpandedFight");
    expect(pinAuthVerification).toContain(
      'fightRegion.locator(".open-pick-row__details")',
    );
    expect(pinAuthVerification).toContain(
      'fightRegion.locator(\'.open-pick-row__summary[aria-expanded="true"]\')',
    );
    expect(pinAuthVerification).toContain(
      "await waitForSingleExpandedFight(fightRegion, fightRows, 0);",
    );
    expect(pinAuthVerification).toContain(
      "await waitForSingleExpandedFight(fightRegion, fightRows, 1);",
    );
    expect(pinAuthVerification).not.toContain(
      "The compact card allowed more than one detailed fight panel at a time.",
    );
  });

  it("verifies the live shell and records the resolved SHA explicitly", () => {
    expect(workflow).toContain(
      "EXPECTED_SOURCE_SHA: ${{ steps.live_frontend.outputs.sha }}",
    );
    expect(workflow).toContain(
      "verified_live_frontend_sha: ${{ steps.live_frontend.outputs.sha }}",
    );
    expect(workflow).toContain(
      "VERIFIED_LIVE_FRONTEND_SHA: ${{ needs.live_webkit.outputs.verified_live_frontend_sha }}",
    );
    expect(workflow).toContain(
      "Verified live frontend SHA: $VERIFIED_LIVE_FRONTEND_SHA",
    );
    expect(workflow).toContain(
      "Any commits between those SHAs changed no frontend runtime-owned paths",
    );
  });
});
