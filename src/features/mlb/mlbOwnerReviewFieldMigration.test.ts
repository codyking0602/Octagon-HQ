import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310203_mlb_2026_owner_review_field.sql",
  "utf8",
);
const config = readFileSync("src/features/mlb/mlbPlayoffsConfig.ts", "utf8");
const spotlight = readFileSync("src/features/mlb/mlbTeamAssets.ts", "utf8");

describe("MLB 2026 owner review field", () => {
  it("loads the finalized 12-team bracket through the private owner-review stage", () => {
    expect(migration).toContain("field_ready = true");
    expect(migration).toContain("public_enabled = false");
    expect(config).toContain("MLB_PLAYOFFS_PUBLIC_ENABLED = true");
    expect(migration.match(/\"seed\":/g) ?? []).toHaveLength(12);
    expect(migration.match(/\"id\":\"(?:al|nl)-(?:wc|ds)-[12]\"/g) ?? []).toHaveLength(8);
    expect(migration).toContain("\"id\":\"al-cs\"");
    expect(migration).toContain("\"id\":\"nl-cs\"");
    expect(migration).toContain("\"id\":\"ws\"");
  });

  it("locks the full bracket one hour before the first Wild Card game", () => {
    expect(migration).toContain("2026-09-29 12:00:00-05");
    expect(migration).toContain("2026-09-29 13:00:00-05");
  });

  it("loads all four Wild Card series in published Central-time order", () => {
    expect(migration).toContain("'phi', 'Philadelphia Phillies', 'atl', 'Atlanta Braves'");
    expect(migration).toContain("'cws', 'Chicago White Sox', 'hou', 'Houston Astros'");
    expect(migration).toContain("'bos', 'Boston Red Sox', 'nyy', 'New York Yankees'");
    expect(migration).toContain("'chc', 'Chicago Cubs', 'sd', 'San Diego Padres'");
    expect(migration).toContain("1:00 PM CT · NBC");
    expect(migration).toContain("4:00 PM CT · Peacock");
    expect(migration).toContain("7:00 PM CT · NBC");
    expect(migration).toContain("9:00 PM CT · Peacock");
  });

  it("preserves the owner-review Yankees-Red Sox feature while the live player spotlight advances", () => {
    expect(migration).toContain("'series_id', 'al-wc-2'");
    expect(migration).toContain("'title', 'Red Sox vs. Yankees'");
    expect(spotlight).toContain('name: "Fernando Tatis Jr."');
    expect(spotlight).toContain('{ label: "AVG", value: ".289" }');
    expect(spotlight).toContain('{ label: "SB", value: "38" }');
    expect(spotlight).not.toContain('name: "Aaron Judge"');
  });
});
