import test from "node:test";
import assert from "node:assert/strict";
import { validateDailyPlayability, checkEdgeRuntimeReachable } from "./check-three-sport-daily-playability.mjs";

const today = "2026-11-05";
const good = (sport, game) => ({
  sport, day: today, central_today: today, expected_game: game,
  published_game: game, stored_game: game, required: false,
  has_challenge: true, scoring_version: "play-official-score-v1",
  valid_setup: true, valid_two_game: true,
  valid_higher_lower_question: true, central_minutes: 100,
});
const healthy = () => [
  good("football", "higher_lower"),
  good("ufc", "average_fan"),
  good("nba", "millionaire"),
];

test("all three real published sport boards are healthy, including a 48-hour active UFC board", () => {
  const rows = healthy();
  rows[1].day = "2026-11-04";
  const result = validateDailyPlayability(rows);
  assert.deepEqual(result.failures, []);
  assert.equal(result.summaries.length, 3);
});

test("fails if a game is scheduled but the scheduler could not publish it", () => {
  const rows = healthy();
  rows[0].required = true;
  rows[0].has_challenge = false;
  assert.match(validateDailyPlayability(rows).failures[0], /football.*no published/);
});

test("fails if a scheduled game publishes the wrong game type", () => {
  const rows = healthy();
  rows[2].stored_game = "higher_lower";
  assert.match(validateDailyPlayability(rows).failures[0], /nba.*does not match/);
});

test("fails if an immutable published setup lacks playable state or two-round evidence", () => {
  for (const field of ["valid_setup", "valid_two_game", "valid_higher_lower_question"]) {
    const rows = healthy();
    rows[0][field] = false;
    assert.match(validateDailyPlayability(rows).failures[0], /playable evidence/);
  }
});

test("allows only a same-day first-15-minute scheduler grace", () => {
  const rows = healthy();
  rows[0].required = true;
  rows[0].has_challenge = false;
  rows[0].central_minutes = 11;
  assert.deepEqual(validateDailyPlayability(rows).failures, []);
  rows[0].central_minutes = 15;
  assert.equal(validateDailyPlayability(rows).failures.length, 1);
  rows[0].central_minutes = 5;
  rows[0].day = "2026-11-04";
  assert.equal(validateDailyPlayability(rows).failures.length, 1);
});

test("allows NBA's off-season while requiring UFC and Football schedules", () => {
  const rows = healthy();
  rows[2].expected_game = null;
  assert.deepEqual(validateDailyPlayability(rows).failures, []);
  rows[0].expected_game = null;
  assert.match(validateDailyPlayability(rows).failures[0], /missing an active canonical schedule/);
});

test("fails closed on missing, duplicate, or unauthorized sport records", () => {
  assert.throws(() => validateDailyPlayability(healthy().slice(0, 2)), /exactly three/);
  const rows = healthy();
  rows[2].sport = "football";
  assert.throws(() => validateDailyPlayability(rows), /duplicate or invalid sport/);
  rows[2].sport = "mlb";
  assert.throws(() => validateDailyPlayability(rows), /duplicate or invalid sport/);
});

test("checks the deployed Edge HTTP runtime without touching a player or game", async () => {
  const calls = [];
  const client = async (url, request) => {
    calls.push({ url, request });
    return { ok: true, json: async () => ({ deployment_sha: "live-deployment" }) };
  };
  await checkEdgeRuntimeReachable("rvbspcjvebgwqzssayts", client);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /functions\/v1\/daily-challenge-runtime$/);
  assert.deepEqual(JSON.parse(calls[0].request.body), { mode: "deployment-info" });
  await assert.rejects(
    checkEdgeRuntimeReachable("rvbspcjvebgwqzssayts",
      async () => ({ ok: false, status: 503 })),
    /HTTP 503/,
  );
  await assert.rejects(
    checkEdgeRuntimeReachable("rvbspcjvebgwqzssayts",
      async () => ({ ok: true, json: async () => ({}) })),
    /deployment identity/,
  );
});
