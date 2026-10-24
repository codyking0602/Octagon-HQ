import { describe,expect,it } from "vitest";
import { UFC_V2_NEW_MAIN_DRAFTS, UFC_V2_NEW_FAST_DRAFTS, UFC_V2_HELD_IDS,
  ufcV2ProvisionalInventory,ufcFeudSemanticFamily,ufcFeudSixMonthReleaseReadiness,
} from "./ufcSportsFeudV2EditorialReleaseGate";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH5 } from "./ufcSportsFeudV2FastBatch5";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH3 } from "./ufcSportsFeudV2MainBatch3";

describe("UFC Sports Feud six-month release gate — content cannot publish prematurely",()=>{
  it("accounts for all novel drafts and never guesses approval from a raw row count",()=>{
    expect(UFC_V2_NEW_MAIN_DRAFTS).toHaveLength(34);
    expect(UFC_V2_NEW_FAST_DRAFTS).toHaveLength(115);
    const all=[...UFC_V2_NEW_MAIN_DRAFTS,...UFC_V2_NEW_FAST_DRAFTS];
    expect(all).toHaveLength(149);
    expect(new Set(all.map(q=>q.id)).size).toBe(all.length);
    expect(new Set(all.map(q=>q.prompt)).size).toBe(all.length);
    const allIds=new Set(all.map(q=>q.id));
    for(const id of UFC_V2_HELD_IDS)expect(allIds.has(id), "held ID missing from drafts: "+id).toBe(true);
    const inventory=ufcV2ProvisionalInventory();
    expect(inventory.authoredNewMain+inventory.authoredNewFast).toBe(149);
    expect(inventory.stagedLegacyKeepMain).toBe(8);
    expect(inventory.stagedLegacyKeepFast).toBe(12);
    expect(inventory.unapprovedLegacyRewrites).toBe(15);
    expect(inventory.provisionalMainFamilies).toBeLessThanOrEqual(inventory.provisionalMainRows);
    expect(inventory.provisionalFastFamilies).toBeLessThanOrEqual(inventory.provisionalFastRows);
  });
  it("prevents country switches and numbered-event switches from inflating distinct topic counts",()=>{
    const nat=UFC_SPORTS_FEUD_V2_FAST_BATCH5.filter(q=>/fighters$/.test(q.id) &&
      /japanese|korean|polish|chinese|french/.test(q.id));
    expect(nat).toHaveLength(5);
    expect(new Set(nat.map(ufcFeudSemanticFamily)).size).toBe(1);
    const numbered=UFC_SPORTS_FEUD_V2_MAIN_BATCH3.filter(q=>/ufc100|ufc200|ufc300/.test(q.id));
    expect(numbered).toHaveLength(3);
    expect(new Set(numbered.map(ufcFeudSemanticFamily)).size).toBe(1);
  });
  it("uses the actual current UFC Daily calendar rather than assuming a 20-appearance six-month window",()=>{
    const readiness=ufcFeudSixMonthReleaseReadiness("2026-10-24","2027-04-24");
    expect(readiness.appearanceCount).toBe(24);
    expect(readiness.neededMainFamilies).toBe(48);
    expect(readiness.neededFastFamilies).toBe(120);
    // Raw rows may be sufficient one day; a first-pass review is still NOT production certification.
    expect(readiness.ready).toBe(false);
    expect(readiness.approvedMainFamilies).toBe(0);
    expect(readiness.approvedFastFamilies).toBe(0);
    expect(readiness.provisionalMainShortfall).toBeGreaterThan(0);
    expect(readiness.provisionalFastShortfall).toBeGreaterThan(0);
  });
});
