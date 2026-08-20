import { describe, expect, it } from "vitest";
import recognizabilityMigration from "../../../supabase/migrations/202612310036_auction_recognizability.sql?raw";

const replacements = [
  "Robbie Lawler vs Johny Hendricks — UFC 171",
  "Robbie Lawler vs Carlos Condit — UFC 195",
  "Yoel Romero vs Paulo Costa — UFC 241",
  "Sean O'Malley vs Petr Yan — UFC 280",
  "Justin Gaethje vs Rafael Fiziev — UFC 286",
  "Alex Pereira vs Khalil Rountree Jr. — UFC 307",
  "Islam Makhachev vs Dustin Poirier — UFC 302",
  "Islam Makhachev vs Alexander Volkanovski — UFC 284",
  "Charles Oliveira vs Michael Chandler II — UFC 309",
  "Joanna Jedrzejczyk vs Claudia Gadelha II — TUF 23 Finale",
  "Anderson Silva vs Michael Bisping — UFC Fight Night 84",
  "Eddie Alvarez vs Justin Gaethje — UFC 218",
  "Wanderlei Silva vs Brian Stann — UFC on Fuel TV 8",
  "Jim Miller vs Joe Lauzon — UFC 155",
  "Dustin Poirier vs Eddie Alvarez II — UFC on Fox 30",
] as const;

describe("Auction recognizability catalog rotation", () => {
  it("rotates v4 to immutable v5 without changing grading version", () => {
    expect(recognizabilityMigration).toContain("'ufc-auction-2026-08-v5'");
    expect(recognizabilityMigration).toContain("'ufc-private-grader-2026-08-v2'");
    expect(recognizabilityMigration).toContain("source.grading_inputs");
    expect(recognizabilityMigration).not.toContain("update private.auction_catalog catalog");
  });

  it("contains exactly the reviewed recognizable Wars replacement set", () => {
    for (const replacement of replacements) {
      expect(recognizabilityMigration).toContain(replacement.replace("'", "''"));
    }
    expect(replacements).toHaveLength(15);
  });

  it("keeps the six-round, three-selection, thirty-dollar standard contract", () => {
    expect(recognizabilityMigration).toContain("then 6");
    expect(recognizabilityMigration).toContain("then 3");
    expect(recognizabilityMigration).toContain("then 30");
    expect(recognizabilityMigration).toContain("when mode_id = 'ultimate-fighter' then 10");
    expect(recognizabilityMigration).toContain("when mode_id = 'ultimate-fighter' then 5");
    expect(recognizabilityMigration).toContain("when mode_id = 'ultimate-fighter' then 50");
  });
});
