import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const picksPage = readFileSync("src/features/mlb/MlbPicksPage.tsx", "utf8");
const styles = readFileSync("src/styles/mlb-playoffs.css", "utf8");
const migration = readFileSync(
  "supabase/migrations/202612310206_mlb_bracket_privacy.sql",
  "utf8",
);

describe("MLB bracket privacy and mobile labels", () => {
  it("does not expose other submitted brackets before the global lock", () => {
    expect(picksPage).toContain("const rest = hub.bracketLocked");
    expect(migration).toContain("if v_bracket_locked then");
    expect(migration).not.toContain("if v_bracket_locked or v_is_owner then");
  });

  it("reserves enough compact mobile width for three-letter team abbreviations", () => {
    expect(styles).toContain("grid-template-columns: 13px 6px minmax(0, 1fr)");
    expect(styles).toContain("padding: 1px 0");
    expect(styles).toContain("letter-spacing: -.02em");
  });
});
