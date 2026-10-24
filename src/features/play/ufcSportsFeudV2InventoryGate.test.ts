import { describe, expect, it } from "vitest";
import { UFC_SPORTS_FEUD_V2_LEGACY_REWRITE_CANDIDATES } from "./ufcSportsFeudV2LegacyRewriteCandidates";
import { UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT, UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT } from "./ufcSportsFeudV2RetainedDraft";
import { UFC_SPORTS_FEUD_V2_MAIN_DRAFT } from "./ufcSportsFeudV2MainDraft";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH2 } from "./ufcSportsFeudV2MainBatch2";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH3 } from "./ufcSportsFeudV2MainBatch3";
import { UFC_SPORTS_FEUD_V2_FAST_DRAFT } from "./ufcSportsFeudV2FastDraft";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH2 } from "./ufcSportsFeudV2FastBatch2";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH3 } from "./ufcSportsFeudV2FastBatch3";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH4 } from "./ufcSportsFeudV2MainBatch4";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH4 } from "./ufcSportsFeudV2FastBatch4";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH5 } from "./ufcSportsFeudV2MainBatch5";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH5_SUPPLEMENT } from "./ufcSportsFeudV2MainBatch5Supplement";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH5 } from "./ufcSportsFeudV2FastBatch5";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH5_SUPPLEMENT } from "./ufcSportsFeudV2FastBatch5Supplement";

describe("UFC Feud v2 staged, not-yet-approved inventory and coverage gates", () => {
  const main = [
    ...UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT,
    ...UFC_SPORTS_FEUD_V2_MAIN_DRAFT, ...UFC_SPORTS_FEUD_V2_MAIN_BATCH2,
    ...UFC_SPORTS_FEUD_V2_MAIN_BATCH3,
    ...UFC_SPORTS_FEUD_V2_MAIN_BATCH4,
    ...UFC_SPORTS_FEUD_V2_MAIN_BATCH5,
    ...UFC_SPORTS_FEUD_V2_MAIN_BATCH5_SUPPLEMENT,
    ...UFC_SPORTS_FEUD_V2_LEGACY_REWRITE_CANDIDATES,
  ];
  const fast = [
    ...UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT,
    ...UFC_SPORTS_FEUD_V2_FAST_DRAFT,
    ...UFC_SPORTS_FEUD_V2_FAST_BATCH2,
    ...UFC_SPORTS_FEUD_V2_FAST_BATCH3,
    ...UFC_SPORTS_FEUD_V2_FAST_BATCH4,
    ...UFC_SPORTS_FEUD_V2_FAST_BATCH5,
    ...UFC_SPORTS_FEUD_V2_FAST_BATCH5_SUPPLEMENT,
  ];

  it("tracks the staged Main and Fast shortfall separately from factual approval", () => {
    expect(UFC_SPORTS_FEUD_V2_LEGACY_REWRITE_CANDIDATES).toHaveLength(15);
    expect(main).toHaveLength(49);
    expect(fast).toHaveLength(92);
    expect(main.length).toBeGreaterThanOrEqual(20 * 2);
    // A sufficient Main count alone does not establish 20 semantic categories;
    // named-opponent and championship lists may still collide.
    // The five new country-fighter boards share a semantic category and
    // cannot be counted as five independent no-repeat slots.
    expect(fast.length).toBeLessThan(20 * 5);
    expect(main.length).toBeLessThan(70);
    expect(fast.length).toBeLessThan(140);
  });

  it("never treats a staged legacy rewrite as an approved content board", () => {
    const sourceIds = new Set();
    for (const q of UFC_SPORTS_FEUD_V2_LEGACY_REWRITE_CANDIDATES) {
      expect(q.needsAnswerReview, q.id).toBe(true);
      expect(q.proposedRound, q.id).toBe("Main");
      expect(q.answers, q.id).toHaveLength(8);
      expect(q.id).toBe("ufc-v2-rewrite-" + q.sourceId);
      expect(sourceIds.has(q.sourceId), "duplicate source: " + q.sourceId).toBe(false);
      sourceIds.add(q.sourceId);
    }
    const all = [...main, ...fast];
    expect(all).toHaveLength(141);
    expect(new Set(all.map(q => q.id)).size).toBe(141);
  });
});
