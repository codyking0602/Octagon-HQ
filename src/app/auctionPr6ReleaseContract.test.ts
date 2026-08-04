import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202609030001_auction_notifications_share_release.sql",
  "utf8",
);
const auctionPage = readFileSync("src/features/play/AuctionPage.tsx", "utf8");
const notificationModel = readFileSync(
  "src/features/notifications/notificationModel.ts",
  "utf8",
);
const canonicalDestinations = readFileSync("src/app/canonicalDestinations.ts", "utf8");
const nativeShare = readFileSync("src/app/nativeShare.ts", "utf8");
const worker = readFileSync("worker/index.ts", "utf8");
const previewModel = readFileSync("worker/previewModel.ts", "utf8");
const previewCard = readFileSync("worker/previewCard.ts", "utf8");
const backendDeployment = readFileSync(
  ".github/workflows/deploy-supabase.yml",
  "utf8",
);
const backendVerification = readFileSync(
  ".github/workflows/verify-supabase-backend.yml",
  "utf8",
);
const frontendDeployment = readFileSync(
  ".github/workflows/deploy-cloudflare.yml",
  "utf8",
);
const auctionContract = readFileSync("docs/auction-game.md", "utf8");

const forbiddenPublicFields = [
  "pending_bids",
  "future_deck",
  "rarity_weight",
  "rarity_class",
  "grading_formula",
  "grading_weights",
  "intermediate_grade",
  "category_grade",
  "item_grade",
  "winner_explanation",
  "best_purchase",
  "overpay",
  "missed_opportunity",
  "random_seed",
] as const;

describe("Auction PR 6 release contract", () => {
  it("keeps every lifecycle notification inside the canonical database owner", () => {
    expect(migration).toContain("create or replace function public.submit_auction_bid");
    expect(migration).toContain("create or replace function public.cancel_auction");
    expect(migration).toContain("create or replace function private.sync_auction_challenge_decline");
    expect(migration).toContain("private.publish_notification_to_profile");
    expect(migration).toContain("'auction_action_required'");
    expect(migration).toContain("'auction_result_ready'");
    expect(migration).toContain("'push_candidate'");
    expect(migration).toContain("'game_challenge_activity'");
    expect(migration).toContain("award.resolved_round = v_resolved_round");
    expect(migration).toContain("auction_games_challenger_id_fkey");
    expect(migration).toContain("auction_games_challenge_id_fkey");
    expect(migration).toContain("auction_pending_bids_bidder_id_fkey");
    expect(migration).toContain("auction_awards_awarded_to_fkey");
    expect(migration.match(/on delete cascade/g)?.length).toBeGreaterThanOrEqual(8);
    expect(auctionPage).not.toContain("publish_notification_to_profile");
    expect(auctionPage).not.toContain("deliver-notification-push");
    expect(notificationModel).toContain('"auction_action_required"');
    expect(notificationModel).toContain('"auction_result_ready"');
  });

  it("uses the existing destination, native-share, Worker, and public RPC owners", () => {
    expect(canonicalDestinations).toContain('| { kind: "auction"; auctionId: string }');
    expect(canonicalDestinations).toContain('withSearch("/play/auction"');
    expect(auctionPage).toContain("shareCanonicalDestination");
    expect(nativeShare).toContain("canonicalDestinationUrl");
    expect(previewModel).toContain('kind: "challenge" | "auction" | "picks-recap"');
    expect(previewModel).toContain('kind: "auction-result"');
    expect(previewCard).toContain('auction: "PRIVATE AUCTION"');
    expect(previewCard).toContain('"auction-result": "AUCTION RESULT"');
    expect(worker).toContain("get_rich_preview_data");
    expect(migration).toContain("create or replace function public.get_rich_preview_data");
    expect(migration).toContain("private.get_rich_preview_data_pr6_core");
    expect(migration).toContain("pg_catalog.btrim(p_kind)");
    expect(migration).toContain("pg_catalog.btrim(p_key)");
    expect(migration).not.toContain("pg_catalog.trim(");
    expect(migration).toContain("auction.lifecycle_state = 'completed'");
  });

  it("limits completed public Auction output to names, final scores, mode, and verdict", () => {
    for (const key of [
      "kind",
      "auction_id",
      "mode_id",
      "challenger_name",
      "recipient_name",
      "challenger_score",
      "recipient_score",
      "verdict",
    ]) {
      expect(migration).toContain(`'${key}'`);
    }
    for (const forbidden of forbiddenPublicFields) {
      expect(migration).not.toContain(`'${forbidden}'`);
      expect(previewModel).not.toContain(`${forbidden}:`);
    }
    expect(migration).toContain("auction.challenger_final_score between 0 and 100");
    expect(migration).toContain("auction.recipient_final_score between 0 and 100");
    expect(migration).toContain("when auction.winner_profile_id is null then 'True tie'");
  });

  it("hard-requires the final migration through existing backend release owners", () => {
    expect(backendDeployment).toContain('require_remote_migration "202609030001"');
    expect(backendVerification).toContain('require_remote_migration "202609030001"');
    expect(backendVerification).toContain("auction_notifications_share_release.sql");
    expect(migration).toContain("Auction result · True tie");
    expect(migration).toContain("winner_profile_id is null");
    expect(frontendDeployment).toContain("Deploy Cloudflare Frontend");
    expect(backendDeployment).toContain("Deploy Supabase Backend");
  });

  it("documents PR 6 as the final notification, sharing, proof, and certification stage", () => {
    expect(auctionContract).toContain("Auction PR 6: notifications and final release proof");
    expect(auctionContract).toContain("completed-only Auction share previews");
    expect(auctionContract).toContain("two participants and one unrelated signed-in profile");
    expect(auctionContract).toContain("GitHub Actions remains the only deployment owner");
  });
});
