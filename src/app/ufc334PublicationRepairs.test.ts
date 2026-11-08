import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { fighterOddsIdentity, fightOddsMatchupIdentity } from "../features/picks-monitoring/oddsModel.ts";

const builder = readFileSync("supabase/functions/build-pick-spotlight/index.ts", "utf8");
const migration = readFileSync("supabase/migrations/202612311520_ufc_named_manual_event_push.sql", "utf8");
const controlRepository = readFileSync("src/features/picks-control/pickControlRepository.ts", "utf8");
const presentation = readFileSync("src/styles/picks-polish.css", "utf8");

describe("UFC 334 publication repairs", () => {
  it("matches sportsbook Charlie to the canonical Charles Radtke bout", () => {
    expect(fighterOddsIdentity("Charlie Radtke")).toBe(fighterOddsIdentity("Charles Radtke"));
    expect(fightOddsMatchupIdentity("Stephen Thompson", "Charlie Radtke"))
      .toBe(fightOddsMatchupIdentity("Charles Radtke", "Stephen Thompson"));
  });

  it("matches owner-verified saved Spotlight content before the snapshot-only path", () => {
    expect(builder).toContain('from("ufc_pick_prep_packages")');
    expect(builder).toContain('entry?.source === "UFCStats"');
    expect(builder).toContain("entry?.bout_id === boutId");
    expect(builder).toContain("r?.fighter_slug === redSlug && b?.fighter_slug === blueSlug");
    expect(builder.indexOf("const ufcNumber")).toBeLessThan(builder.indexOf("const red = loadFighter"));
    expect(controlRepository).toContain("pickSetupFunctionErrorMessage(error)");
  });

  it("names the server-owned UFC event in manual push without touching football pushes", () => {
    expect(migration).toContain("v_event.name ||");
    expect(migration).toContain("': ' || trim(v_event.subtitle)");
    expect(migration).toContain("Published and ready for picks.");
    expect(migration).toContain("football_picks_open");
    expect(migration).toContain("public.is_pick_control_owner(auth.uid())");
    expect(migration).not.toContain("select profile.id into");
  });

  it("puts rank badges in a separate row and clips enlarged portraits", () => {
    expect(presentation).toContain("grid-template-rows:minmax(0,1fr) auto;");
    expect(presentation).toContain(".pick-fighter-photo-frame");
    expect(presentation).toContain('data-fighter-slug="yousri-belgaroui"');
  });
});
