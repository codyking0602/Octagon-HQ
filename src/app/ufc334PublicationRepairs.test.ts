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
    expect(builder).toContain("matches.length === 1");
    expect(builder).toContain("boutId,");
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

  it("places fighter rank badges inside the tile beside, rather than on, the photo", () => {
    expect(presentation).toContain("grid-template-rows:minmax(0,1fr);");
    expect(presentation).toContain("position:absolute;");
    expect(presentation).toContain("top:10px;");
    expect(presentation).toContain(".pick-choice-shell--red .pick-fighter-identity {right:9px;align-items:flex-end;}");
    expect(presentation).toContain(".pick-choice-shell--blue .pick-fighter-identity {left:9px;align-items:flex-start;}");
    expect(presentation).toContain(".pick-choice-shell:has(.pick-fighter-identity a) .pick-choice > .pick-fighter-photo-frame");
    expect(presentation).toContain("calc(100% - 65px)");
    expect(presentation).toContain("width: min(var(--picks-main-thumb-size), calc(100% - 65px));");
    expect(presentation).not.toContain("grid-template-rows:minmax(0,1fr) 40px;");
    expect(presentation).not.toContain("grid-template-rows: minmax(0, 1fr) 72px;");
  });

  it("enlarges the rendered fighter inside its square frame without stretching the source", () => {
    expect(presentation).toContain(".pick-fighter-photo-frame");
    expect(presentation).toContain("object-fit: cover;");
    expect(presentation).toContain("transform: scale(1.16)");
    expect(presentation).toContain("transform: scale(1.04)");
    expect(presentation).toContain("transform: scale(1.24)");
    for (const slug of ["yousri-belgaroui", "chris-duncan", "luis-gurule", "charles-radtke"]) {
      expect(presentation).toContain(`data-fighter-slug="${slug}"`);
    }
  });
});
