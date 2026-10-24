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
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH6 } from "./ufcSportsFeudV2MainBatch6";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH8 } from "./ufcSportsFeudV2MainBatch8";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH9 } from "./ufcSportsFeudV2MainBatch9";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH10 } from "./ufcSportsFeudV2MainBatch10";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH11 } from "./ufcSportsFeudV2MainBatch11";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH6 } from "./ufcSportsFeudV2FastBatch6";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH7 } from "./ufcSportsFeudV2FastBatch7";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH8 } from "./ufcSportsFeudV2FastBatch8";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH9 } from "./ufcSportsFeudV2FastBatch9";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH10 } from "./ufcSportsFeudV2FastBatch10";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH11 } from "./ufcSportsFeudV2FastBatch11";

describe("UFC Feud v2 staged, not-yet-approved inventory and coverage gates", () => {
  const main = [
    ...UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT,
    ...UFC_SPORTS_FEUD_V2_MAIN_DRAFT, ...UFC_SPORTS_FEUD_V2_MAIN_BATCH2,
    ...UFC_SPORTS_FEUD_V2_MAIN_BATCH3,
    ...UFC_SPORTS_FEUD_V2_MAIN_BATCH4,
    ...UFC_SPORTS_FEUD_V2_MAIN_BATCH5,
    ...UFC_SPORTS_FEUD_V2_MAIN_BATCH5_SUPPLEMENT,
    ...UFC_SPORTS_FEUD_V2_MAIN_BATCH6,
    ...UFC_SPORTS_FEUD_V2_MAIN_BATCH8,
    ...UFC_SPORTS_FEUD_V2_MAIN_BATCH9,
    ...UFC_SPORTS_FEUD_V2_MAIN_BATCH10,
    ...UFC_SPORTS_FEUD_V2_MAIN_BATCH11,
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
    ...UFC_SPORTS_FEUD_V2_FAST_BATCH6,
    ...UFC_SPORTS_FEUD_V2_FAST_BATCH7,
    ...UFC_SPORTS_FEUD_V2_FAST_BATCH8,
    ...UFC_SPORTS_FEUD_V2_FAST_BATCH9,
    ...UFC_SPORTS_FEUD_V2_FAST_BATCH10,
    ...UFC_SPORTS_FEUD_V2_FAST_BATCH11,
  ];

  it("distinguishes 85 Main and 209 Fast candidate rows from six-month approved inventory", () => {
    expect(UFC_SPORTS_FEUD_V2_LEGACY_REWRITE_CANDIDATES).toHaveLength(15);
    expect(main).toHaveLength(85);
    expect(fast).toHaveLength(209);
    expect(main.length).toBeGreaterThanOrEqual(20 * 2);
    // A sufficient Main count alone does not establish 20 semantic categories;
    // named-opponent and championship lists may still collide.
    // The five new country-fighter boards share a semantic category and
    // cannot be counted as five independent no-repeat slots.
    expect(fast.length).toBeGreaterThanOrEqual(20 * 5);
    // Raw rows exceed 100 but held questions and topic collisions prevent 100
    // independently approved Fast Money concepts.
    expect(main.length).toBeGreaterThanOrEqual(75);
    expect(fast.length).toBeGreaterThanOrEqual(185);
    // UFC currently has ~24 Sports Feud appearances / six months; 189 raw Fast
    // rows DO NOT mean 120 distinct verified semantic topics. Release gate proves
    // held/overlapping and unreviewed questions still prevent activation.
    expect(fast.length).toBeGreaterThanOrEqual(125);
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
    expect(all).toHaveLength(294);
    expect(new Set(all.map(q => q.id)).size).toBe(266);
  });
});
