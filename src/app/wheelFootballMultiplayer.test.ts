import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310258_wheel_football_multiplayer.sql",
  "utf8",
);
const pickPhaseHotfix = readFileSync(
  "supabase/migrations/202612310260_wheel_football_multiplayer_pick_phase_fix.sql",
  "utf8",
);
const repository = readFileSync(
  "src/features/play/wheelFootballRepository.ts",
  "utf8",
);
const page = readFileSync(
  "src/features/back-room/FootballWheelPage.tsx",
  "utf8",
);
const center = readFileSync(
  "src/features/challenges/ChallengeCenter.tsx",
  "utf8",
);
const registry = readFileSync(
  "src/features/play/playRegistry.ts",
  "utf8",
);

describe("Wheel of Football 2-4 player contract", () => {
  it("owns one canonical room with up to four participants and 28 picks", () => {
    expect(migration).toContain("create table if not exists private.wheel_football_participants");
    expect(migration).toContain("seat_order smallint not null check (seat_order between 0 and 3)");
    expect(migration).toContain("check (turn_count between 0 and 28)");
    expect(migration).toContain("check (turn_number between 1 and 28)");
    expect(migration).toContain("p_recipient_ids uuid[]");
    expect(migration).toContain("v_recipient_count < 1 or v_recipient_count > 3");
    expect(migration).toContain("'participantCount', v_recipient_count + 1");
  });

  it("starts only after the whole lobby accepts and rotates through active incomplete players", () => {
    expect(migration).toContain("participant.accepted_at is null");
    expect(migration).toContain("if v_unaccepted = 0 and v_match.phase = 'waiting' then");
    expect(migration).toContain("order by random()");
    expect(migration).toContain("participant.seat_order > v_actor_seat");
    expect(migration).toContain("participant.forfeited_at is null");
    expect(migration).toContain("private.wheel_football_max_turns");
  });

  it("keeps draft identities match-wide and supports multiplayer forfeits and standings", () => {
    expect(migration).toContain("That player or coach was already drafted in this match");
    expect(migration).toContain("private.finish_wheel_football");
    expect(migration).toContain("if v_remaining <= 1 then");
    expect(migration).toContain("The remaining players continue.");
    expect(migration).toContain("dense_rank() over (order by participant.grade_total desc)");
    expect(migration).toContain("'standings'");
    expect(migration).toContain("'winner_profile_ids'");
    expect(migration).toContain("'resolved_by_forfeit'");
  });

  it("preserves legacy 1v1 results during adoption", () => {
    expect(migration).toContain("Preserve final grades/ranks for every already-completed 1v1 room");
    expect(migration).toContain("challenge.creator_result ? 'finalGrade'");
    expect(migration).toContain("challenge.responder_result ? 'finalGrade'");
    expect(migration).toContain("match.resolved_by_forfeit or match.forfeited_at is not null");
  });

  it("exposes 2-4 participants through the repository and the existing Wheel UI", () => {
    expect(repository).toContain("participants: z.array(participantSchema).min(2).max(4)");
    expect(repository).toContain("p_recipient_ids: ids");
    expect(repository).toContain("turn_count: z.coerce.number().int().min(0).max(28)");
    expect(page).toContain("CHOOSE 1–3 OPPONENTS");
    expect(page).toContain("START ${playerCount}-PLAYER CHALLENGE");
    expect(page).toContain("state.participants.length === 2");
    expect(page).toContain("<HeadToHeadRoster");
    expect(page).toContain("<MultiplayerRosters");
    expect(page).toContain("state.participants.flatMap");
    expect(page).toContain("CANCEL LOBBY");
  });

  it("keeps the original two-column final score for head-to-head matches", () => {
    expect(page).toContain("function TwoPlayerResultScore");
    expect(page).toContain('className="football-wheel-result-score"');
    expect(page).toContain("<b>VS</b>");
    expect(page).toContain("state.result ? state.participants.length === 2");
    expect(page).toContain("<TwoPlayerResultScore");
    expect(page).toContain('className="football-wheel-multiplayer-score"');
  });

  it("keeps the pick row valid until the next phase transition", () => {
    expect(pickPhaseHotfix).toContain("wheel_football_phase_state_valid");
    expect(pickPhaseHotfix).toContain("set turn_count = v_next_turn_count,\n      updated_at = now()");
    expect(pickPhaseHotfix).not.toContain(
      "set turn_count = v_next_turn_count,\n      pending_team_code = null",
    );
    expect(pickPhaseHotfix).toContain(
      "set phase = 'spin',\n      current_turn_profile_id = v_next_profile,\n      pending_team_code = null",
    );
  });

  it("makes waiting-lobby cancellation server-owned and advertises multiplayer in Play", () => {
    expect(center).toContain("createWheelFootballRepository");
    expect(center).toContain("endWaitingTurnBasedChallenge");
    expect(center).toContain("canCancelTurnBased");
    expect(registry).toContain("Invite 1–3 friends");
    expect(registry).toContain("lineupSize: 28");
    expect(registry).toContain("14, 21, or 28 picks");
  });
});
