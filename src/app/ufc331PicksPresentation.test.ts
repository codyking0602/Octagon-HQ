import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { fightCardLabel, type PickBout } from "../features/picks/picksModel";
import { buildPickSpotlightContent } from "../features/picks/spotlightContent";
import { getUfcStatsSnapshotFighter } from "../../supabase/functions/build-pick-spotlight/ufcStatsSnapshot";

const pairs = [
  ["Joshua Van", "joshua-van", "Alexandre Pantoja", "alexandre-pantoja"],
  ["Arman Tsarukyan", "arman-tsarukyan", "Mauricio Ruffy", "mauricio-ruffy"],
  ["Patricio Pitbull", "patricio-pitbull", "Dooho Choi", "dooho-choi"],
  ["Alonzo Menifield", "alonzo-menifield", "Iwo Baraniewski", "iwo-baraniewski"],
  ["Gable Steveson", "gable-steveson", "Sean Sharaf", "sean-sharaf"],
  ["Marlon Vera", "marlon-vera", "Charles Jourdain", "charles-jourdain"],
  ["Tai Tuivasa", "tai-tuivasa", "Robelis Despaigne", "robelis-despaigne"],
  ["Michael Aswell Jr", "michael-aswell-jr", "JooSang Yoo", "joosang-yoo"],
] as const;

describe("UFC 331 Picks fight-week polish", () => {
  it("ships complete matchup packages for every active Picks bout", () => {
    pairs.forEach(([redName, redSlug, blueName, blueSlug], index) => {
      const red = getUfcStatsSnapshotFighter(redName);
      const blue = getUfcStatsSnapshotFighter(blueName);
      expect(red, redName).not.toBeNull();
      expect(blue, blueName).not.toBeNull();

      for (const fighter of [red!, blue!]) {
        expect(fighter.record).not.toBe("--");
        expect(fighter.height).not.toBe("--");
        expect(fighter.reach).not.toBe("--");
        expect(fighter.stance).not.toBe("--");
      }

      const spotlight = buildPickSpotlightContent({
        boutId: `ufc-331-${index + 1}`,
        eventStartsAt: "2026-09-20T01:00:00.000Z",
        red: { ...red!, fighterSlug: redSlug },
        blue: { ...blue!, fighterSlug: blueSlug },
        generatedAt: "2026-09-15T04:45:00.000Z",
      });

      expect(spotlight.preview).not.toContain("stay adaptable");
      expect(spotlight.preview).not.toContain("imposes the better phase");
      expect(spotlight.red.edges).toHaveLength(3);
      expect(spotlight.blue.edges).toHaveLength(3);
      expect(spotlight.red.edges).not.toContain("No UFCStats sample yet");
      expect(spotlight.blue.edges).not.toContain("No UFCStats sample yet");
    });
  });

  it("labels numbered-event main-card and prelim positions from canonical segment metadata", () => {
    const base = {
      boutId: "test", position: 5, weightClass: "Heavyweight",
      redFighterSlug: "red", redFighterName: "Red",
      blueFighterSlug: "blue", blueFighterName: "Blue",
      redAmericanOdds: null, blueAmericanOdds: null, winnerFighterSlug: null,
    } satisfies PickBout;

    expect(fightCardLabel({ ...base, position: 1, cardSegment: "main", segmentSequence: 5 }, 0)).toBe("MAIN EVENT");
    expect(fightCardLabel({ ...base, cardSegment: "main", segmentSequence: 4 }, 1, 2)).toBe("MAIN CARD · FIGHT 2");
    expect(fightCardLabel({ ...base, cardSegment: "prelim", segmentSequence: 3 }, 5, 1)).toBe("PRELIMS · FIGHT 1");
  });

  it("keeps the numbered-PPV scope, premium motion, portraits, and fight-week repair locked", () => {
    const page = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
    const motion = readFileSync("src/styles/picks-event-motion.css", "utf8");
    const portraits = readFileSync("src/features/picks/MainEventSpotlight.tsx", "utf8");
    const migration = readFileSync("supabase/migrations/202612310133_ufc_331_picks_fight_week_polish.sql", "utf8");

    expect(page).toContain('"MAIN + PRELIMS"');
    expect(page).toContain("is-numbered-event");
    expect(motion).toContain("animation-duration: 20s");
    expect(motion).toContain("rgba(202, 150, 59, .62)");

    for (const [, redSlug, , blueSlug] of pairs) {
      expect(portraits).toContain(`["${redSlug}",`);
      expect(portraits).toContain(`["${blueSlug}",`);
    }

    expect(migration).toContain("main-renato-moicano-brian-ortega");
    expect(migration).toContain("result_status = 'cancelled'");
    expect(migration).toContain("card_segment = null");
    expect(migration).toContain("set segment_sequence = null");
    expect(migration.indexOf("set segment_sequence = null")).toBeLessThan(
      migration.indexOf("set card_segment = 'main'"),
    );
    expect(migration).toContain("'prelim-gable-steveson-sean-sharaf'");
    expect(migration).toContain("card_segment = 'main'");
    expect(migration).toContain("'card_segment', bout.card_segment");
  });
});
