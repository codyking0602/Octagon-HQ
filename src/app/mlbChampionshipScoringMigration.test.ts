import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const foundationMigration = readFileSync(
  "supabase/migrations/202612310182_mlb_postseason_championship.sql",
  "utf8",
);
const elevenGameMigration = readFileSync(
  "supabase/migrations/202612310208_mlb_bar_trivia_and_eleven_game_scoring.sql",
  "utf8",
);

describe("MLB postseason championship scoring", () => {
  it("keeps the 43 / 32 / 25 championship calibration", () => {
    expect(foundationMigration).toContain("43 points from round-by-round series picks");
    expect(foundationMigration).toContain("32 points from the one-time bracket");
    expect(foundationMigration).toContain("'total_max', 100");
    expect(foundationMigration).toContain("'series_max', 43");
    expect(foundationMigration).toContain("'bracket_max', 32");
    expect(foundationMigration).toContain("'play_max', 25");
    expect(elevenGameMigration).toContain("eleven official challenges");
    expect(elevenGameMigration).toContain("25 championship points total");
  });

  it("weights live series picks most", () => {
    expect(foundationMigration).toContain("when 'wild_card' then 2");
    expect(foundationMigration).toContain("when 'division_series' then 4");
    expect(foundationMigration).toContain("when 'championship_series' then 5");
    expect(foundationMigration).toContain("when 'world_series' then 9");
  });

  it("recalibrates the one-time bracket to 32 points", () => {
    expect(foundationMigration).toContain("when 'wild_card' then 1");
    expect(foundationMigration).toContain("when 'division_series' then 2");
    expect(foundationMigration).toContain("when 'championship_series' then 5");
    expect(foundationMigration).toContain("when 'world_series' then 10");
  });

  it("splits all eleven challenge placement ladders into the same 25-point lane", () => {
    expect(elevenGameMigration).toContain("generate_series(");
    expect(elevenGameMigration).toContain("when 1 then 25::numeric / 11::numeric");
    expect(elevenGameMigration).toContain("when 2 then 20::numeric / 11::numeric");
    expect(elevenGameMigration).toContain("when 3 then 15::numeric / 11::numeric");
    expect(elevenGameMigration).toContain("when 4 then 10::numeric / 11::numeric");
    expect(elevenGameMigration).toContain("when 5 then 5::numeric / 11::numeric");
    expect(elevenGameMigration).toContain("ranked.rank_start + ranked.tie_count - 1");
    expect(elevenGameMigration).toContain("25::numeric");
  });

  it("adds exactly one spoiler-free Bar Trivia scoring slot on October 21", () => {
    expect(elevenGameMigration).toContain("slot between 1 and 11");
    expect(elevenGameMigration).toContain("'mlb-2026-play-11'");
    expect(elevenGameMigration).toContain("date '2026-10-21'");
    expect(elevenGameMigration).toContain("'bar_trivia'");
    expect(elevenGameMigration).not.toContain("October Legend");
  });
});
