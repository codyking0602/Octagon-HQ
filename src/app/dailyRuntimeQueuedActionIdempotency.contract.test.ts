import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Daily runtime queued-action idempotency", () => {
  it("persists client action ids and acknowledges retries before stale/completed rejection", () => {
    const source = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");

    expect(source).toContain("requestedClientActionId(body)");
    expect(source).toContain("dailyClientActionIds(context).includes(clientActionId)");
    expect(source).toContain("submissionStateWithClientActionId(");
    expect(source).toContain("_client_action_ids");
    expect(source.indexOf("dailyClientActionIds(context).includes(clientActionId)"))
      .toBeLessThan(source.indexOf('if (asRecord(context.official_attempt))'));
  });
});
