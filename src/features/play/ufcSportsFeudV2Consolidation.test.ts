import { describe, expect, it } from "vitest";
import {
  UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT,
  UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT,
} from "./ufcSportsFeudV2RetainedDraft";
import { UFC_SPORTS_FEUD_MAIN } from "./ufcSportsFeudMain";
import { UFC_SPORTS_FEUD_FAST_1 } from "./ufcSportsFeudFast1";
import { UFC_SPORTS_FEUD_FAST_2 } from "./ufcSportsFeudFast2";
import { UFC_SPORTS_FEUD_FAST_3 } from "./ufcSportsFeudFast3";
import { UFC_SPORTS_FEUD_FAST_4 } from "./ufcSportsFeudFast4";
import { UFC_SPORTS_FEUD_FAST_5 } from "./ufcSportsFeudFast5";
import { UFC_SPORTS_FEUD_V2_MAIN_DRAFT } from "./ufcSportsFeudV2MainDraft";
import { UFC_SPORTS_FEUD_V2_FAST_DRAFT } from "./ufcSportsFeudV2FastDraft";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH2 } from "./ufcSportsFeudV2MainBatch2";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH2 } from "./ufcSportsFeudV2FastBatch2";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH3 } from "./ufcSportsFeudV2MainBatch3";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH3 } from "./ufcSportsFeudV2FastBatch3";

describe("UFC Feud v2 editorial consolidation (never used by production)", () => {
  it("preserves unchanged 350 historical prompts while representing only one per kept family", () => {
    const original = [
      ...UFC_SPORTS_FEUD_MAIN, ...UFC_SPORTS_FEUD_FAST_1,
      ...UFC_SPORTS_FEUD_FAST_2, ...UFC_SPORTS_FEUD_FAST_3,
      ...UFC_SPORTS_FEUD_FAST_4, ...UFC_SPORTS_FEUD_FAST_5,
    ];
    const kept = [...UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT,
      ...UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT];
    expect(original).toHaveLength(350);
    expect(kept).toHaveLength(20);
    expect(UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT).toHaveLength(8);
    expect(UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT).toHaveLength(12);
    const allIDs = new Set(original.map(q => q.id));
    for (const q of kept) {
      expect(q.answers, q.id).toHaveLength(8);
      expect(q.id.startsWith("ufc-v2-retained-")).toBe(true);
      const oldID = q.id.replace("ufc-v2-retained-", "");
      expect(allIDs.has(oldID), q.id).toBe(true);
      const source = original.find(item => item.id === oldID)!;
      expect(q.prompt).toBe(source.prompt);
      expect(q.answers).toEqual(source.answers);
      expect(q.alsoAcceptedAnswers).toEqual(source.alsoAcceptedAnswers);
    }
    expect(new Set(kept.map(q => q.collisionGroup)).size).toBe(kept.length);
  });

  it("has 68 novel drafts plus 20 canonical legacy candidates, all with unique IDs", () => {
    const draft = [
      ...UFC_SPORTS_FEUD_V2_MAIN_DRAFT, ...UFC_SPORTS_FEUD_V2_FAST_DRAFT,
      ...UFC_SPORTS_FEUD_V2_MAIN_BATCH2, ...UFC_SPORTS_FEUD_V2_FAST_BATCH2,
      ...UFC_SPORTS_FEUD_V2_MAIN_BATCH3, ...UFC_SPORTS_FEUD_V2_FAST_BATCH3,
      ...UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT,
      ...UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT,
    ];
    expect(draft).toHaveLength(88);
    expect(new Set(draft.map(q => q.id)).size).toBe(88);
  });
});
