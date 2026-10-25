import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { advanceMillionaireDailyRuntime as leanMillionaire } from "../features/play/millionaireDailyAdvance";
import {
  advanceMillionaireDailyRuntime as canonicalMillionaire,
  buildMillionaireDailySetup,
} from "../features/play/millionaireDailyRuntime";
import type { OfficialDailyRuntimeContext } from "../features/play/todaysChallengeRuntime";

const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const bundler = readFileSync("scripts/bundle-daily-challenge-runtime.mjs", "utf8");

function gameContext(sport: "ufc" | "football"): OfficialDailyRuntimeContext {
  const published = buildMillionaireDailySetup(
    sport,
    "2026-09-19",
    sport === "ufc" ? "play-rotation-v9-millionaire-no-double" : "football-daily-v11-millionaire-no-double",
  );
  return {
    gameType: "millionaire",
    setupKey: published.setupKey,
    publicSetup: published.publicSetup,
    revealSetup: published.revealSetup,
    privateSetupEvidence: published.privateSetupEvidence,
    privateGradingEvidence: published.privateGradingEvidence,
    submissionState: {},
    publicState: published.publicSetup.initial_state as Record<string, unknown>,
  };
}

describe("all-sport official Daily action latency safeguards", () => {
  it("avoids publication recovery SQL only for an existing published action board", () => {
    const fastPath = edge.slice(
      edge.indexOf("async function resolveInteractiveDaily("),
      edge.indexOf("async function materializeToday("),
    );
    expect(fastPath).toContain('if (mode !== "advance") return materialize()');
    expect(fastPath).toContain('get_daily_challenge_materialization_request');
    expect(fastPath).toContain("if (request.required !== false) return materialize()");
    expect(fastPath).toContain('requiredString(request.daily_challenge_id');
    expect(fastPath).toContain('requiredString(request.central_day');
    expect(fastPath).toContain('requiredString(request.schedule_version');
    expect(edge).toContain('resolveInteractiveDaily(admin, "football", body.mode)');
    expect(edge).toContain('resolveInteractiveDaily(admin, "ufc", body.mode)');
    expect(edge).toContain('admin.auth.getUser(token)');
  });

  it("returns the database-acknowledged intermediate revision, never a fabricated grade", () => {
    const common = edge.slice(
      edge.indexOf("function savedIntermediateContext("),
      edge.indexOf("function footballPublicPayload("),
    );
    expect(common).toContain("requiredRecord(saved.public_state");
    expect(common).toContain("Number(saved.revision)");
    expect(common).toContain("revision <= Number(context.progress_revision)");
    expect(common).not.toContain("official_attempt:");
    for (const sport of ["football", "ufc"]) {
      const start = edge.indexOf(sport === "football"
        ? 'const materialized = await resolveInteractiveDaily(admin, "football", body.mode)'
        : 'const materialized = await resolveInteractiveDaily(admin, "ufc", body.mode)');
      const end = edge.indexOf(sport === "football"
        ? "return json(footballPublicPayload(context));\n    }"
        : "return json(publicPayload(context));\n  }", start);
      const section = edge.slice(start, end + 100);
      expect(section).toContain("advanced.complete");
      expect(section).toContain("savedIntermediateContext(context, saved.data, nextSubmissionState)");
      expect(section).toContain("await finalizePending(");
      expect(section).toContain("dailyClientActionIds(context).includes(clientActionId)");
      expect(section).toContain("save_daily_challenge_runtime_progress");
    }
  });

  it("isolates Millionaire answer logic from all-game publication and preserves outcome parity", () => {
    expect(bundler).toContain('fileName: "millionaire-advance.generated.mjs"');
    expect(edge).toContain('import("./millionaire-advance.generated.mjs")');
    expect(edge).toContain("context.gameType === \"millionaire\"");
    for (const sport of ["ufc", "football"] as const) {
      const context = gameContext(sport);
      const privateRun = context.privateSetupEvidence.run as Array<{ correctChoiceId: string; choices: Array<{ id: string }> }>;
      const first = privateRun[0]!;
      const correct = { type: "answer", choice_id: first.correctChoiceId, time_remaining_ms: 110_000 };
      const miss = { type: "answer", choice_id: first.choices.find((row) => row.id !== first.correctChoiceId)!.id, time_remaining_ms: 110_000 };
      for (const action of [correct, miss, { type: "use_lifeline", lifeline: "stat-sheet", time_remaining_ms: 110_000 }]) {
        expect(leanMillionaire(context, action)).toEqual(canonicalMillionaire(context, action));
      }
    }
  });
});
