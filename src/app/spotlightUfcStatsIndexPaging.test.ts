import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getUfcStatsSnapshotFighter } from "../../supabase/functions/build-pick-spotlight/ufcStatsSnapshot.ts";

const builder = readFileSync("supabase/functions/build-pick-spotlight/index.ts", "utf8");

const sacramentoCardFighters = [
  "Anthony Hernandez",
  "Gregory Rodrigues",
  "Roman Dolidze",
  "Reinier de Ridder",
  "Serghei Spivac",
  "Vitor Petrino",
  "Kennedy Nzechukwu",
  "Shamil Gaziev",
  "Kody Steele",
  "Gauge Young",
  "Carli Judice",
  "Jeisla Chaves",
  "Wes Schultz",
  "Jackson McVey",
  "Shanelle Dyer",
  "Elise Reed",
] as const;

describe("UFCStats Spotlight snapshot", () => {
  it("does not make a live UFCStats request while the owner is building a Spotlight", () => {
    expect(builder).toContain('getUfcStatsSnapshotFighter');
    expect(builder).not.toContain('fetchUfcStatsHtml');
    expect(builder).not.toContain('ufcstats.com/statistics/fighters');
    expect(builder).not.toContain('fighter-details');
  });

  it("covers every fighter on the current owner-authored Sacramento card", () => {
    for (const name of sacramentoCardFighters) {
      const fighter = getUfcStatsSnapshotFighter(name);
      expect(fighter?.name).toBe(name);
      expect(fighter?.record).toMatch(/^\d+-\d+-\d+/);
      expect(fighter?.height).not.toBe("--");
      expect(fighter?.reach).not.toBe("--");
      expect(fighter?.slpm).toBeTypeOf("number");
      expect(fighter?.takedownDefense).toBeTypeOf("number");
    }
  });

  it("includes the Anthony Hernandez data that blocked Spotlight creation", () => {
    expect(getUfcStatsSnapshotFighter("Anthony Hernandez")).toMatchObject({
      record: "15-3-0 (1 NC)",
      height: "6' 0\"",
      reach: "75\"",
      stance: "Orthodox",
      slpm: 4.57,
      takedownAverage: 5.88,
      takedownDefense: 68,
    });
  });
});
