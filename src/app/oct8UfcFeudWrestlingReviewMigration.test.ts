import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310282_ufc_feud_oct8_wrestling_acceptance_repair.sql",
  "utf8",
);
const resultScreen = readFileSync("src/features/play/DailyLeaderboardGameResult.tsx", "utf8");

describe("Oct. 8 UFC Sports Feud wrestling score review", () => {
  it("adds valid off-board wrestling answers to the published pack, without replacing rankings", () => {
    expect(migration).toContain("'ufc-main-04-1:v7','Khamzat Chimaev'");
    expect(migration).toContain("'ufc-main-04-1:v8','Arman Tsarukyan'");
    expect(migration).toContain("'ufc-main-04-1:v12','Sean Brady'");
    expect(migration).toContain("'{alsoAcceptedEntityIds}'");
    expect(migration).not.toContain("'answers',");
  });

  it("corrects the false strike but never fabricates extra points for a filled board", () => {
    expect(migration).toContain("v_points <> 88");
    expect(migration).toContain("'strikes',0");
    expect(migration).toContain("'reviewedRecognized'");
    expect(migration).toContain("'accepted',true");
    expect(migration).toContain("'reviewed',true");
    expect(migration).not.toContain("update private.daily_challenge_attempts");
    expect(migration).not.toContain("'normalized_score',90");
  });

  it("displays historical review independently of a real recorded guess sequence", () => {
    expect(resultScreen).toContain("records(board.reviewed_guesses)");
    expect(resultScreen).toContain("const displayGuesses = [...recordedGuesses, ...reviewedGuesses]");
    expect(resultScreen).toContain('guess.reviewed === true ? "VALID · REVIEWED"');
  });
});
