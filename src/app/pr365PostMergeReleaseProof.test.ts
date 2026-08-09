// Disposable post-merge release proof for PR #365. This file never merges.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310006_seed_august_8_pick_watch_moment.sql",
  "utf8",
);

describe("PR #365 post-merge release proof", () => {
  it("keeps the supplied August 8 watch moment on merged main", () => {
    expect(migration).toContain("https://youtu.be/vOnbuPMDJUc?is=pYiX3TKQV0-YEY-f");
    expect(migration).toContain("status = 'completed'");
    expect(migration).toContain("set watch_moments = case");
  });
});
