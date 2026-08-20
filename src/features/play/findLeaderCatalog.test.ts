import { describe, expect, it } from "vitest";
import {
  buildFindLeaderBoard,
  findLeaderQuestions,
} from "./findLeaderEngine";

const SUPPLEMENTAL_CATEGORY_IDS = [
  "ufc-main-events-all-time",
  "ufc-bonus-awards-all-time",
  "first-round-ufc-finishes-all-time",
  "ufc-knockdowns-landed-all-time",
] as const;

const DEPTH_CATEGORY_IDS = [
  "ufc-fights-all-time",
  "title-fights-all-time",
  "title-fight-finishes-all-time",
  "title-fight-kos-all-time",
  "title-fight-submissions-all-time",
  "unique-title-opponents-faced",
  "unique-title-opponents-beaten",
  "unique-opponents-beaten",
  "unique-opponents-finished",
  "unique-ranked-opponents-beaten",
  "unique-top-five-opponents-beaten",
  "ranked-finishes-all-time",
  "top-five-finishes-all-time",
  "longest-ufc-finish-streak",
  "longest-ufc-ko-streak",
  "longest-ufc-submission-streak",
  "ufc-winning-years",
  "ufc-finishing-years",
  "ufc-active-years",
  "longest-ufc-fight-span",
  "rematch-wins-all-time",
  "avenged-losses-all-time",
  "repeat-opponent-wins-all-time",
  "wins-after-first-loss-all-time",
  "bounce-back-wins-all-time",
  "divisions-with-ufc-win",
  "divisions-with-ufc-finish",
  "most-ufc-wins-single-year",
  "most-ufc-finishes-single-year",
  "most-ufc-wins-one-opponent",
  ...SUPPLEMENTAL_CATEGORY_IDS,
] as const;

describe("Find the Leader category depth", () => {
  it("expands the catalog with materially different metric families", () => {
    const metrics = new Set(findLeaderQuestions.map((definition) => definition.metric));
    const families = new Set(findLeaderQuestions.map((definition) => definition.family));

    expect(findLeaderQuestions.length).toBeGreaterThanOrEqual(84);
    expect(metrics.size).toBeGreaterThanOrEqual(44);
    expect(families.has("volume")).toBe(true);
    expect(families.has("rivalry")).toBe(true);
    expect(families.has("versatility")).toBe(true);
    expect(families.has("supplemental")).toBe(true);
  });

  it("activates the UFCStats supplemental categories in the canonical catalog", () => {
    const definitions = new Map(findLeaderQuestions.map((definition) => [definition.id, definition]));
    const expectedMetrics = [
      "main-events",
      "bonus-awards",
      "first-round-finishes",
      "knockdowns-landed",
    ];

    SUPPLEMENTAL_CATEGORY_IDS.forEach((id, index) => {
      const definition = definitions.get(id);
      expect(definition, `missing ${id}`).toBeDefined();
      expect(definition?.family).toBe("supplemental");
      expect(definition?.metric).toBe(expectedMetrics[index]);
    });
  });

  it("keeps every new depth category buildable through the canonical board owner", () => {
    const definitions = new Map(findLeaderQuestions.map((definition) => [definition.id, definition]));

    DEPTH_CATEGORY_IDS.forEach((id) => {
      const definition = definitions.get(id);
      expect(definition, `missing ${id}`).toBeDefined();
      if (!definition) return;

      const board = buildFindLeaderBoard(definition, `catalog-depth|${id}`, "2026-08-19");
      expect(board, `invalid ${id}`).not.toBeNull();
      if (!board) return;

      expect(board.candidates).toHaveLength(10);
      expect(new Set(board.candidates.map((fighter) => fighter.id)).size).toBe(10);
      expect(board.candidates.some((fighter) => fighter.id === board.leaderId)).toBe(true);
    });
  });

  it("preserves the established categories while adding the deeper ones", () => {
    const ids = new Set(findLeaderQuestions.map((definition) => definition.id));
    const preserved = [
      "ufc-wins-all-time",
      "ufc-finishes-all-time",
      "submission-wins-all-time",
      "title-fight-wins-all-time",
      "women-ufc-wins-all-time",
      "lightweight-ufc-wins-all-time",
    ];

    [...preserved, ...DEPTH_CATEGORY_IDS].forEach((id) => {
      expect(ids.has(id), `missing ${id}`).toBe(true);
    });
  });
});
