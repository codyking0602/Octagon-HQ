import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310246_hq_impostor_v1.sql",
  "utf8",
);
const page = readFileSync("src/features/impostor/HqImpostorPage.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");
const home = readFileSync("src/features/home/HomePage.tsx", "utf8");

describe("HQ Impostor v1 contract", () => {
  it("locks four one-day rounds and private three/five-minute action clocks", () => {
    expect(migration).toContain("round_count integer not null default 4 check (round_count = 4)");
    expect(migration).toContain("p_at+interval '3 minutes'");
    expect(migration).toContain("p_at+interval '5 minutes'");
    expect(migration).toContain("interval '18 hours'");
    expect(migration).toContain("p_at + (v_round * interval '1 day')");
  });

  it("keeps secrets server-owned until assignment/reveal entitlement", () => {
    expect(migration).toContain("private.hq_impostor_topics");
    expect(migration).toContain("revoke all on private.hq_impostor_topics from public, anon, authenticated");
    expect(migration).toContain("assignment_opened_at is not null and not v_is_impostor");
    expect(migration).toContain("v_show_board := v_is_terminal or (v_round.status='vote' and v_action.board_opened_at is not null)");
    expect(migration).toContain("result_seen_at timestamptz");
    expect(migration).toContain("create or replace function public.acknowledge_hq_impostor_result");
    expect(migration).toContain("and action.result_seen_at is null");
  });

  it("locks the approved scoring and tie-survival rules", () => {
    expect(migration).toContain("when v_guess_submitted and not v_caught then 80");
    expect(migration).toContain("when v_guess_submitted and v_caught and v_guess_correct then 50");
    expect(migration).toContain("case when action.vote_profile_id=v_round.impostor_profile_id then 50 else 0 end");
    expect(migration).toContain("case when v_caught and not v_guess_correct then 30 else 0 end");
    expect(migration).toContain("v_caught := v_max_votes > 0 and v_imp_votes=v_max_votes and v_leader_count=1");
    expect(migration).toContain("'forfeit_bonus',80");
  });

  it("keeps role rotation balanced without making it deterministic", () => {
    expect(migration).toContain("order by -ln(greatest(random(),0.000000001))");
    expect(migration).toContain("candidate.prior_count*1.75");
    expect(migration).toContain("candidate.profile_id=v_last_impostor then 3");
  });

  it("enforces short blind clues and blocks obvious answer leakage", () => {
    expect(migration).toContain("Clues must be 1-4 words");
    expect(migration).toContain("Clues must be 1-32 characters");
    expect(migration).toContain("Spelling and phonetic hints are not allowed");
    expect(migration).toContain("That clue gives away too much of the secret");
    expect(migration).toContain("Links are not allowed in clues");
  });

  it("locks the Impostor guess with the vote before any result reveal", () => {
    expect(migration).toContain("The Impostor must lock a secret guess with the vote");
    expect(migration).toContain("vote_submitted_at=p_at");
    expect(migration).toContain("secret_guess=case when profile_id=v_round.impostor_profile_id then v_guess else null end");
    expect(page).toContain("Your vote and secret guess submit together");
  });

  it("wires the finished Featured Challenge into HQ without hijacking daily games", () => {
    expect(router).toContain('{ path: "impostor", element: <HqImpostorPage /> }');
    expect(home).toContain("<HqImpostorHomeCard />");
    expect(page).toContain("HQ IMPOSTOR");
    expect(page).toContain("IMPOSTOR EXPOSED");
    expect(page).toContain("IMPOSTOR SURVIVES");
    expect(page).toContain("RECOVERY · +50");
  });
});
