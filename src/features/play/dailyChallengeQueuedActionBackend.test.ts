import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("daily queued action backend contract", () => {
  const runtime = readFileSync(
    "supabase/functions/daily-challenge-runtime/index.ts",
    "utf8",
  );

  it("persists bounded client action ids with the official runtime state", () => {
    expect(runtime).toContain("function dailyClientActionIds");
    expect(runtime).toContain("function submissionStateWithClientActionId");
    expect(runtime).toContain("_client_action_ids");
    expect(runtime).toContain(".slice(-64)");
  });

  it("acknowledges an already-saved action before stale revision or completed-attempt rejection", () => {
    const football = runtime.indexOf('if (body.sport === "football") {');
    const footballDuplicate = runtime.indexOf(
      "dailyClientActionIds(context).includes(clientActionId)",
      football,
    );
    const footballComplete = runtime.indexOf("if (asRecord(context.official_attempt))", footballDuplicate);
    const footballStale = runtime.indexOf('return safeError(409, "STALE_PROGRESS"', footballDuplicate);
    expect(footballDuplicate).toBeGreaterThan(football);
    expect(footballComplete).toBeGreaterThan(footballDuplicate);
    expect(footballStale).toBeGreaterThan(footballDuplicate);

    const ufcMode = runtime.lastIndexOf('if (body.mode !== "advance")');
    const ufcDuplicate = runtime.indexOf(
      "dailyClientActionIds(context).includes(clientActionId)",
      ufcMode,
    );
    const ufcComplete = runtime.indexOf("if (asRecord(context.official_attempt))", ufcDuplicate);
    const ufcStale = runtime.indexOf('return safeError(409, "STALE_PROGRESS"', ufcDuplicate);
    expect(ufcDuplicate).toBeGreaterThan(ufcMode);
    expect(ufcComplete).toBeGreaterThan(ufcDuplicate);
    expect(ufcStale).toBeGreaterThan(ufcDuplicate);
  });

  it("keeps Football action history and queued idempotency metadata together", () => {
    expect(runtime).toContain("action_history: [...history, action]");
    expect(runtime).toContain("dailyClientActionIds(context), clientActionId");
    expect(runtime).toContain('key !== "_client_action_ids"');
  });
});
