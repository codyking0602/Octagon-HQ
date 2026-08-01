import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608220001_auction_playable_server_engine.sql",
  "utf8",
);
const databaseTest = readFileSync(
  "supabase/tests/auction_playable_server_engine.sql",
  "utf8",
);
const verificationWorkflow = readFileSync(
  ".github/workflows/verify-supabase-backend.yml",
  "utf8",
);

function projectionSql() {
  const start = sql.indexOf(
    "create function public.get_auction_participant_state",
  );
  const end = sql.indexOf(
    "revoke all on function private.prevent_auction_private_mutation",
    start,
  );
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return sql.slice(start, end);
}

describe("Auction playable server migration", () => {
  it("keeps one authenticated command boundary and private engine owners", () => {
    for (const command of [
      "public.prepare_auction(uuid, text)",
      "public.abandon_prepared_auction(uuid, bigint)",
      "public.send_auction_first_bid(uuid, bigint, numeric, text)",
      "public.submit_auction_bid(uuid, integer, bigint, numeric, text)",
      "public.cancel_auction(uuid, bigint)",
      "public.get_auction_participant_state(uuid)",
    ]) {
      expect(sql).toContain(`revoke all on function ${command}`);
      expect(sql).toContain(`grant execute on function ${command}`);
    }

    expect(sql).toContain("for update");
    expect(sql).toContain("auction_one_award_per_round");
    expect(sql).toContain("auction_pending_bids_immutable");
    expect(sql).toContain("private.publish_notification_to_profile");
    expect(sql).toContain("revoke all on function private.resolve_auction_round");
    expect(sql).not.toMatch(/grant execute on function private\.[^\n]+authenticated/);
  });

  it("keeps generic Challenge Center commands from bypassing Auction ownership", () => {
    expect(sql).toContain(
      "Auction challenges must be sent through the Auction engine",
    );
    expect(sql).toContain(
      "Auction completion is owned by the Auction engine",
    );
    expect(sql).toContain(
      "Use the Auction cancellation command for an active Auction",
    );
    expect(sql).toContain("if v_challenge.game_id = 'auction' then\n    return true;");
    expect(sql).toContain("challenge.setup = '{}'::jsonb");
    expect(sql).not.toContain("jsonb_build_object('auction_id'");
  });

  it("preserves the canonical projection and adds only current and resolved state", () => {
    const projection = projectionSql();
    const returnShape = projection.slice(0, projection.indexOf("language sql"));

    for (const canonicalField of [
      "challenger_display_name text",
      "recipient_display_name text",
      "current_user_submitted_bid boolean",
      "cancelled_by uuid",
      "cancelled_at timestamptz",
      "is_tie boolean",
      "awarded_collections jsonb",
    ]) {
      expect(returnShape).toContain(canonicalField);
    }

    expect(returnShape).toContain("current_item jsonb");
    expect(returnShape).toContain("resolved_rounds jsonb");
    expect(projection).toContain(
      "deck.deck_position = auction.current_round",
    );
    expect(projection).toContain("where award.auction_id = auction.id");
    expect(projection).not.toContain("ultimate_fighter_category");
    expect(projection).not.toContain("rarity_band");
    expect(projection).not.toContain("grading_version");

    for (const privateField of [
      "content_version",
      "rarity_version",
      "grading_version",
      "random_seed",
      "grading_weights",
      "intermediate_score",
    ]) {
      expect(returnShape).not.toContain(privateField);
    }
  });

  it("runs adversarial gameplay coverage against a fresh Supabase database", () => {
    for (const requiredProof of [
      "prepared Auction rerolled",
      "anonymous role inherited an Auction command",
      "generic challenge creation bypassed the Auction engine",
      "opening the route was treated as Auction acceptance",
      "recipient projection leaked the challenger sealed bid",
      "late-game reserve maximum was not enforced",
      "tied bid did not use and flip visible tie priority",
      "forced assignment or completion arithmetic was incorrect",
      "cancel retry was not idempotent",
      "pre-acceptance decline did not use canonical lifecycle",
      "pending Ultimate Fighter intent leaked",
      "filled Ultimate Fighter category was accepted again",
    ]) {
      expect(databaseTest).toContain(requiredProof);
    }

    expect(verificationWorkflow).toContain(
      "supabase/tests/auction_playable_server_engine.sql",
    );
  });
});
