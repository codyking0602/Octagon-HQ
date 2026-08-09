// Disposable post-merge release proof for PR #363. This file never merges.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310005_live_pick_results_and_owner_lock_edits.sql",
  "utf8",
);
const previewVerifier = readFileSync("scripts/verify-event-setup-preview-live.mjs", "utf8");
const pinVerifier = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");

describe("PR #363 post-merge release proof", () => {
  it("keeps live fight grading, explicit owner reopen, and fail-closed backend verification on main", () => {
    expect(migration).toContain("record_official_pick_bout_result");
    expect(migration).toContain("adjust_pick_bout_lock_time");
    expect(previewVerifier).toContain("retryStatuses: [546]");
    expect(previewVerifier).toContain("[200, 502]");
    expect(pinVerifier).toContain("waitForSingleExpandedFight");
  });
});
