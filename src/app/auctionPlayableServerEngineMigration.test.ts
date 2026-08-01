import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608210004_auction_playable_server_engine.sql",
  "utf8",
);
const databaseTest = readFileSync(
  "supabase/tests/auction_playable_server_engine.sql",
  "utf8",
);
const lifecycleRunner = readFileSync(
  "supabase/tests/auction_private_lifecycle_hardening.sql",
  "utf8",
);
const backendWorkflow = readFileSync(
  ".github/workflows/verify-supabase-backend.yml",
  "utf8",
);
const deploymentWorkflow = readFileSync(
  ".github/workflows/deploy-supabase.yml",
  "utf8",
);

describe("playable Auction server engine", () => {
  it("keeps catalog, deck, bids, awards, and grading inputs server-private", () => {
    expect(migration).toContain("create table private.auction_catalog_versions");
    expect(migration).toContain("create table private.auction_catalog_items");
    expect(migration).toContain("alter table private.auction_catalog_versions enable row level security");
    expect(migration).toContain("revoke all on private.auction_catalog_items from public, anon, authenticated");
    expect(migration).toContain("create trigger auction_deck_entries_immutable");
    expect(migration).toContain("create trigger auction_pending_bids_locked");
    expect(migration).toContain("create trigger auction_awards_immutable");
    expect(migration).not.toContain("createClient(");
    expect(migration).not.toContain("localStorage");
  });

  it("exposes only authenticated server commands and a safe projection", () => {
    expect(migration).toContain("create or replace function public.create_or_resume_auction");
    expect(migration).toContain("create or replace function public.abandon_auction");
    expect(migration).toContain("create or replace function public.submit_auction_challenger_bid_and_send");
    expect(migration).toContain("create or replace function public.submit_auction_bid");
    expect(migration).toContain("create or replace function public.cancel_auction");
    expect(migration).toContain("grant execute on function public.create_or_resume_auction(uuid, text) to authenticated");
    expect(migration).toContain("grant execute on function public.get_auction_participant_state(uuid) to authenticated");
    expect(migration).toContain("current_item jsonb");
    expect(migration).toContain("select deck.public_item");
    expect(migration).not.toContain("random_seed");
  });

  it("keeps deterministic test randomness private and production randomness non-reconstructable", () => {
    expect(migration).toContain("private.create_or_resume_auction_internal(");
    expect(migration).toContain("p_test_random_material text default null");
    expect(migration).toContain("encode(extensions.gen_random_bytes(32), 'hex')");
    expect(migration).toContain("revoke all on function private.create_or_resume_auction_internal");
    expect(migration).not.toContain("public.create_or_resume_auction(\n  p_recipient_id uuid,\n  p_mode_id text,\n  p_test_random_material");
    expect(databaseTest).toContain("deterministic-standard-deck");
    expect(databaseTest).toContain("Deterministic Auction deck generation diverged");
  });

  it("preserves the canonical challenge and notification owners", () => {
    expect(migration).toContain("insert into public.play_challenges");
    expect(migration).toContain("private.publish_notification_to_profile");
    expect(migration).toContain("Auction challenges must be created by the Auction server engine");
    expect(migration).toContain("and challenge.game_id <> 'auction'");
    expect(migration).toContain("create trigger play_challenges_sync_auction_decline");
    expect(migration).not.toContain("create table public.play_challenges");
    expect(migration).not.toContain("create table private.notification_groups");
  });

  it("owns bidding, resolution, reserve protection, ties, and forced assignment transactionally", () => {
    expect(migration).toContain("Auction bids must be whole dollars");
    expect(migration).toContain("Auction minimum bid is $1");
    expect(migration).toContain("Auction bid exceeds reserve maximum");
    expect(migration).toContain("for update;");
    expect(migration).toContain("private.resolve_auction_round");
    expect(migration).toContain("tie_priority_profile_id = v_next_tie_priority");
    expect(migration).toContain("forced_assignment");
    expect(migration).toContain("winning_bid");
    expect(migration).toContain("Private grading remains pending");
    expect(migration).not.toContain("grading_weights");
    expect(migration).not.toContain("intermediate_score");
  });

  it("executes the playable database proof through the existing backend owner", () => {
    expect(backendWorkflow).toContain("supabase/tests/auction_private_lifecycle_hardening.sql");
    expect(lifecycleRunner).toContain("\\ir auction_playable_server_engine.sql");
    expect(deploymentWorkflow).toContain("supabase db push --linked");
    expect(deploymentWorkflow).toContain("migration_list=$(supabase migration list --linked)");
    expect(databaseTest.trimEnd()).toMatch(/rollback;$/);
  });
});
