import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202612310011_polish_ufc_330_spotlights.sql", "utf8");
const styles = readFileSync("src/styles/picks-spotlight-polish.css", "utf8");
const main = readFileSync("src/main.tsx", "utf8");

describe("UFC 330 title-fight Spotlight polish", () => {
  it("replaces the two staged/published stat-sheet summaries with matchup-specific copy", () => {
    expect(migration).toContain("islam-makhachev");
    expect(migration).toContain("ian-machado-garry");
    expect(migration).toContain("Championship chain wrestling and control");
    expect(migration).toContain("Mobile long-range striking");
    expect(migration).toContain("mackenzie-dern");
    expect(migration).toContain("gillian-robertson");
    expect(migration).toContain("World-class submission grappling");
    expect(migration).toContain("Wrestling-led top control");
    expect(migration.match(/update public\.pick_event_drafts/g)).toHaveLength(1);
    expect(migration.match(/update public\.pick_events/g)).toHaveLength(1);
  });

  it("keeps long fighter Spotlight buttons on one row on mobile", () => {
    expect(main).toContain('import "./styles/picks-spotlight-polish.css";');
    expect(styles).toContain(".main-event-spotlight__watch-links a");
    expect(styles).toContain("white-space: nowrap");
    expect(styles).toContain("font-size: 9px");
  });
});
