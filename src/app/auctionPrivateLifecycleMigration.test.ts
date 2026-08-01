import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608210002_auction_private_lifecycle.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/auction_private_lifecycle.sql",
  "utf8",
);
const challengeRepository = readFileSync(
  "src/features/challenges/challengeRepository.ts",
  "utf8",
);
const supabaseClient = readFileSync("src/lib/supabase.ts", "utf8");

describe("Auction private lifecycle foundation", () => {
  it("owns normalized hidden state in the existing private Supabase schema", () => {
    expect(migration).toContain("create table private.auction_games");
    expect(migration).toContain("create table private.auction_deck_entries");
    expect(migration).toContain("create table private.auction_pending_bids");
    expect(migration).toContain("create table private.auction_awards");
    expect(migration).toContain("challenge_id uuid unique references public.play_challenges(id)");
    expect(migration).toContain("challenge.game_id = 'auction'");
    expect(migration).toContain("challenge.creator_id = new.challenger_id");
    expect(migration).toContain("challenge.recipient_id = new.recipient_id");
  });

  it("denies direct browser access and exposes one narrow participant RPC", () => {
    for (const table of [
      "auction_games",
      "auction_deck_entries",
      "auction_pending_bids",
      "auction_awards",
    ]) {
      expect(migration).toContain(
        `revoke all on private.${table} from public, anon, authenticated`,
      );
      expect(migration).not.toContain(`grant select on private.${table}`);
    }
    expect(migration).toContain("create or replace function public.get_auction_participant_state");
    expect(migration).toContain("security definer\nset search_path = ''\nstable");
    expect(migration).toContain("auth.uid() in (auction.challenger_id, auction.recipient_id)");
    expect(migration).toContain(
      "grant execute on function public.get_auction_participant_state(uuid) to authenticated",
    );
    expect(integrationSql).toContain("unrelated authenticated profile read an Auction projection");
    expect(integrationSql).toContain("browser roles have direct Auction-private table access");
  });

  it("makes the raw safe result structurally incapable of exposing private columns", () => {
    const returnShape = migration.slice(
      migration.indexOf("returns table ("),
      migration.indexOf(")\nlanguage sql", migration.indexOf("returns table (")),
    );
    expect(returnShape).toContain("current_user_submitted_bid boolean");
    expect(returnShape).toContain("awarded_collections jsonb");
    expect(returnShape).not.toMatch(/amount|category_intent|private_item_reference|deck_position|version|weight|seed/i);
    expect(integrationSql).toContain("select to_jsonb(state) into v_payload");
    expect(integrationSql).toContain("jsonb_typeof(v_payload->'current_user_submitted_bid') <> 'boolean'");
    expect(integrationSql).toContain("safe projection leaked sealed or future private state");
    expect(integrationSql).toContain("private-future-item");
    expect(integrationSql).toContain("grading_weights");
  });

  it("locks ownership, lifecycle, money, progress, and numeric result invariants", () => {
    expect(migration).toContain("constraint auction_games_different_profiles");
    expect(migration).toContain("constraint auction_games_bankrolls_nonnegative");
    expect(migration).toContain("constraint auction_games_selection_counts_valid");
    expect(migration).toContain("constraint auction_games_round_valid");
    expect(migration).toContain("constraint auction_games_revision_valid");
    expect(migration).toContain("constraint auction_games_cancellation_audit");
    expect(migration).toContain("constraint auction_games_completed_result");
    expect(migration).toContain("Auction terminal state cannot change");
    expect(migration).toContain(
      "if v_round > (case when v_auction.mode_id = 'ultimate-fighter' then 10 else 8 end) then",
    );
    expect(migration).not.toContain(
      "if v_round > case when v_auction.mode_id = 'ultimate-fighter' then 10 else 8 end then",
    );
    expect(integrationSql).toContain("self-challenge was accepted");
    expect(integrationSql).toContain("negative bankroll was accepted");
    expect(integrationSql).toContain("excess selection count was accepted");
    expect(integrationSql).toContain("out-of-range final score was accepted");
    expect(integrationSql).toContain("numeric tie result invariant is missing");
  });

  it("introduces no gameplay expiry, forfeiture, command, UI, provider, or alternate client", () => {
    expect(migration).not.toMatch(/expires_at|deadline|timer|forfeit|automatic.loss/i);
    expect(migration).not.toMatch(/create_auction|prepare_auction|submit_auction_bid|resolve_auction/i);
    expect(challengeRepository).not.toContain("get_auction_participant_state");
    expect(supabaseClient.match(/\? createClient/g)).toHaveLength(1);
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
