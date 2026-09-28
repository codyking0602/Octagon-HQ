import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310206_mlb_bracket_prelock_privacy.sql",
  "utf8",
);
const picksPage = readFileSync("src/features/mlb/MlbPicksPage.tsx", "utf8");
const playoffsCss = readFileSync("src/styles/mlb-playoffs.css", "utf8");

describe("MLB bracket pre-lock privacy and mobile abbreviations", () => {
  it("does not give the owner a bracket-visibility bypass before lock", () => {
    expect(migration).toContain("if v_bracket_locked then");
    expect(migration).not.toContain("if v_bracket_locked or v_is_owner then");
    expect(migration).toContain("not v_season.public_enabled and not v_is_owner");
  });

  it("defensively limits browser and standings entries before bracket lock", () => {
    expect(picksPage).toContain("const rest = hub.bracketLocked");
    expect(picksPage).toContain(".filter((entry) => hub?.bracketLocked || entry.is_current_user)");
    expect(picksPage).toContain("hub?.bracketLocked && ownEntry");
  });

  it("reserves enough mobile width for full three-letter team abbreviations", () => {
    expect(playoffsCss).toContain("grid-template-columns: 13px 6px minmax(20px, 1fr)");
    expect(playoffsCss).toContain("min-width: 20px");
    expect(playoffsCss).toContain("font-size: .43rem");
  });
});
