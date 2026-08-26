import fs from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildSeasonSummary,
  parseCfbfastRPlayerStats,
  sourceConfigForSeason,
} from "../../../scripts/import-football-cfb-historical-player-stats.mjs";

const sampleCsv = [
  "season,team,conference,athlete_id,rush_player_id,rush_player,rush_yds,reception_player_id,reception_player,reception_yds,completion_player_id,completion_player,completion_yds,touchdown_player_id,touchdown_player,touchdown_stat,interception_thrown_player_id,interception_thrown_player,interception_thrown_stat",
  "2024,Texas,SEC,1,100,Quinn Ewers,8,,,,100,Quinn Ewers,20,100,Quinn Ewers,1,,,",
  "2024,Texas,SEC,1,100,Quinn Ewers,5,,,,100,Quinn Ewers,15,100,Quinn Ewers,1,100,Quinn Ewers,1",
  "2024,Texas,SEC,2,,,,200,Isaiah Bond,20,,,,200,Isaiah Bond,1,,,",
].join("\n");

describe("historical CFB player-season adapter", () => {
  it("pins every historical season to the canonical cfbfastR source commit", () => {
    for (const season of [2014, 2018, 2024, 2025]) {
      const config = sourceConfigForSeason(season);
      expect(config.repository).toBe("sportsdataverse/cfbfastR-data");
      expect(config.commit).toBe("a0f29f9ec6c04952a720905017e74a7b089dc1eb");
      expect(config.path).toBe(`player_stats/csv/player_stats_${season}.csv`);
      expect(config.license).toBe("CC-BY-4.0");
    }
  });

  it("collapses play-level rows into compact player-season facts without promoting game eligibility", () => {
    const parsed = parseCfbfastRPlayerStats(sampleCsv, 2024);
    const summary = buildSeasonSummary(parsed, 2024);

    const quinn = summary.rows.find((row) => row.sourceAthleteId === "100");
    const bond = summary.rows.find((row) => row.sourceAthleteId === "200");

    expect(quinn).toMatchObject({
      season: 2024,
      team: "Texas",
      conference: "SEC",
      sourceAthleteId: "100",
      displayName: "Quinn Ewers",
      passingYards: 35,
      rushingYards: 13,
      touchdowns: 2,
      interceptionsThrown: 1,
    });
    expect(bond).toMatchObject({
      sourceAthleteId: "200",
      displayName: "Isaiah Bond",
      receivingYards: 20,
      touchdowns: 1,
    });

    expect(summary.rows.every((row) => !("casualEligible" in row))).toBe(true);
    expect(summary.rows.every((row) => !("recognizabilityTier" in row))).toBe(true);
  });

  it("keeps generated historical source artifacts out of the initial React bundle", () => {
    const gitignore = fs.readFileSync(".gitignore", "utf8");
    expect(gitignore).toContain("public/data/football/cfb/historical/");
  });
});
