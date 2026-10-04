import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310245_wheel_football_matchwide_uniqueness.sql",
  "utf8",
);
const page = readFileSync("src/features/back-room/FootballWheelPage.tsx", "utf8");

describe("Wheel of Football match-wide player uniqueness", () => {
  it("enforces one athlete/coach identity per matchup at the database layer", () => {
    expect(migration).toContain(
      "create unique index if not exists wheel_football_picks_challenge_athlete_unique",
    );
    expect(migration).toContain(
      "on private.wheel_football_picks (challenge_id, athlete_id)",
    );
  });

  it("rejects an identity drafted by either participant, not only the current roster", () => {
    expect(migration).toContain("where pick.challenge_id = v_challenge.id");
    expect(migration).toContain("and pick.athlete_id = trim(p_athlete_id)");
    expect(migration).toContain("That player has already been drafted in this matchup");
    expect(migration).not.toContain(
      "and pick.profile_id = v_user_id\n      and pick.athlete_id = trim(p_athlete_id)",
    );
  });

  it("removes every already-drafted identity from the picker across all participants", () => {
    expect(page).toContain(
      "state.participants.flatMap((participant) => participant.roster).map((pick) => pick.athlete_id)",
    );
    expect(page).toContain(
      "candidates.filter((candidate) => !usedAthleteIds.has(candidate.id))",
    );
    expect(page).toContain("usedAthleteIds={usedAthleteIds}");
  });
});
